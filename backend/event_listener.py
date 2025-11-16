"""Blockchain event listener - indexes events from smart contracts."""

import asyncio
import os
from web3 import Web3
from sqlalchemy.orm import Session
from datetime import datetime
from dotenv import load_dotenv

from database import SessionLocal
from models import Vault, Contribution

load_dotenv()

# Contract ABIs (minimal for events)
VAULT_FACTORY_ABI = [
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "name": "vault", "type": "address"},
            {"indexed": True, "name": "creator", "type": "address"},
            {"indexed": False, "name": "goalAmount", "type": "uint256"},
            {"indexed": False, "name": "deadline", "type": "uint256"},
            {"indexed": False, "name": "metadataURI", "type": "string"},
            {"indexed": False, "name": "timestamp", "type": "uint256"},
            {"indexed": False, "name": "vaultIndex", "type": "uint256"},
        ],
        "name": "VaultCreated",
        "type": "event",
    }
]

VAULT_ABI = [
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "name": "contributor", "type": "address"},
            {"indexed": False, "name": "amount", "type": "uint256"},
            {"indexed": False, "name": "totalContributed", "type": "uint256"},
            {"indexed": False, "name": "timestamp", "type": "uint256"},
        ],
        "name": "Contributed",
        "type": "event",
    },
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "name": "creator", "type": "address"},
            {"indexed": False, "name": "principal", "type": "uint256"},
            {"indexed": False, "name": "yield", "type": "uint256"},
            {"indexed": False, "name": "total", "type": "uint256"},
            {"indexed": False, "name": "timestamp", "type": "uint256"},
        ],
        "name": "Withdrawn",
        "type": "event"},
]


class EventListener:
    """Listen to blockchain events and update database."""

    def __init__(self):
        self.rpc_url = os.getenv("BASE_RPC_URL", "https://sepolia.base.org")
        self.factory_address = os.getenv("FACTORY_ADDRESS")
        self.w3 = Web3(Web3.HTTPProvider(self.rpc_url))

        if not self.factory_address:
            raise ValueError("FACTORY_ADDRESS not set in environment")

        self.factory_contract = self.w3.eth.contract(
            address=Web3.to_checksum_address(self.factory_address),
            abi=VAULT_FACTORY_ABI,
        )

        self.last_block = self.w3.eth.block_number
        print(f"EventListener initialized at block {self.last_block}")

    def get_db(self) -> Session:
        """Get database session."""
        return SessionLocal()

    async def listen_vault_created(self):
        """Listen for VaultCreated events."""
        print("Listening for VaultCreated events...")

        while True:
            try:
                current_block = self.w3.eth.block_number

                if current_block > self.last_block:
                    # Get events since last check
                    events = self.factory_contract.events.VaultCreated.get_logs(
                        fromBlock=self.last_block + 1, toBlock=current_block
                    )

                    for event in events:
                        await self.handle_vault_created(event)

                    self.last_block = current_block

            except Exception as e:
                print(f"Error in listen_vault_created: {e}")

            await asyncio.sleep(5)  # Poll every 5 seconds

    async def handle_vault_created(self, event):
        """Handle VaultCreated event."""
        db = self.get_db()
        try:
            vault_address = event["args"]["vault"].lower()
            creator = event["args"]["creator"].lower()
            goal_amount = event["args"]["goalAmount"]
            deadline = event["args"]["deadline"]
            metadata_uri = event["args"]["metadataURI"]

            # Check if vault already exists
            existing = db.query(Vault).filter(Vault.address == vault_address).first()
            if existing:
                print(f"Vault {vault_address} already indexed")
                return

            # Parse metadata_uri to get title/description
            # For MVP: metadata_uri is like "db://emergency_fund"
            title = metadata_uri.replace("db://", "").replace("_", " ").title()

            # Create vault record
            vault = Vault(
                address=vault_address,
                creator=creator,
                goal_amount=goal_amount,
                deadline=deadline,
                metadata_uri=metadata_uri,
                title=title,
                total_contributed=0,
                status="active",
            )

            db.add(vault)
            db.commit()

            print(f"✅ Indexed new vault: {vault_address} by {creator}")

        except Exception as e:
            print(f"Error handling VaultCreated event: {e}")
            db.rollback()
        finally:
            db.close()

    async def listen_contributions(self):
        """Listen for Contributed events from all vaults."""
        print("Listening for Contributed events...")

        while True:
            try:
                db = self.get_db()

                # Get all vaults from database
                vaults = db.query(Vault).filter(Vault.status == "active").all()

                for vault in vaults:
                    await self.check_vault_contributions(vault.address)

                db.close()

            except Exception as e:
                print(f"Error in listen_contributions: {e}")

            await asyncio.sleep(10)  # Poll every 10 seconds

    async def check_vault_contributions(self, vault_address: str):
        """Check for new contributions to a specific vault."""
        db = self.get_db()
        try:
            vault_contract = self.w3.eth.contract(
                address=Web3.to_checksum_address(vault_address), abi=VAULT_ABI
            )

            # Get last indexed block for this vault
            last_contribution = (
                db.query(Contribution)
                .filter(Contribution.vault_address == vault_address.lower())
                .order_by(Contribution.block_number.desc())
                .first()
            )

            from_block = (
                last_contribution.block_number + 1
                if last_contribution and last_contribution.block_number
                else self.last_block
            )

            current_block = self.w3.eth.block_number

            # Get Contributed events
            events = vault_contract.events.Contributed.get_logs(
                fromBlock=from_block, toBlock=current_block
            )

            for event in events:
                await self.handle_contribution(event, vault_address, db)

        except Exception as e:
            print(f"Error checking contributions for {vault_address}: {e}")
        finally:
            db.close()

    async def handle_contribution(self, event, vault_address: str, db: Session):
        """Handle Contributed event."""
        try:
            contributor = event["args"]["contributor"].lower()
            amount = event["args"]["amount"]
            total_contributed = event["args"]["totalContributed"]
            tx_hash = event["transactionHash"].hex()
            block_number = event["blockNumber"]

            # Check if contribution already indexed
            existing = (
                db.query(Contribution).filter(Contribution.tx_hash == tx_hash).first()
            )
            if existing:
                return

            # Create contribution record
            contribution = Contribution(
                vault_address=vault_address.lower(),
                contributor=contributor,
                amount=amount,
                tx_hash=tx_hash,
                block_number=block_number,
            )

            db.add(contribution)

            # Update vault total
            vault = (
                db.query(Vault).filter(Vault.address == vault_address.lower()).first()
            )
            if vault:
                vault.total_contributed = total_contributed

                # Update status if goal reached
                if total_contributed >= vault.goal_amount:
                    vault.status = "completed"

            db.commit()

            print(
                f"✅ Indexed contribution: {amount / 1e6} USDC to {vault_address} from {contributor}"
            )

            # TODO: Broadcast via WebSocket to connected clients

        except Exception as e:
            print(f"Error handling Contributed event: {e}")
            db.rollback()


async def main():
    """Main event listener loop."""
    listener = EventListener()

    # Run both listeners concurrently
    await asyncio.gather(
        listener.listen_vault_created(), listener.listen_contributions()
    )


if __name__ == "__main__":
    print("🚀 Starting Banka Event Listener...")
    asyncio.run(main())
