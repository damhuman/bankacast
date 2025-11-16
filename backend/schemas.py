"""Pydantic schemas for API requests and responses."""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class VaultBase(BaseModel):
    """Base vault schema."""

    title: str = Field(..., max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    image_url: Optional[str] = Field(None, max_length=500)


class VaultCreate(VaultBase):
    """Schema for creating vault metadata."""

    pass


class ContributorInfo(BaseModel):
    """Contributor information."""

    address: str
    amount: int
    farcaster_username: Optional[str] = None

    class Config:
        from_attributes = True


class VaultResponse(BaseModel):
    """Vault response schema."""

    address: str
    creator: str
    goal_amount: int
    deadline: int
    title: Optional[str]
    description: Optional[str]
    image_url: Optional[str]
    total_contributed: int
    current_balance: int = 0
    yield_earned: int = 0
    progress: int = 0
    contributors: List[ContributorInfo] = []
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class MetadataResponse(BaseModel):
    """Metadata upload response."""

    uri: str


class HealthResponse(BaseModel):
    """Health check response."""

    status: str
    timestamp: datetime
    database: str
    blockchain: str
