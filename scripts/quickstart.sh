#!/bin/bash
# Banka Quick Start Script
# Automatically sets up and runs the entire Banka stack

set -e  # Exit on error

echo "🚀 Banka Quick Start"
echo "===================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check prerequisites
echo "📋 Checking prerequisites..."

command -v node >/dev/null 2>&1 || { echo -e "${RED}❌ Node.js not found. Install from https://nodejs.org/${NC}"; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo -e "${RED}❌ Python3 not found.${NC}"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo -e "${RED}❌ Docker not found. Install from https://docker.com/${NC}"; exit 1; }
command -v forge >/dev/null 2>&1 || { echo -e "${YELLOW}⚠️  Foundry not found. Install: curl -L https://foundry.paradigm.xyz | bash${NC}"; }

echo -e "${GREEN}✅ All prerequisites installed${NC}"
echo ""

# Setup database
echo "🗄️  Setting up PostgreSQL..."
if ! docker ps | grep -q banka-postgres; then
    docker run --name banka-postgres \
        -e POSTGRES_PASSWORD=banka \
        -e POSTGRES_USER=banka \
        -e POSTGRES_DB=banka \
        -p 5432:5432 \
        -d postgres:15 >/dev/null 2>&1
    echo -e "${GREEN}✅ PostgreSQL started${NC}"
else
    echo -e "${YELLOW}⚠️  PostgreSQL already running${NC}"
fi
sleep 3
echo ""

# Setup Backend
echo "🐍 Setting up Backend..."
cd backend

if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo -e "${GREEN}✅ Virtual environment created${NC}"
fi

source venv/bin/activate

if [ ! -f ".env" ]; then
    cp .env.example .env
    sed -i '' 's|postgresql://user:password@localhost:5432/banka|postgresql://banka:banka@localhost:5432/banka|' .env
    echo -e "${GREEN}✅ Backend .env created${NC}"
fi

pip install -q -r requirements.txt
echo -e "${GREEN}✅ Backend dependencies installed${NC}"

# Start backend in background
python main.py > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}✅ Backend started (PID: $BACKEND_PID)${NC}"

cd ..
echo ""

# Setup Frontend
echo "⚛️  Setting up Frontend..."
cd frontend

if [ ! -d "node_modules" ]; then
    npm install >/dev/null 2>&1
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
fi

if [ ! -f ".env.local" ]; then
    cp .env.local.example .env.local
    echo -e "${YELLOW}⚠️  Please edit frontend/.env.local with your Privy App ID${NC}"
    echo -e "${YELLOW}   Get it from: https://privy.io${NC}"
fi

# Start frontend in background
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}✅ Frontend started (PID: $FRONTEND_PID)${NC}"

cd ..
echo ""

# Print summary
echo "=========================================="
echo -e "${GREEN}🎉 Banka is running!${NC}"
echo "=========================================="
echo ""
echo "📍 Services:"
echo "   • Backend API: http://localhost:8000"
echo "   • API Docs:    http://localhost:8000/docs"
echo "   • Frontend:    http://localhost:3000"
echo "   • Database:    postgresql://banka:banka@localhost:5432/banka"
echo ""
echo "📝 Process IDs:"
echo "   • Backend:  $BACKEND_PID"
echo "   • Frontend: $FRONTEND_PID"
echo "   • Database: docker ps | grep banka-postgres"
echo ""
echo "📋 Next steps:"
echo "   1. Open http://localhost:3000"
echo "   2. Get Privy App ID from https://privy.io"
echo "   3. Edit frontend/.env.local"
echo "   4. Deploy contracts: cd contracts && forge script script/Deploy.s.sol --rpc-url https://sepolia.base.org --broadcast"
echo ""
echo "🛑 To stop everything:"
echo "   kill $BACKEND_PID $FRONTEND_PID && docker stop banka-postgres"
echo ""
echo "📊 View logs:"
echo "   • Backend:  tail -f logs/backend.log"
echo "   • Frontend: tail -f logs/frontend.log"
echo ""

# Create logs directory
mkdir -p logs

# Save PIDs
echo $BACKEND_PID > logs/backend.pid
echo $FRONTEND_PID > logs/frontend.pid

echo -e "${GREEN}✨ Setup complete! Happy coding!${NC}"
