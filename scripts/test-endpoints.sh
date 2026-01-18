#!/bin/bash

# Endpoint Connectivity Test Script
# Tests all documented API endpoints for basic connectivity

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
AUTH_PORT=4001
CORE_PORT=4002
BASE_URL_AUTH="http://localhost:${AUTH_PORT}"
BASE_URL_CORE="http://localhost:${CORE_PORT}"

# Test results
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to test endpoint
test_endpoint() {
    local method=$1
    local url=$2
    local expected_status=$3
    local description=$4
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo -n "Testing: $description... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
    elif [ "$method" = "POST" ]; then
        response=$(curl -s -o /dev/null -w "%{http_code}" -X POST -H "Content-Type: application/json" -d '{}' "$url" 2>/dev/null || echo "000")
    fi
    
    if [ "$response" = "$expected_status" ]; then
        echo -e "${GREEN}PASS${NC} (HTTP $response)"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}FAIL${NC} (Expected HTTP $expected_status, got HTTP $response)"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

# Function to check if service is running
check_service() {
    local port=$1
    local service_name=$2
    
    if curl -s "http://localhost:$port" > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} $service_name is running on port $port"
        return 0
    else
        echo -e "${RED}✗${NC} $service_name is not running on port $port"
        return 1
    fi
}

echo "=================================================="
echo "🧪 API Endpoint Connectivity Tests"
echo "=================================================="

# Check if services are running
echo -e "\n${YELLOW}Checking service availability...${NC}"
AUTH_RUNNING=false
CORE_RUNNING=false

if check_service $AUTH_PORT "Auth Service"; then
    AUTH_RUNNING=true
fi

if check_service $CORE_PORT "Core Logistics Service"; then
    CORE_RUNNING=true
fi

if [ "$AUTH_RUNNING" = false ] && [ "$CORE_RUNNING" = false ]; then
    echo -e "\n${RED}❌ No services are running. Please start the services first.${NC}"
    exit 1
fi

echo -e "\n${YELLOW}Testing endpoints...${NC}"

# Test Auth Service endpoints (if running)
if [ "$AUTH_RUNNING" = true ]; then
    echo -e "\n📡 Auth Service Endpoints:"
    test_endpoint "GET" "$BASE_URL_AUTH/" "200" "Auth service root"
    test_endpoint "GET" "$BASE_URL_AUTH/health" "200" "Auth service health"
    test_endpoint "POST" "$BASE_URL_AUTH/api/auth/login" "400" "Login endpoint (validation error expected)"
    test_endpoint "POST" "$BASE_URL_AUTH/api/auth/register" "400" "Register endpoint (validation error expected)"
    test_endpoint "GET" "$BASE_URL_AUTH/api/auth/google" "302" "Google OAuth endpoint (redirect expected)"
fi

# Test Core Logistics endpoints (if running)
if [ "$CORE_RUNNING" = true ]; then
    echo -e "\n🚚 Core Logistics Service Endpoints:"
    test_endpoint "GET" "$BASE_URL_CORE/" "200" "Core logistics root"
    test_endpoint "GET" "$BASE_URL_CORE/health" "200" "Core logistics health"
    test_endpoint "GET" "$BASE_URL_CORE/api/store/init" "200" "Store initialization"
    test_endpoint "POST" "$BASE_URL_CORE/api/services/select" "401" "Service selection (auth required)"
    test_endpoint "GET" "$BASE_URL_CORE/api/services/context" "401" "Service context (auth required)"
fi

# Test that old incorrect routes return 404
if [ "$CORE_RUNNING" = true ]; then
    echo -e "\n🚫 Verify old routes are disabled:"
    test_endpoint "GET" "$BASE_URL_CORE/store/init" "404" "Old store route (should be 404)"
    test_endpoint "GET" "$BASE_URL_CORE/services/context" "404" "Old services route (should be 404)"
fi

# Summary
echo -e "\n=================================================="
echo "📊 Test Results Summary"
echo "=================================================="
echo "Total Tests: $TOTAL_TESTS"
echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed: ${RED}$FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All tests passed! API endpoints are working correctly.${NC}"
    exit 0
else
    echo -e "\n${RED}❌ Some tests failed. Please check the service configurations.${NC}"
    exit 1
fi