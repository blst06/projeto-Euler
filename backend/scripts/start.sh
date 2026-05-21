#!/usr/bin/env bash
# =============================================================================
#  Cartivore Backend v1.0 — Inicialização Local
#  © Euler Azevedo & Dioneide Sales
# =============================================================================
set -e

CYAN='\033[0;36m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BOLD='\033[1m'; NC='\033[0m'

echo ""
echo -e "${CYAN}${BOLD}  Cartivore Backend v1.0 — Iniciando API...${NC}"
echo -e "  ══════════════════════════════════════════"
echo ""

if [ ! -f ".env" ]; then
  echo -e "${YELLOW}  ⚠  .env não encontrado. Execute setup.sh primeiro:${NC}"
  echo "     bash scripts/setup.sh"; exit 1
fi
echo -e "${GREEN}✓ .env encontrado${NC}"

if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}  ⚠  Instalando dependências...${NC}"
  npm install
fi
echo -e "${GREEN}✓ Dependências OK${NC}"

PORT=$(grep -m1 "^PORT=" .env 2>/dev/null | cut -d= -f2 || echo "3000")

echo ""
echo -e "${CYAN}➤ Iniciando API...${NC}"
echo ""
echo -e "  ${BOLD}API Base URL:${NC}   http://localhost:${PORT}/api"
echo -e "  ${BOLD}Health check:${NC}   http://localhost:${PORT}/api/health"
echo ""
echo -e "${YELLOW}  Pressione Ctrl+C para encerrar${NC}"
echo ""

npm run dev
