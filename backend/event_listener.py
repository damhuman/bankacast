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
            {"indexed": False, "name": "metadataURI", "type": "string"},
            {"indexed": False, "name": "description", "type": "string"},
            {"indexed": True, "name": "token", "type": "address"},
            {"indexed": False, "name": "tokenDecimals", "type": "uint8"},
            {"indexed": False, "name": "timestamp", "type": "uint256"},
            {"indexed": False, "name": "vaultIndex", "type": "uint256"},
        ],
        "name": "VaultCreated",
        "type": "event",
    }
]

# Token addresses
ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"
WETH_ADDRESS = "0x4200000000000000000000000000000000000006"
USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e"

VAULT_ABI = [
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "name": "contributor", "type": "address"},
            {"indexed": False, "name": "amount", "type": "uint256"},
            {"indexed": False, "name": "totalContributed", "type": "uint256"},
            {"indexed": False, "name": "currentYield", "type": "uint256"},
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
        "name": "Smashed",
        "type": "event",
    },
    {
        "inputs": [],
        "name": "getCurrentAPY",
        "outputs": [{"name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getYieldStats",
        "outputs": [
            {"name": "principal", "type": "uint256"},
            {"name": "currentBalance", "type": "uint256"},
            {"name": "yieldEarned", "type": "uint256"},
            {"name": "yieldPercentage", "type": "uint256"},
            {"name": "currentAPY", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
]


def get_token_symbol(token_address: str) -> tuple[str, int]:
    """Get token symbol and decimals from address."""
    token_lower = token_address.lower()

    if token_lower == ZERO_ADDRESS.lower():
        return ("ETH", 18)
    elif token_lower == USDC_ADDRESS.lower():
        return ("USDC", 6)
    elif token_lower == WETH_ADDRESS.lower():
        return ("WETH", 18)
    else:
        return ("UNKNOWN", 18)


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
                        from_block=self.last_block + 1, to_block=current_block
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
            metadata_uri = event["args"]["metadataURI"]
            description = event["args"]["description"]
            token = event["args"]["token"]
            token_decimals = event["args"]["tokenDecimals"]

            # Check if vault already exists
            existing = db.query(Vault).filter(Vault.address == vault_address).first()
            if existing:
                print(f"Vault {vault_address} already indexed")
                return

            # Get token symbol
            token_symbol, decimals = get_token_symbol(token)

            # Parse metadata_uri to get title
            # For MVP: metadata_uri is like "db://emergency_fund"
            title = metadata_uri.replace("db://", "").replace("_", " ").title()

            # Create vault record
            vault = Vault(
                address=vault_address,
                creator=creator,
                goal_amount=goal_amount,
                metadata_uri=metadata_uri,
                title=title,
                description=description,
                token=token.lower(),
                decimals=token_decimals,
                token_symbol=token_symbol,
                total_contributed=0,
                current_balance=0,
                yield_earned=0,
                current_apy=0,
                status="active",
            )

            db.add(vault)
            db.commit()

            print(f"✅ Indexed new vault: {vault_address} ({token_symbol}) by {creator}")

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
                from_block=from_block, to_block=current_block
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
            current_yield = event["args"]["currentYield"]
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

            # Update vault total and yield
            vault = (
                db.query(Vault).filter(Vault.address == vault_address.lower()).first()
            )
            if vault:
                vault.total_contributed = total_contributed
                vault.yield_earned = current_yield
                vault.current_balance = total_contributed + current_yield

                # Update APY and yield stats from contract
                try:
                    vault_contract = self.w3.eth.contract(
                        address=Web3.to_checksum_address(vault_address), abi=VAULT_ABI
                    )
                    apy = vault_contract.functions.getCurrentAPY().call()
                    vault.current_apy = apy
                except Exception as e:
                    print(f"Could not fetch APY for {vault_address}: {e}")

                # Update status if goal reached
                if total_contributed >= vault.goal_amount:
                    vault.status = "completed"

            db.commit()

            # Format amount based on vault decimals
            amount_formatted = amount / (10 ** vault.decimals) if vault else amount / 1e6
            print(
                f"✅ Indexed contribution: {amount_formatted} {vault.token_symbol if vault else 'tokens'} to {vault_address} from {contributor}"
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
