#!/usr/bin/env bash
# =============================================================================
#  Cartivore Backend — Setup Local
#  © Euler Azevedo & Dioneide Sales
# =============================================================================
set -e

CYAN='\033[0;36m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; BOLD='\033[1m'; NC='\033[0m'

echo ""
echo -e "${CYAN}${BOLD}  Cartivore Backend v1.0 — Setup${NC}"
echo -e "  ══════════════════════════════"
echo ""

# Node.js
if ! command -v node &>/dev/null; then
  echo -e "${RED}✗ Node.js não encontrado. Instale em https://nodejs.org${NC}"; exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v)${NC}"

# .env
if [ ! -f ".env" ]; then
  cp .env.example .env
  echo -e "${GREEN}✓ .env criado a partir de .env.example${NC}"
  echo -e "${YELLOW}  ⚠  Edite o .env e configure JWT_SECRET e FRONTEND_URL${NC}"
else
  echo -e "${GREEN}✓ .env já existe${NC}"
fi

# Dependências
echo -e "${CYAN}➤ Instalando dependências...${NC}"
npm install
echo -e "${GREEN}✓ Dependências instaladas${NC}"

echo ""
echo -e "${GREEN}${BOLD}✓ Setup concluído!${NC}"
echo -e "  Execute: ${CYAN}bash scripts/start.sh${NC}"
echo ""
