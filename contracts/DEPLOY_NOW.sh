#!/bin/bash
# Quick deployment script for Base Sepolia

echo "🚀 Banka Deployment to Base Sepolia"
echo "===================================="
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    echo ""
    echo "Create .env file first:"
    echo "cp .env.example .env"
    echo "nano .env"
    echo ""
    echo "Add your PRIVATE_KEY (without 0x prefix)"
    exit 1
fi

# Load .env
source .env

# Check if PRIVATE_KEY is set
if [ -z "$PRIVATE_KEY" ] || [ "$PRIVATE_KEY" = "0x0000000000000000000000000000000000000000000000000000000000000000" ]; then
    echo "❌ PRIVATE_KEY not set in .env!"
    echo ""
    echo "Edit .env and add your private key:"
    echo "PRIVATE_KEY=your_key_without_0x_prefix"
    exit 1
fi

echo "✅ .env file loaded"
echo ""

# Get deployer address
DEPLOYER=$(cast wallet address --private-key $PRIVATE_KEY)
echo "📍 Deployer address: $DEPLOYER"
echo ""

# Check balance
echo "💰 Checking balance..."
BALANCE=$(cast balance $DEPLOYER --rpc-url https://sepolia.base.org)
BALANCE_ETH=$(cast --to-unit $BALANCE ether)
echo "   Balance: $BALANCE_ETH ETH"
echo ""

if [ $(echo "$BALANCE_ETH < 0.002" | bc) -eq 1 ]; then
    echo "⚠️  Low balance! You may need more ETH"
    echo "   Get testnet ETH from:"
    echo "   https://www.coinbase.com/faucets/base-ethereum-goerli-faucet"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Dry run first
echo "🧪 Running dry run (simulation)..."
forge script script/Deploy.s.sol \
    --rpc-url https://sepolia.base.org \
    -vv

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Dry run failed!"
    echo "   Fix errors before deploying"
    exit 1
fi

echo ""
echo "✅ Dry run successful!"
echo ""
read -p "🚀 Deploy to Base Sepolia? This will cost ~0.003 ETH (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled"
    exit 0
fi

echo ""
echo "🚀 Deploying contracts..."
echo ""

# Real deployment
forge script script/Deploy.s.sol \
    --rpc-url https://sepolia.base.org \
    --broadcast \
    --verify \
    -vvvv \
    | tee deployment.log

if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "✅ Deployment successful!"
    echo "=========================================="
    echo ""
    echo "📝 Next steps:"
    echo "1. Check deployment.log for contract addresses"
    echo "2. Copy VaultFactory address"
    echo "3. Update ../backend/.env with FACTORY_ADDRESS"
    echo "4. Update ../frontend/.env.local with NEXT_PUBLIC_FACTORY_ADDRESS"
    echo "5. Restart backend and frontend"
    echo ""
    echo "🔍 View on Basescan:"
    echo "   https://sepolia.basescan.org/address/YOUR_FACTORY_ADDRESS"
    echo ""
else
    echo ""
    echo "❌ Deployment failed!"
    echo "   Check errors above"
    exit 1
fi
