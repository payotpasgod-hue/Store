#!/bin/bash

echo "====================================="
echo "VPS Product API Debugging Script"
echo "====================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Check if server is running
echo -e "${YELLOW}Test 1: Checking if server is responding...${NC}"
SERVER_URL="http://localhost:5000"
if curl -s -o /dev/null -w "%{http_code}" "$SERVER_URL/api/products" | grep -q "200"; then
    echo -e "${GREEN}✓ Server is running${NC}"
else
    echo -e "${RED}✗ Server is not responding on port 5000${NC}"
    echo "Please start your application first"
    exit 1
fi
echo ""

# Test 2: Check if we can GET products
echo -e "${YELLOW}Test 2: Testing GET /api/products...${NC}"
PRODUCTS=$(curl -s "$SERVER_URL/api/products")
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Can fetch products${NC}"
    echo "Current products count: $(echo "$PRODUCTS" | jq '. | length' 2>/dev/null || echo 'unknown')"
else
    echo -e "${RED}✗ Failed to fetch products${NC}"
fi
echo ""

# Test 3: Try to add a product via API
echo -e "${YELLOW}Test 3: Testing POST /api/admin/products...${NC}"
TEST_PRODUCT='{
  "displayName": "VPS Test Product",
  "deviceName": "iPhone VPS Test",
  "model": "VPS-TEST-001",
  "colorOptions": ["Black"],
  "storageOptions": [{
    "capacity": "128GB",
    "originalPrice": 50000,
    "discount": 10
  }],
  "rating": 4.5,
  "specs": ["Test from VPS"],
  "releaseDate": "2024"
}'

RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$SERVER_URL/api/admin/products" \
  -H "Content-Type: application/json" \
  -d "$TEST_PRODUCT")

HTTP_CODE=$(echo "$RESPONSE" | grep HTTP_CODE | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE/d')

echo "HTTP Status Code: $HTTP_CODE"
echo "Response Body:"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
echo ""

if [ "$HTTP_CODE" = "201" ]; then
    echo -e "${GREEN}✓ Product added successfully!${NC}"
    PRODUCT_ID=$(echo "$BODY" | jq -r '.id' 2>/dev/null)
    echo "New product ID: $PRODUCT_ID"
else
    echo -e "${RED}✗ Failed to add product${NC}"
    echo "Error details:"
    echo "$BODY"
fi
echo ""

# Test 4: Check config file
echo -e "${YELLOW}Test 4: Checking config file...${NC}"
CONFIG_FILE="config/store-config.json"
if [ -f "$CONFIG_FILE" ]; then
    echo -e "${GREEN}✓ Config file exists${NC}"
    echo "File permissions: $(ls -l "$CONFIG_FILE")"
    echo "Last modified: $(stat -c %y "$CONFIG_FILE" 2>/dev/null || stat -f "%Sm" "$CONFIG_FILE" 2>/dev/null)"
    
    # Check if writable
    if [ -w "$CONFIG_FILE" ]; then
        echo -e "${GREEN}✓ Config file is writable${NC}"
    else
        echo -e "${RED}✗ Config file is NOT writable${NC}"
    fi
else
    echo -e "${RED}✗ Config file does not exist${NC}"
fi
echo ""

# Test 5: Check directories
echo -e "${YELLOW}Test 5: Checking required directories...${NC}"
DIRS=("uploads/product-images" "uploads/payment-screenshots" "uploads/qr-codes" "config" "data")
for DIR in "${DIRS[@]}"; do
    if [ -d "$DIR" ]; then
        if [ -w "$DIR" ]; then
            echo -e "${GREEN}✓ $DIR (writable)${NC}"
        else
            echo -e "${RED}✗ $DIR (NOT writable)${NC}"
        fi
    else
        echo -e "${RED}✗ $DIR (does not exist)${NC}"
    fi
done
echo ""

# Test 6: Check application logs
echo -e "${YELLOW}Test 6: Recent application logs...${NC}"
echo "Last 10 lines of logs:"
if command -v pm2 &> /dev/null; then
    pm2 logs --nostream --lines 10 2>/dev/null || echo "Could not fetch PM2 logs"
elif command -v journalctl &> /dev/null; then
    sudo journalctl -u yourapp -n 10 --no-pager 2>/dev/null || echo "Could not fetch systemd logs"
else
    echo "Could not determine log location (not using PM2 or systemd)"
fi
echo ""

echo "====================================="
echo "Summary"
echo "====================================="
echo ""
echo "If Test 3 succeeded with HTTP 201, the API is working!"
echo "If Test 3 failed, check:"
echo "  1. The error message in the response"
echo "  2. File/directory permissions above"
echo "  3. Application logs for detailed errors"
echo ""
echo "Common issues:"
echo "  - HTTP 500: Server error (check logs)"
echo "  - HTTP 400: Invalid data format"
echo "  - Connection refused: Server not running"
echo ""
