#!/usr/bin/env bash
# =============================================================================
#  Cartivore v1.0 — Setup Completo (Backend + Frontend)
#  © Euler Azevedo & Dioneide Sales
# =============================================================================
set -e

CYAN='\033[0;36m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; BOLD='\033[1m'; NC='\033[0m'

echo ""
echo -e "${CYAN}${BOLD}  ██████╗ █████╗ ██████╗ ████████╗██╗██╗   ██╗ ██████╗ ██████╗ ███████╗${NC}"
echo -e "${CYAN}${BOLD} ██╔════╝██╔══██╗██╔══██╗╚══██╔══╝██║██║   ██║██╔═══██╗██╔══██╗██╔════╝${NC}"
echo -e "${CYAN}${BOLD} ██║     ███████║██████╔╝   ██║   ██║██║   ██║██║   ██║██████╔╝█████╗  ${NC}"
echo -e "${CYAN}${BOLD} ██║     ██╔══██║██╔══██╗   ██║   ██║╚██╗ ██╔╝██║   ██║██╔══██╗██╔══╝  ${NC}"
echo -e "${CYAN}${BOLD} ╚██████╗██║  ██║██║  ██║   ██║   ██║ ╚████╔╝ ╚██████╔╝██║  ██║███████╗${NC}"
echo -e "${CYAN}${BOLD}  ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═══╝   ╚═════╝ ╚═╝  ╚═╝╚══════╝${NC}"
echo ""
echo -e "  ${BOLD}Sistema de Gestão Estratégica de Carteira de Clientes — v1.0${NC}"
echo -e "  ════════════════════════════════════════════════════════════"
echo ""

# Node.js
if ! command -v node &>/dev/null; then
  echo -e "${RED}✗ Node.js não encontrado. Instale em https://nodejs.org${NC}"; exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v)${NC}"

# .env raiz
if [ ! -f ".env" ]; then
  cp .env.example .env
  echo -e "${GREEN}✓ .env criado a partir de .env.example${NC}"
  echo -e "${YELLOW}  ⚠  Edite o .env e configure JWT_SECRET e FRONTEND_URL${NC}"
else
  echo -e "${GREEN}✓ .env encontrado${NC}"
fi

# Backend
echo ""
echo -e "${CYAN}➤ Configurando Backend...${NC}"
cd backend
[ ! -f ".env" ] && cp .env.example .env
npm install
echo -e "${GREEN}✓ Backend OK${NC}"
cd ..

# Frontend
echo ""
echo -e "${CYAN}➤ Configurando Frontend...${NC}"
cd frontend
[ ! -f ".env" ] && cp .env.example .env
npm install
echo -e "${GREEN}✓ Frontend OK${NC}"
cd ..

echo ""
echo -e "${GREEN}${BOLD}✓ Setup concluído!${NC}"
echo ""
echo -e "  Para rodar localmente:"
echo -e "  ${CYAN}bash scripts/start.sh${NC}  — inicia backend + frontend"
echo ""
