#!/bin/bash
# ============================================================
# LUMIÈRE Cafe POS — Database Reset Script
# ============================================================
# This script completely wipes the PostgreSQL database and
# Redis cache, then restarts all services fresh.
#
# WARNING: ALL DATA WILL BE PERMANENTLY DELETED!
#   - All orders, products, categories, users
#   - All inventory, discounts, settings
#   - All shift records, audit logs
#   - All Redis cache
#
# Usage:
#   chmod +x scripts/reset-db.sh
#   ./scripts/reset-db.sh
# ============================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo ""
echo -e "${RED}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${RED}║  ⚠️  DATABASE FULL RESET — LUMIÈRE CAFE POS      ║${NC}"
echo -e "${RED}║                                                  ║${NC}"
echo -e "${RED}║  This will PERMANENTLY DELETE all data:           ║${NC}"
echo -e "${RED}║  • Orders, Products, Categories, Users           ║${NC}"
echo -e "${RED}║  • Inventory, Discounts, Settings                ║${NC}"
echo -e "${RED}║  • Shift Records, Audit Logs, Redis Cache        ║${NC}"
echo -e "${RED}╚══════════════════════════════════════════════════╝${NC}"
echo ""

read -p "Are you sure you want to reset the database? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
  echo -e "${YELLOW}❌ Reset cancelled. No data was deleted.${NC}"
  exit 0
fi

echo ""
echo -e "${CYAN}🔄 Step 1/4: Stopping all containers...${NC}"
docker compose down

echo -e "${CYAN}🗑️  Step 2/4: Removing database & cache volumes...${NC}"
docker volume rm cafe_postgres_data cafe_redis_data 2>/dev/null || true
# Also try without project prefix
docker volume rm postgres_data redis_data 2>/dev/null || true

echo -e "${CYAN}🔨 Step 3/4: Rebuilding all containers from scratch...${NC}"
docker compose up -d --build

echo -e "${CYAN}⏳ Step 4/4: Waiting for database initialization (10s)...${NC}"
sleep 10

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ DATABASE RESET COMPLETE!                     ║${NC}"
echo -e "${GREEN}║                                                  ║${NC}"
echo -e "${GREEN}║  All services are running with a fresh database. ║${NC}"
echo -e "${GREEN}║  → Frontend:  http://localhost:8080              ║${NC}"
echo -e "${GREEN}║  → Backend:   http://localhost:8000              ║${NC}"
echo -e "${GREEN}║  → Database:  localhost:5432                     ║${NC}"
echo -e "${GREEN}║  → Redis:     localhost:6379                     ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}📝 Don't forget to register a new admin account:${NC}"
echo -e "${CYAN}curl -X POST http://localhost:8000/api/v1/auth/register \\${NC}"
echo -e "${CYAN}  -H \"Content-Type: application/json\" \\${NC}"
echo -e "${CYAN}  -d '{\"name\":\"Admin\",\"username\":\"admin\",\"password\":\"admin123\",\"role\":\"admin\"}'${NC}"
echo ""
