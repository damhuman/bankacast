"""Banka Backend API - No database version (reads from blockchain)."""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from datetime import datetime
import os
from dotenv import load_dotenv
from pydantic import BaseModel

from blockchain_service import get_blockchain_service

load_dotenv()

app = FastAPI(
    title="Banka API",
    description="Social savings vaults on Base - blockchain-native version",
    version="2.0.0",
)

# CORS middleware
allowed_origins = os.getenv("CORS_ORIGINS", "*").split(",")
if allowed_origins == ["*"]:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


# Response models
class ContributorInfo(BaseModel):
    address: str
    amount: int
    farcaster_username: Optional[str] = None


class VaultResponse(BaseModel):
    address: str
    creator: str
    goal_amount: int
    title: str
    description: Optional[str]
    image_url: Optional[str]
    total_contributed: int
    current_balance: int
    yield_earned: int
    progress: int
    contributors: List[ContributorInfo]
    status: str
    created_at: Optional[datetime]


class HealthResponse(BaseModel):
    status: str
    timestamp: datetime
    blockchain: str


class MetadataResponse(BaseModel):
    uri: str


class VaultCreate(BaseModel):
    title: str


# Global blockchain service
blockchain_service = None


@app.on_event("startup")
async def startup_event():
    """Initialize blockchain service on startup."""
    global blockchain_service
    try:
        blockchain_service = get_blockchain_service()
        print("✅ Connected to blockchain")
    except Exception as e:
        print(f"❌ Failed to connect to blockchain: {e}")
        raise


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint."""
    return {
        "name": "Banka API (Blockchain-native)",
        "version": "2.0.0",
        "docs": "/docs",
    }


@app.get("/api/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Health check endpoint."""
    blockchain_status = "connected" if blockchain_service and blockchain_service.w3.is_connected() else "disconnected"

    return HealthResponse(
        status="ok" if blockchain_status == "connected" else "degraded",
        timestamp=datetime.now(),
        blockchain=blockchain_status,
    )


@app.post("/api/metadata", response_model=MetadataResponse, tags=["Metadata"])
async def create_metadata(vault_data: VaultCreate):
    """
    Create vault metadata URI.
    Returns simple db:// format for MVP.
    """
    uri = f"db://{vault_data.title.replace(' ', '_').lower()}"
    return MetadataResponse(uri=uri)


@app.get("/api/vaults/{address}", response_model=VaultResponse, tags=["Vaults"])
async def get_vault(address: str):
    """Get vault details by address (reads from blockchain)."""
    if not blockchain_service:
        raise HTTPException(status_code=503, detail="Blockchain service not available")

    vault_data = blockchain_service.get_vault_data(address)

    if not vault_data:
        raise HTTPException(status_code=404, detail="Vault not found")

    return VaultResponse(**vault_data)


@app.get("/api/vaults", response_model=List[VaultResponse], tags=["Vaults"])
async def list_vaults(
    creator: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
):
    """List vaults (reads from blockchain)."""
    if not blockchain_service:
        raise HTTPException(status_code=503, detail="Blockchain service not available")

    # Get all vault addresses
    vault_addresses = blockchain_service.get_all_vaults()

    # Get data for each vault
    vaults = []
    for vault_addr in vault_addresses[offset:offset + limit]:
        vault_data = blockchain_service.get_vault_data(vault_addr)
        if vault_data:
            # Apply filters
            if creator and vault_data["creator"].lower() != creator.lower():
                continue
            if status and vault_data["status"] != status:
                continue

            vaults.append(VaultResponse(**vault_data))

    return vaults


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main_no_db:app",
        host=os.getenv("API_HOST", "0.0.0.0"),
        port=int(os.getenv("API_PORT", 8000)),
        reload=True,
    )
