#!/usr/bin/env bash
# =============================================================================
#  Cartivore v1.0 — Inicialização Local (Backend + Frontend)
#  © Euler Azevedo & Dioneide Sales
# =============================================================================
set -e

CYAN='\033[0;36m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BOLD='\033[1m'; NC='\033[0m'

echo ""
echo -e "${CYAN}${BOLD}  Cartivore v1.0 — Iniciando ambiente de desenvolvimento...${NC}"
echo -e "  ══════════════════════════════════════════════════════════"
echo ""

if [ ! -f ".env" ]; then
  echo -e "${YELLOW}  ⚠  .env não encontrado. Execute setup.sh primeiro:${NC}"
  echo "     bash scripts/setup.sh"; exit 1
fi

if [ ! -d "backend/node_modules" ] || [ ! -d "frontend/node_modules" ]; then
  echo -e "${YELLOW}  ⚠  Dependências não instaladas. Execute:${NC}"
  echo "     bash scripts/setup.sh"; exit 1
fi

echo -e "${GREEN}✓ Ambiente OK${NC}"
echo ""
echo -e "  ${BOLD}Backend API:${NC}    http://localhost:3000/api"
echo -e "  ${BOLD}Frontend App:${NC}   http://localhost:5173"
echo -e "  ${BOLD}Login:${NC}          admin@cartivore.com / admin123"
echo ""
echo -e "${YELLOW}  Pressione Ctrl+C para encerrar ambos os processos${NC}"
echo ""

# Inicia backend em background
(cd backend && npm run dev) &
BACKEND_PID=$!

# Aguarda backend subir
sleep 2

# Inicia frontend em foreground
(cd frontend && npm run dev)

# Ao encerrar o frontend, mata o backend também
kill $BACKEND_PID 2>/dev/null
