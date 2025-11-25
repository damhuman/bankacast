"""Database models."""

from sqlalchemy import Column, String, BigInteger, Integer, DateTime, Index, ForeignKey
from sqlalchemy.sql import func
from database import Base


class Vault(Base):
    """Vault model - tracks on-chain vaults."""

    __tablename__ = "vaults"

    id = Column(Integer, primary_key=True, index=True)
    address = Column(String(42), unique=True, nullable=False, index=True)
    creator = Column(String(42), nullable=False, index=True)
    goal_amount = Column(BigInteger, nullable=False)  # Amount in token's native decimals
    metadata_uri = Column(String, nullable=False)

    # Off-chain metadata
    title = Column(String(200))
    description = Column(String(1000))
    image_url = Column(String(500))

    # Token info
    token = Column(String(42), nullable=False, index=True)  # address(0) for ETH, or token address
    decimals = Column(Integer, nullable=False)  # 6 for USDC, 18 for ETH
    token_symbol = Column(String(10), nullable=False)  # ETH, USDC, etc

    # Current state
    total_contributed = Column(BigInteger, default=0, nullable=False)
    current_balance = Column(BigInteger, default=0, nullable=False)  # Principal + yield from Aave
    yield_earned = Column(BigInteger, default=0, nullable=False)  # Yield earned from Aave
    current_apy = Column(BigInteger, default=0, nullable=False)  # APY in basis points (500 = 5%)
    status = Column(String(20), default="active", nullable=False, index=True)  # active, completed

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        Index('idx_creator_status', 'creator', 'status'),
    )


class Contribution(Base):
    """Contribution model - tracks all contributions to vaults."""

    __tablename__ = "contributions"

    id = Column(Integer, primary_key=True, index=True)
    vault_address = Column(String(42), ForeignKey('vaults.address'), nullable=False, index=True)
    contributor = Column(String(42), nullable=False, index=True)
    amount = Column(BigInteger, nullable=False)  # Amount in vault's token decimals
    tx_hash = Column(String(66), nullable=False, unique=True)
    block_number = Column(BigInteger)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        Index('idx_vault_contributor', 'vault_address', 'contributor'),
    )


class User(Base):
    """User model - tracks Farcaster users."""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    wallet_address = Column(String(42), unique=True, nullable=False, index=True)
    farcaster_fid = Column(String(50), unique=True, index=True)
    farcaster_username = Column(String(100))

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
