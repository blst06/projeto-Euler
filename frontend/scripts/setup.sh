#!/usr/bin/env bash
# =============================================================================
#  Cartivore Frontend — Setup Local
#  © Euler Azevedo & Dioneide Sales
# =============================================================================
set -e

CYAN='\033[0;36m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; BOLD='\033[1m'; NC='\033[0m'

echo ""
echo -e "${CYAN}${BOLD}  Cartivore Frontend v1.0 — Setup${NC}"
echo -e "  ═══════════════════════════════"
echo ""

if ! command -v node &>/dev/null; then
  echo -e "${RED}✗ Node.js não encontrado. Instale em https://nodejs.org${NC}"; exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v)${NC}"

if [ ! -f ".env" ]; then
  cp .env.example .env
  echo -e "${GREEN}✓ .env criado a partir de .env.example${NC}"
  echo -e "${YELLOW}  ⚠  Em produção, configure VITE_API_BASE com a URL do backend no Render${NC}"
else
  echo -e "${GREEN}✓ .env já existe${NC}"
fi

echo -e "${CYAN}➤ Instalando dependências...${NC}"
npm install
echo -e "${GREEN}✓ Dependências instaladas${NC}"

echo ""
echo -e "${GREEN}${BOLD}✓ Setup concluído!${NC}"
echo -e "  Execute: ${CYAN}bash scripts/start.sh${NC}"
echo -e ""
echo -e "  ${YELLOW}Certifique-se de que o backend está rodando em localhost:3000${NC}"
echo ""
