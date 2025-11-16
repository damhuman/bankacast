"""Blockchain service for reading vault data directly from contracts."""

from web3 import Web3
from typing import Optional, List, Dict, Any
import os
from dotenv import load_dotenv

load_dotenv()

# Contract ABIs
FACTORY_ABI = [
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "name": "vault", "type": "address"},
            {"indexed": True, "name": "creator", "type": "address"},
            {"indexed": False, "name": "goalAmount", "type": "uint256"},
            {"indexed": False, "name": "deadline", "type": "uint256"},
            {"indexed": False, "name": "metadataURI", "type": "string"},
            {"indexed": False, "name": "timestamp", "type": "uint256"},
            {"indexed": False, "name": "vaultIndex", "type": "uint256"}
        ],
        "name": "VaultCreated",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "getAllVaults",
        "outputs": [{"name": "", "type": "address[]"}],
        "stateMutability": "view",
        "type": "function"
    }
]

VAULT_ABI = [
    {
        "inputs": [],
        "name": "creator",
        "outputs": [{"name": "", "type": "address"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "goalAmount",
        "outputs": [{"name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "deadline",
        "outputs": [{"name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "metadataURI",
        "outputs": [{"name": "", "type": "string"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalContributed",
        "outputs": [{"name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getCurrentBalance",
        "outputs": [{"name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getYieldEarned",
        "outputs": [{"name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getContributors",
        "outputs": [{"name": "", "type": "address[]"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"name": "contributor", "type": "address"}],
        "name": "contributions",
        "outputs": [{"name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    }
]


class BlockchainService:
    """Service for reading vault data from blockchain."""

    def __init__(self):
        rpc_url = os.getenv("RPC_URL", "https://sepolia.base.org")

        # Try with request_kwargs for timeout
        from web3 import HTTPProvider
        provider = HTTPProvider(rpc_url, request_kwargs={'timeout': 60})
        self.w3 = Web3(provider)

        # Test connection with simple call
        try:
            self.w3.eth.block_number
            print(f"✅ Connected to {rpc_url}")
        except Exception as e:
            print(f"⚠️  Warning: Could not verify RPC connection: {e}")
            # Don't raise, allow to continue

        factory_address = os.getenv("FACTORY_ADDRESS")
        if not factory_address:
            raise Exception("FACTORY_ADDRESS not set in environment")

        self.factory_address = Web3.to_checksum_address(factory_address)
        self.factory_contract = self.w3.eth.contract(
            address=self.factory_address,
            abi=FACTORY_ABI
        )

    def get_vault_data(self, vault_address: str) -> Optional[Dict[str, Any]]:
        """Get vault data from blockchain."""
        try:
            # Checksum address
            vault_address = Web3.to_checksum_address(vault_address)

            # Create vault contract instance
            vault_contract = self.w3.eth.contract(
                address=vault_address,
                abi=VAULT_ABI
            )

            # Read data from contract
            creator = vault_contract.functions.creator().call()
            goal_amount = vault_contract.functions.goalAmount().call()
            deadline = vault_contract.functions.deadline().call()
            metadata_uri = vault_contract.functions.metadataURI().call()
            total_contributed = vault_contract.functions.totalContributed().call()

            # Try to get current balance and yield (may fail on some vaults)
            try:
                current_balance = vault_contract.functions.getCurrentBalance().call()
                yield_earned = vault_contract.functions.getYieldEarned().call()
            except Exception:
                current_balance = total_contributed
                yield_earned = 0

            # Get contributors
            try:
                contributors = vault_contract.functions.getContributors().call()
            except Exception:
                contributors = []

            # Parse metadata URI (format: "db://title")
            title = "Savings Vault"
            if metadata_uri.startswith("db://"):
                title = metadata_uri.replace("db://", "").replace("_", " ").title()

            # Calculate progress
            progress = 0
            if goal_amount > 0:
                progress = int((total_contributed * 100) / goal_amount)
                if progress > 100:
                    progress = 100

            # Determine status
            status = "active"
            current_time = self.w3.eth.get_block('latest')['timestamp']
            if current_time > deadline:
                status = "expired"
            if total_contributed >= goal_amount:
                status = "completed"

            # Get contributor details
            contributor_list = []
            for contributor_addr in contributors:
                try:
                    amount = vault_contract.functions.contributions(contributor_addr).call()
                    contributor_list.append({
                        "address": contributor_addr,
                        "amount": amount,
                        "farcaster_username": None
                    })
                except Exception:
                    continue

            return {
                "address": vault_address.lower(),
                "creator": creator.lower(),
                "goal_amount": goal_amount,
                "deadline": deadline,
                "title": title,
                "description": None,
                "image_url": None,
                "total_contributed": total_contributed,
                "current_balance": current_balance,
                "yield_earned": yield_earned,
                "progress": progress,
                "contributors": contributor_list,
                "status": status,
                "created_at": None  # Would need to parse from VaultCreated event
            }

        except Exception as e:
            print(f"Error reading vault {vault_address}: {e}")
            return None

    def get_all_vaults(self) -> List[str]:
        """Get all vault addresses from factory."""
        try:
            # Get all vaults using getAllVaults()
            vaults = self.factory_contract.functions.getAllVaults().call()
            print(f"Total vaults on chain: {len(vaults)}")
            return [v.lower() for v in vaults]
        except Exception as e:
            print(f"Error getting all vaults: {e}")
            return []


# Global instance
_blockchain_service: Optional[BlockchainService] = None


def get_blockchain_service() -> BlockchainService:
    """Get or create blockchain service instance."""
    global _blockchain_service
    if _blockchain_service is None:
        _blockchain_service = BlockchainService()
    return _blockchain_service
