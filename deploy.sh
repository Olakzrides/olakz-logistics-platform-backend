#!/bin/bash

echo "🚀 Deploying Olakz Backend Services..."

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to build a service
build_service() {
    local service=$1
    echo -e "${YELLOW}📦 Building ${service}...${NC}"
    
    cd services/${service}
    
    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        echo -e "${RED}❌ package.json not found in ${service}${NC}"
        return 1
    fi
    
    # Build with timeout
    timeout 120s npm run build
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ ${service} built successfully${NC}"
        cd ../..
        return 0
    else
        echo -e "${RED}❌ Failed to build ${service}${NC}"
        cd ../..
        return 1
    fi
}

# Navigate to project root
cd ~/olakz-logistics-platform-backend

# Build each service
build_service "auth-service"
AUTH_BUILD=$?

build_service "core-logistics"
CORE_BUILD=$?

build_service "payment-service"
PAYMENT_BUILD=$?

# Check if all builds succeeded
if [ $AUTH_BUILD -eq 0 ] && [ $CORE_BUILD -eq 0 ] && [ $PAYMENT_BUILD -eq 0 ]; then
    echo -e "\n${GREEN}✨ All services built successfully!${NC}\n"
    
    # Stop existing PM2 processes
    echo -e "${YELLOW}🔄 Restarting PM2 services...${NC}"
    pm2 delete all 2>/dev/null || true
    
    # Start services with PM2
    pm2 start services/auth-service/dist/server.js --name auth-service
    pm2 start services/core-logistics/dist/server.js --name core-logistics
    pm2 start services/payment-service/dist/server.js --name payment-service
    
    # Save PM2 configuration
    pm2 save
    
    echo -e "\n${GREEN}🎉 Deployment complete!${NC}"
    echo -e "${YELLOW}📊 Service status:${NC}"
    pm2 status
else
    echo -e "\n${RED}❌ Some services failed to build. Please check the errors above.${NC}"
    exit 1
fi
