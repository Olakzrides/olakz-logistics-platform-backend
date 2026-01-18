#!/bin/bash

# Olakz Backend Deployment Script
# This script handles the complete deployment process for the backend services

set -e  # Exit on any error

echo "🚀 Starting Olakz Backend Deployment..."
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "services" ]; then
    print_error "Please run this script from the olakz-logistics-platform-backend root directory"
    exit 1
fi

# Step 1: Install dependencies
print_status "Installing dependencies..."
npm install
print_success "Dependencies installed"

# Step 2: Build all services
print_status "Building all services..."
npm run build
print_success "All services built successfully"

# Step 3: Stop existing PM2 processes
print_status "Stopping existing PM2 processes..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true
print_success "Existing processes stopped"

# Step 4: Start services with PM2
print_status "Starting services with PM2..."
pm2 start ecosystem.config.js
print_success "Services started with PM2"

# Step 5: Wait for services to start
print_status "Waiting for services to initialize..."
sleep 5

# Step 6: Check service status
print_status "Checking service status..."
pm2 status

# Step 7: Test service health
print_status "Testing service health..."

# Test auth-service
if curl -f -s http://localhost:4001/health > /dev/null; then
    print_success "Auth service is healthy"
else
    print_error "Auth service health check failed"
    pm2 logs auth-service --lines 10
    exit 1
fi

# Test core-logistics
if curl -f -s http://localhost:4002/health > /dev/null; then
    print_success "Core logistics service is healthy"
else
    print_error "Core logistics service health check failed"
    pm2 logs core-logistics --lines 10
    exit 1
fi

# Step 8: Update nginx configuration if it exists
if [ -f "infrastructure/nginx/nginx.conf" ]; then
    print_status "Updating nginx configuration..."
    if sudo cp infrastructure/nginx/nginx.conf /etc/nginx/nginx.conf; then
        print_success "Nginx configuration updated"
        
        # Test nginx configuration
        if sudo nginx -t; then
            print_success "Nginx configuration is valid"
            
            # Reload nginx
            if sudo systemctl reload nginx; then
                print_success "Nginx reloaded successfully"
            else
                print_warning "Failed to reload nginx"
            fi
        else
            print_error "Nginx configuration is invalid"
            exit 1
        fi
    else
        print_warning "Could not update nginx configuration (permission denied?)"
    fi
else
    print_warning "Nginx configuration file not found, skipping nginx setup"
fi

# Step 9: Final validation
print_status "Running final validation..."

# Test endpoints through nginx (if available)
if command -v nginx &> /dev/null && systemctl is-active --quiet nginx; then
    print_status "Testing endpoints through nginx..."
    
    # Get the server name from nginx config or use localhost
    SERVER_NAME=$(grep -o 'server_name [^;]*' /etc/nginx/nginx.conf 2>/dev/null | head -1 | cut -d' ' -f2 || echo "localhost")
    
    if [ "$SERVER_NAME" = "localhost" ]; then
        BASE_URL="http://localhost"
    else
        BASE_URL="https://$SERVER_NAME"
    fi
    
    # Test health endpoint
    if curl -f -s "$BASE_URL/health" > /dev/null; then
        print_success "Health endpoint accessible through nginx"
    else
        print_warning "Health endpoint not accessible through nginx"
    fi
    
    # Test auth endpoint (expect 404 or auth error, not 502)
    AUTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/auth/login" || echo "000")
    if [ "$AUTH_STATUS" != "502" ] && [ "$AUTH_STATUS" != "000" ]; then
        print_success "Auth endpoint accessible through nginx (status: $AUTH_STATUS)"
    else
        print_warning "Auth endpoint returning 502 or unreachable (status: $AUTH_STATUS)"
    fi
    
    # Test store endpoint
    STORE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/store/init" || echo "000")
    if [ "$STORE_STATUS" != "502" ] && [ "$STORE_STATUS" != "000" ]; then
        print_success "Store endpoint accessible through nginx (status: $STORE_STATUS)"
    else
        print_warning "Store endpoint returning 502 or unreachable (status: $STORE_STATUS)"
    fi
fi

echo ""
echo "========================================"
print_success "Deployment completed successfully!"
echo "========================================"
echo ""
print_status "Service Status:"
pm2 status
echo ""
print_status "To monitor logs: pm2 logs"
print_status "To restart services: pm2 restart all"
print_status "To stop services: pm2 stop all"
echo ""