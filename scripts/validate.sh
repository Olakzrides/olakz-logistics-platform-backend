#!/bin/bash

# Olakz Backend Validation Script
# This script validates that all services are running correctly and endpoints are accessible

set -e

echo "🔍 Validating Olakz Backend Services..."
echo "======================================"

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

# Validation results
VALIDATION_ERRORS=0

# Function to increment error count
add_error() {
    VALIDATION_ERRORS=$((VALIDATION_ERRORS + 1))
}

# Check if services are running with PM2
print_status "Checking PM2 service status..."
if command -v pm2 &> /dev/null; then
    PM2_STATUS=$(pm2 jlist 2>/dev/null || echo "[]")
    
    # Check auth-service
    if echo "$PM2_STATUS" | grep -q '"name":"auth-service".*"status":"online"'; then
        print_success "Auth service is running"
    else
        print_error "Auth service is not running"
        add_error
    fi
    
    # Check core-logistics
    if echo "$PM2_STATUS" | grep -q '"name":"core-logistics".*"status":"online"'; then
        print_success "Core logistics service is running"
    else
        print_error "Core logistics service is not running"
        add_error
    fi
else
    print_warning "PM2 not found, skipping PM2 status check"
fi

# Check if ports are listening
print_status "Checking port availability..."

# Check port 4001 (auth-service)
if ss -tlnp | grep -q ":4001 "; then
    print_success "Port 4001 (auth-service) is listening"
    
    # Check if it's IPv4
    if ss -tlnp | grep -q "127.0.0.1:4001\|0.0.0.0:4001"; then
        print_success "Auth service is bound to IPv4"
    else
        print_warning "Auth service might be bound to IPv6 only"
    fi
else
    print_error "Port 4001 (auth-service) is not listening"
    add_error
fi

# Check port 4002 (core-logistics)
if ss -tlnp | grep -q ":4002 "; then
    print_success "Port 4002 (core-logistics) is listening"
    
    # Check if it's IPv4
    if ss -tlnp | grep -q "127.0.0.1:4002\|0.0.0.0:4002"; then
        print_success "Core logistics service is bound to IPv4"
    else
        print_warning "Core logistics service might be bound to IPv6 only"
    fi
else
    print_error "Port 4002 (core-logistics) is not listening"
    add_error
fi

# Test direct service endpoints
print_status "Testing direct service endpoints..."

# Test auth-service health
print_status "Testing auth-service health..."
AUTH_HEALTH=$(curl -s -w "%{http_code}" http://localhost:4001/health 2>/dev/null || echo "000")
if [[ "$AUTH_HEALTH" =~ 200$ ]]; then
    print_success "Auth service health check passed"
else
    print_error "Auth service health check failed (status: ${AUTH_HEALTH: -3})"
    add_error
fi

# Test core-logistics health
print_status "Testing core-logistics health..."
CORE_HEALTH=$(curl -s -w "%{http_code}" http://localhost:4002/health 2>/dev/null || echo "000")
if [[ "$CORE_HEALTH" =~ 200$ ]]; then
    print_success "Core logistics health check passed"
else
    print_error "Core logistics health check failed (status: ${CORE_HEALTH: -3})"
    add_error
fi

# Test specific API endpoints
print_status "Testing API endpoints..."

# Test auth login endpoint (should return 400/401, not 404)
AUTH_LOGIN=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4001/api/auth/login 2>/dev/null || echo "000")
if [ "$AUTH_LOGIN" = "404" ]; then
    print_error "Auth login endpoint not found (404) - route mounting issue"
    add_error
elif [ "$AUTH_LOGIN" = "000" ]; then
    print_error "Auth login endpoint unreachable"
    add_error
else
    print_success "Auth login endpoint accessible (status: $AUTH_LOGIN)"
fi

# Test store init endpoint
STORE_INIT=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4002/api/store/init 2>/dev/null || echo "000")
if [ "$STORE_INIT" = "404" ]; then
    print_error "Store init endpoint not found (404) - route mounting issue"
    add_error
elif [ "$STORE_INIT" = "000" ]; then
    print_error "Store init endpoint unreachable"
    add_error
else
    print_success "Store init endpoint accessible (status: $STORE_INIT)"
fi

# Test services context endpoint
SERVICES_CONTEXT=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4002/api/services/context 2>/dev/null || echo "000")
if [ "$SERVICES_CONTEXT" = "404" ]; then
    print_error "Services context endpoint not found (404) - route mounting issue"
    add_error
elif [ "$SERVICES_CONTEXT" = "000" ]; then
    print_error "Services context endpoint unreachable"
    add_error
else
    print_success "Services context endpoint accessible (status: $SERVICES_CONTEXT)"
fi

# Check nginx configuration and test proxied endpoints
if command -v nginx &> /dev/null && systemctl is-active --quiet nginx; then
    print_status "Testing nginx proxy endpoints..."
    
    # Get server name from nginx config
    SERVER_NAME=$(grep -o 'server_name [^;]*' /etc/nginx/nginx.conf 2>/dev/null | head -1 | cut -d' ' -f2 || echo "localhost")
    
    if [ "$SERVER_NAME" = "localhost" ]; then
        BASE_URL="http://localhost"
    else
        BASE_URL="https://$SERVER_NAME"
    fi
    
    print_status "Testing against: $BASE_URL"
    
    # Test health through nginx
    NGINX_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/health" 2>/dev/null || echo "000")
    if [ "$NGINX_HEALTH" = "502" ]; then
        print_error "Nginx cannot reach backend services (502 Bad Gateway)"
        add_error
    elif [ "$NGINX_HEALTH" = "000" ]; then
        print_error "Cannot reach nginx"
        add_error
    else
        print_success "Health endpoint accessible through nginx (status: $NGINX_HEALTH)"
    fi
    
    # Test auth through nginx
    NGINX_AUTH=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/auth/login" 2>/dev/null || echo "000")
    if [ "$NGINX_AUTH" = "502" ]; then
        print_error "Nginx cannot reach auth service (502 Bad Gateway)"
        add_error
    elif [ "$NGINX_AUTH" = "000" ]; then
        print_error "Cannot reach auth endpoint through nginx"
        add_error
    else
        print_success "Auth endpoint accessible through nginx (status: $NGINX_AUTH)"
    fi
    
    # Test store through nginx
    NGINX_STORE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/store/init" 2>/dev/null || echo "000")
    if [ "$NGINX_STORE" = "502" ]; then
        print_error "Nginx cannot reach core logistics service (502 Bad Gateway)"
        add_error
    elif [ "$NGINX_STORE" = "000" ]; then
        print_error "Cannot reach store endpoint through nginx"
        add_error
    else
        print_success "Store endpoint accessible through nginx (status: $NGINX_STORE)"
    fi
else
    print_warning "Nginx not running, skipping proxy endpoint tests"
fi

# Summary
echo ""
echo "======================================"
if [ $VALIDATION_ERRORS -eq 0 ]; then
    print_success "All validations passed! ✨"
    echo "Your backend services are running correctly."
else
    print_error "Validation failed with $VALIDATION_ERRORS error(s)"
    echo ""
    echo "Common fixes:"
    echo "1. If services aren't running: pm2 restart all"
    echo "2. If ports aren't listening: npm run build && pm2 restart all"
    echo "3. If endpoints return 404: Check route mounting in service code"
    echo "4. If nginx returns 502: Check service binding and nginx config"
    echo ""
    echo "For detailed logs: pm2 logs"
    exit 1
fi
echo "======================================"