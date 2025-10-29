#!/bin/bash

# Upload HALAL HALL to VPS
# Run this from your local machine (Git Bash on Windows)

VPS_IP="194.32.142.53"
VPS_USER="ubuntu"
VPS_PATH="/home/halalhall/app"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}========================================"
echo -e "  HALAL HALL - Upload to VPS"
echo -e "========================================${NC}"
echo ""

# Check if rsync is available
if ! command -v rsync &> /dev/null; then
    echo -e "${YELLOW}rsync not found, using scp instead...${NC}"
    USE_RSYNC=false
else
    USE_RSYNC=true
fi

echo -e "${YELLOW}Uploading files to VPS...${NC}"
echo -e "${YELLOW}This may take a few minutes...${NC}"
echo ""

# Create temporary archive
echo -e "${BLUE}Step 1: Creating archive...${NC}"
ARCHIVE_NAME="halal-hall-$(date +%Y%m%d_%H%M%S).tar.gz"

tar -czf "/tmp/$ARCHIVE_NAME" \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='dist' \
    --exclude='build' \
    --exclude='.vscode' \
    --exclude='*.log' \
    --exclude='.env' \
    --exclude='.env.local' \
    --exclude='.env.development' \
    -C "$(dirname "$0")/.." .

echo -e "${GREEN}✓ Archive created${NC}"
echo ""

# Upload to VPS
echo -e "${BLUE}Step 2: Uploading to VPS...${NC}"
scp "/tmp/$ARCHIVE_NAME" "${VPS_USER}@${VPS_IP}:/tmp/"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Upload successful${NC}"
else
    echo -e "${RED}✗ Upload failed${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}Step 3: Extracting on VPS...${NC}"

# SSH and extract
ssh "${VPS_USER}@${VPS_IP}" << EOF
sudo mkdir -p $VPS_PATH
sudo tar -xzf /tmp/$ARCHIVE_NAME -C $VPS_PATH
sudo chown -R halalhall:halalhall $VPS_PATH
sudo chmod +x $VPS_PATH/scripts/*.sh
sudo rm /tmp/$ARCHIVE_NAME
echo "Files extracted and permissions set"
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Extraction completed${NC}"
else
    echo -e "${RED}✗ Extraction failed${NC}"
    exit 1
fi

# Cleanup
rm "/tmp/$ARCHIVE_NAME"

echo ""
echo -e "${GREEN}========================================"
echo -e "  Upload completed successfully!"
echo -e "========================================${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. SSH to server: ssh ubuntu@$VPS_IP"
echo "2. Switch user: sudo su - halalhall"
echo "3. Go to app: cd /home/halalhall/app"
echo "4. Configure: cp .env.production.example .env.production"
echo "5. Edit config: nano .env.production"
echo "6. Deploy: docker-compose -f docker-compose.prod.yml up -d"
echo ""
