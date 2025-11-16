"""Banka Backend API - FastAPI application."""

from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import os
from dotenv import load_dotenv

from database import get_db, init_db
from models import Vault, Contribution, User
from schemas import (
    VaultCreate,
    VaultResponse,
    MetadataResponse,
    HealthResponse,
    ContributorInfo,
)

load_dotenv()

app = FastAPI(
    title="Banka API",
    description="Social savings vaults on Base with automated yield",
    version="1.0.0",
)

# CORS middleware
# Allow specific origins from environment variable, or all origins in development
allowed_origins = os.getenv("CORS_ORIGINS", "*").split(",")
if allowed_origins == ["*"]:
    # In development, allow all origins
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,  # Must be False when allow_origins is "*"
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    # In production, allow specific origins with credentials
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


# WebSocket connection manager
class ConnectionManager:
    """Manage WebSocket connections for real-time updates."""

    def __init__(self):
        self.active_connections: dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, vault_address: str):
        await websocket.accept()
        if vault_address not in self.active_connections:
            self.active_connections[vault_address] = []
        self.active_connections[vault_address].append(websocket)

    def disconnect(self, websocket: WebSocket, vault_address: str):
        if vault_address in self.active_connections:
            self.active_connections[vault_address].remove(websocket)

    async def broadcast(self, vault_address: str, message: dict):
        if vault_address in self.active_connections:
            for connection in self.active_connections[vault_address]:
                await connection.send_json(message)


manager = ConnectionManager()


@app.on_event("startup")
async def startup_event():
    """Initialize database on startup."""
    init_db()


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint."""
    return {
        "name": "Banka API",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/api/health", response_model=HealthResponse, tags=["Health"])
async def health_check(db: Session = Depends(get_db)):
    """Health check endpoint."""
    try:
        # Check database
        db.execute("SELECT 1")
        db_status = "connected"
    except Exception:
        db_status = "disconnected"

    return HealthResponse(
        status="ok" if db_status == "connected" else "degraded",
        timestamp=datetime.now(),
        database=db_status,
        blockchain="connected",  # TODO: Check RPC connection
    )


@app.post("/api/metadata", response_model=MetadataResponse, tags=["Metadata"])
async def create_metadata(
    vault_data: VaultCreate,
    db: Session = Depends(get_db),
):
    """
    Create vault metadata and return URI.
    For MVP, we just store in database and return a DB ID as URI.
    In production, upload to IPFS.
    """
    # For MVP: Just return a simple URI format
    # In production: Upload to IPFS and return ipfs://...
    uri = f"db://{vault_data.title.replace(' ', '_').lower()}"

    return MetadataResponse(uri=uri)


@app.get("/api/vaults/{address}", response_model=VaultResponse, tags=["Vaults"])
async def get_vault(
    address: str,
    db: Session = Depends(get_db),
):
    """Get vault details by address."""
    vault = db.query(Vault).filter(Vault.address == address.lower()).first()

    if not vault:
        raise HTTPException(status_code=404, detail="Vault not found")

    # Get contributors
    contributions = (
        db.query(Contribution)
        .filter(Contribution.vault_address == address.lower())
        .all()
    )

    # Aggregate contributions by contributor
    contributor_map = {}
    for contrib in contributions:
        if contrib.contributor not in contributor_map:
            contributor_map[contrib.contributor] = 0
        contributor_map[contrib.contributor] += contrib.amount

    # Get Farcaster usernames
    contributors_list = []
    for addr, amount in contributor_map.items():
        user = db.query(User).filter(User.wallet_address == addr.lower()).first()
        contributors_list.append(
            ContributorInfo(
                address=addr,
                amount=amount,
                farcaster_username=user.farcaster_username if user else None,
            )
        )

    # Calculate progress
    progress = (
        int((vault.total_contributed * 100) / vault.goal_amount)
        if vault.goal_amount > 0
        else 0
    )

    # Ensure default values for nullable fields (migration compatibility)
    current_balance = vault.current_balance if vault.current_balance is not None else 0
    yield_earned = vault.yield_earned if vault.yield_earned is not None else 0
    current_apy = vault.current_apy if vault.current_apy is not None else 0

    return VaultResponse(
        address=vault.address,
        creator=vault.creator,
        goal_amount=vault.goal_amount,
        title=vault.title,
        description=vault.description,
        image_url=vault.image_url,
        total_contributed=vault.total_contributed,
        current_balance=current_balance,
        yield_earned=yield_earned,
        current_apy=current_apy,
        progress=progress,
        contributors=contributors_list,
        status=vault.status,
        created_at=vault.created_at,
    )


@app.get("/api/vaults", response_model=List[VaultResponse], tags=["Vaults"])
async def list_vaults(
    creator: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
):
    """List vaults with optional filters."""
    query = db.query(Vault)

    if creator:
        query = query.filter(Vault.creator == creator.lower())

    if status:
        query = query.filter(Vault.status == status)

    vaults = query.order_by(Vault.created_at.desc()).offset(offset).limit(limit).all()

    # Convert to response format
    # For list view, we don't need full contributor details
    results = []
    for vault in vaults:
        progress = (
            int((vault.total_contributed * 100) / vault.goal_amount)
            if vault.goal_amount > 0
            else 0
        )

        results.append(
            VaultResponse(
                address=vault.address,
                creator=vault.creator,
                goal_amount=vault.goal_amount,
                title=vault.title,
                description=vault.description,
                image_url=vault.image_url,
                total_contributed=vault.total_contributed,
                current_balance=vault.current_balance,
                yield_earned=vault.yield_earned,
                current_apy=vault.current_apy,
                progress=progress,
                contributors=[],
                status=vault.status,
                created_at=vault.created_at,
            )
        )

    return results


@app.websocket("/ws/vault/{address}")
async def websocket_endpoint(websocket: WebSocket, address: str):
    """WebSocket endpoint for real-time vault updates."""
    await manager.connect(websocket, address.lower())
    try:
        while True:
            # Keep connection alive
            data = await websocket.receive_text()
            # Echo back for now (in production, handle specific messages)
            await websocket.send_json({"type": "pong", "message": data})
    except WebSocketDisconnect:
        manager.disconnect(websocket, address.lower())


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host=os.getenv("API_HOST", "0.0.0.0"),
        port=int(os.getenv("API_PORT", 8000)),
        reload=True,
    )
