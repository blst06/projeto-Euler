#!/usr/bin/env bash
# =============================================================================
#  Cartivore Frontend v1.0 — Inicialização Local
#  © Euler Azevedo & Dioneide Sales
# =============================================================================
set -e

CYAN='\033[0;36m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BOLD='\033[1m'; NC='\033[0m'

echo ""
echo -e "${CYAN}${BOLD}  Cartivore Frontend v1.0 — Iniciando dev server...${NC}"
echo -e "  ═══════════════════════════════════════════════════"
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

echo ""
echo -e "${CYAN}➤ Iniciando Cartivore Frontend...${NC}"
echo ""
echo -e "  ${BOLD}App:${NC}            http://localhost:5173"
echo -e "  ${BOLD}Backend proxy:${NC}  /api → http://localhost:3000"
echo -e "  ${BOLD}Login:${NC}          admin@cartivore.com / admin123"
echo ""
echo -e "${YELLOW}  Pressione Ctrl+C para encerrar${NC}"
echo ""

npm run dev
