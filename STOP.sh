#!/bin/bash
# Banka Stop Script
# Stops all running Banka services

set -e

echo "🛑 Stopping Banka services..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Stop backend
if [ -f "logs/backend.pid" ]; then
    BACKEND_PID=$(cat logs/backend.pid)
    if kill -0 $BACKEND_PID 2>/dev/null; then
        kill $BACKEND_PID
        echo -e "${GREEN}✅ Backend stopped (PID: $BACKEND_PID)${NC}"
    else
        echo -e "${YELLOW}⚠️  Backend not running${NC}"
    fi
    rm logs/backend.pid
fi

# Stop frontend
if [ -f "logs/frontend.pid" ]; then
    FRONTEND_PID=$(cat logs/frontend.pid)
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        kill $FRONTEND_PID
        echo -e "${GREEN}✅ Frontend stopped (PID: $FRONTEND_PID)${NC}"
    else
        echo -e "${YELLOW}⚠️  Frontend not running${NC}"
    fi
    rm logs/frontend.pid
fi

# Stop database
if docker ps | grep -q banka-postgres; then
    docker stop banka-postgres >/dev/null 2>&1
    echo -e "${GREEN}✅ PostgreSQL stopped${NC}"
else
    echo -e "${YELLOW}⚠️  PostgreSQL not running${NC}"
fi

echo ""
echo -e "${GREEN}🎉 All Banka services stopped${NC}"
echo ""
echo "To start again: ./QUICKSTART.sh"
