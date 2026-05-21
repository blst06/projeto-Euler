/**
 * ============================================================
 *  CARTIVORE — Seed de Massa de Dados para Testes
 *  CART-032 | Schema real do projeto
 * ============================================================
 *  Uso:  node seed.js
 *  Saída: seed.sql + seed.json
 *  Seed fixo = 42 → dados sempre reproduzíveis
 *  Senha padrão de todos os usuários: Teste@123
 *
 *  Status reais do sistema:
 *    clientes: adimplente | inadimplente | bloqueado
 *    vendas:   pendente | pago | vencido | cancelado
 * ============================================================
 */

const { faker } = require('@faker-js/faker/locale/pt_BR');
const bcrypt    = require('bcryptjs');
const fs        = require('fs');

const SEED  = 42;
const SENHA = 'Teste@123';
faker.seed(SEED);

const hoje    = new Date();
const passado = d => new Date(hoje.getTime() - d * 86400000).toISOString();
const futuro  = d => new Date(hoje.getTime() + d * 86400000).toISOString();
const isoNow  = () => hoje.toISOString();

function sqls(val) {
  if (val === null || val === undefined) return 'NULL';
  return `'${String(val).replace(/'/g, "''")}'`;
}

// ─── 1. USERS ────────────────────────────────────────────────
const senhaHash = bcrypt.hashSync(SENHA, 10);
const users = [
  { id:1, nome:'Administrador Sistema',  email:'admin@cartivore.dev',    role:'admin'    },
  { id:2, nome:'Gerente Wesley',          email:'wesley@cartivore.dev',   role:'gerente'  },
  { id:3, nome:'Gerente Amanda',          email:'amanda@cartivore.dev',   role:'gerente'  },
  { id:4, nome:'Vendedor Euler',          email:'euler@cartivore.dev',    role:'vendedor' },
  { id:5, nome:'Vendedor Kauaca',         email:'kauaca@cartivore.dev',   role:'vendedor' },
  { id:6, nome:'Vendedor Erick',          email:'erick@cartivore.dev',    role:'vendedor' },
  { id:7, nome:'Vendedor Alex',           email:'alex@cartivore.dev',     role:'vendedor' },
  { id:8, nome:'Vendedor Teste',          email:'vendedor@cartivore.dev', role:'vendedor' },
];

// ─── 2. CLIENTES ─────────────────────────────────────────────
// Cenários fixos (garante cobertura total dos critérios CART-032)
// + 80 clientes aleatórios para volume

const SEGMENTOS = ['Varejo','Atacado','Serviços','Indústria','Tecnologia','Saúde','Educação','Construção'];
const CIDADES   = [
  {cidade:'São Paulo',      estado:'SP', lat:-23.5505, lng:-46.6333},
  {cidade:'Rio de Janeiro', estado:'RJ', lat:-22.9068, lng:-43.1729},
  {cidade:'Belo Horizonte', estado:'MG', lat:-19.9167, lng:-43.9345},
  {cidade:'Manaus',         estado:'AM', lat:-3.1019,  lng:-60.0250},
  {cidade:'Curitiba',       estado:'PR', lat:-25.4284, lng:-49.2733},
  {cidade:'Salvador',       estado:'BA', lat:-12.9714, lng:-38.5014},
  {cidade:'Fortaleza',      estado:'CE', lat:-3.7172,  lng:-38.5433},
  {cidade:'Porto Alegre',   estado:'RS', lat:-30.0346, lng:-51.2177},
];

// Cenários fixos — cada um cobre um critério de aceite
const clientesFixos = [
  // CART-032 Critério 1a: adimplente com coordenadas
  { id:1,  nome:'Empresa Adimplente SP Ltda',     cpf_cnpj:'11.111.111/0001-11', segmento:'Tecnologia', status:'adimplente',   lat:-23.5505, lng:-46.6333, cidade:'São Paulo',      estado:'SP', observacoes:'Cenário: adimplente com coordenadas' },
  { id:2,  nome:'Comércio Pontual Rio Ltda',       cpf_cnpj:'22.222.222/0001-22', segmento:'Varejo',     status:'adimplente',   lat:-22.9068, lng:-43.1729, cidade:'Rio de Janeiro', estado:'RJ', observacoes:'Cenário: adimplente com coordenadas' },
  { id:3,  nome:'Serviços BH Regulares ME',        cpf_cnpj:'33.333.333/0001-33', segmento:'Serviços',   status:'adimplente',   lat:-19.9167, lng:-43.9345, cidade:'Belo Horizonte', estado:'MG', observacoes:'Cenário: adimplente com coordenadas' },

  // CART-032 Critério 1b: inadimplente com vendas vencidas
  { id:4,  nome:'Distribuidora Atrasada Ltda',     cpf_cnpj:'44.444.444/0001-44', segmento:'Atacado',    status:'inadimplente', lat:-25.4284, lng:-49.2733, cidade:'Curitiba',       estado:'PR', observacoes:'Cenário: inadimplente com venda vencida' },
  { id:5,  nome:'Indústria Devedora AM SA',        cpf_cnpj:'55.555.555/0001-55', segmento:'Indústria',  status:'inadimplente', lat:-3.1019,  lng:-60.0250, cidade:'Manaus',         estado:'AM', observacoes:'Cenário: inadimplente com venda vencida' },

  // CART-032 Critério 1c: bloqueado
  { id:6,  nome:'Empresa Bloqueada BA Ltda',       cpf_cnpj:'66.666.666/0001-66', segmento:'Construção', status:'bloqueado',    lat:-12.9714, lng:-38.5014, cidade:'Salvador',       estado:'BA', observacoes:'Cenário: cliente bloqueado manualmente' },

  // CART-032 Critério 1d: "em risco" = pendente com vencimento vencido
  { id:7,  nome:'Comércio Em Risco CE Ltda',       cpf_cnpj:'77.777.777/0001-77', segmento:'Varejo',     status:'adimplente',   lat:-3.7172,  lng:-38.5433, cidade:'Fortaleza',      estado:'CE', observacoes:'Cenário: venda pendente vencida — em risco' },
  { id:8,  nome:'Atacado Risco RS ME',             cpf_cnpj:'88.888.888/0001-88', segmento:'Atacado',    status:'adimplente',   lat:-30.0346, lng:-51.2177, cidade:'Porto Alegre',   estado:'RS', observacoes:'Cenário: venda pendente vencida — em risco' },

  // CART-032 Critério 1e: sem coordenadas (lat/lng null) — geocodificação falhou
  { id:9,  nome:'Empresa Sem GPS Ltda',            cpf_cnpj:'99.999.999/0001-99', segmento:'Serviços',   status:'adimplente',   lat:null,     lng:null,     cidade:'Interior SP',    estado:'SP', observacoes:'Cenário: sem coordenadas — geocodificação falhou' },
  { id:10, nome:'Comércio Endereço Inválido ME',   cpf_cnpj:'10.101.010/0001-10', segmento:'Varejo',     status:'adimplente',   lat:null,     lng:null,     cidade:'Zona Rural MG',  estado:'MG', observacoes:'Cenário: sem coordenadas — endereço não encontrado' },
];

// 80 clientes aleatórios para volume
faker.seed(SEED);
const clientesAleatorios = Array.from({ length: 80 }, (_, i) => {
  const loc  = faker.helpers.arrayElement(CIDADES);
  const isPJ = faker.datatype.boolean(0.4);
  const semCoord = faker.datatype.boolean(0.1); // 10% sem coordenada
  return {
    id:       11 + i,
    nome:     isPJ ? faker.company.name() + ' LTDA' : faker.person.fullName(),
    cpf_cnpj: isPJ
      ? `${faker.string.numeric(2)}.${faker.string.numeric(3)}.${faker.string.numeric(3)}/0001-${faker.string.numeric(2)}`
      : `${faker.string.numeric(3)}.${faker.string.numeric(3)}.${faker.string.numeric(3)}-${faker.string.numeric(2)}`,
    segmento:  faker.helpers.arrayElement(SEGMENTOS),
    telefone:  `(${faker.number.int({min:11,max:99})}) 9${faker.string.numeric(4)}-${faker.string.numeric(4)}`,
    email:     faker.internet.email().toLowerCase(),
    endereco:  faker.location.streetAddress(),
    cidade:    loc.cidade,
    estado:    loc.estado,
    cep:       `${faker.string.numeric(5)}-${faker.string.numeric(3)}`,
    lat:       semCoord ? null : +(loc.lat + (Math.random()-0.5)*0.05).toFixed(6),
    lng:       semCoord ? null : +(loc.lng + (Math.random()-0.5)*0.05).toFixed(6),
    status:    faker.helpers.arrayElement(['adimplente','adimplente','adimplente','inadimplente','bloqueado']),
    observacoes: null,
  };
});

const todosClientes = [...clientesFixos, ...clientesAleatorios].map(c => ({
  telefone:  `(11) 9${faker.string.numeric(4)}-${faker.string.numeric(4)}`,
  email:     faker.internet.email().toLowerCase(),
  endereco:  faker.location.streetAddress(),
  cep:       `${faker.string.numeric(5)}-${faker.string.numeric(3)}`,
  limite_credito: parseFloat(faker.commerce.price({ min: 1000, max: 100000, dec: 2 })),
  prazo:     faker.helpers.arrayElement([15, 30, 45, 60, 90]),
  ativo:     1,
  created_at: passado(faker.number.int({min:30, max:730})),
  updated_at: passado(faker.number.int({min:1, max:30})),
  ...c,
}));

// ─── 3. VENDAS ───────────────────────────────────────────────
// Status reais: pendente | pago | vencido | cancelado
const DESCRICOES = ['Consultoria estratégica','Licença de software','Suporte mensal','Treinamento','Implementação','Desenvolvimento web','Análise de dados','Cloud services'];
const vendedores  = users.filter(u => u.role === 'vendedor');

let vendaId = 1;
const vendas = [];

// Vendas específicas para os cenários fixos
const vendasFixas = [
  // Clientes adimplentes (1,2,3) — vendas pagas
  { clienteId:1, valor:5000,  status:'pago',    data: passado(60), vencimento: passado(30), descricao:'Licença de software anual' },
  { clienteId:1, valor:1500,  status:'pago',    data: passado(30), vencimento: futuro(15),  descricao:'Suporte mensal' },
  { clienteId:2, valor:8000,  status:'pago',    data: passado(45), vencimento: passado(15), descricao:'Consultoria estratégica' },
  { clienteId:3, valor:3000,  status:'pago',    data: passado(20), vencimento: futuro(10),  descricao:'Treinamento corporativo' },

  // Clientes inadimplentes (4,5) — vendas vencidas
  { clienteId:4, valor:12000, status:'vencido', data: passado(90), vencimento: passado(60), descricao:'Implementação de sistema' },
  { clienteId:4, valor:4500,  status:'vencido', data: passado(45), vencimento: passado(15), descricao:'Suporte técnico' },
  { clienteId:5, valor:7800,  status:'vencido', data: passado(120),vencimento: passado(90), descricao:'Desenvolvimento web' },

  // Cliente bloqueado (6) — histórico misto
  { clienteId:6, valor:15000, status:'pago',    data: passado(180),vencimento: passado(150),descricao:'Projeto de construção' },
  { clienteId:6, valor:6000,  status:'vencido', data: passado(90), vencimento: passado(60), descricao:'Manutenção' },

  // Clientes em risco (7,8) — pendente com vencimento passado
  { clienteId:7, valor:9000,  status:'pendente',data: passado(45), vencimento: passado(15), descricao:'Consultoria — EM RISCO' },
  { clienteId:8, valor:3500,  status:'pendente',data: passado(60), vencimento: passado(30), descricao:'Serviços — EM RISCO' },

  // Clientes sem coordenada (9,10) — vendas normais
  { clienteId:9,  valor:2000, status:'pago',    data: passado(30), vencimento: passado(10), descricao:'Consultoria' },
  { clienteId:10, valor:4000, status:'pendente',data: passado(15), vencimento: futuro(15),  descricao:'Serviços' },
];

vendasFixas.forEach(v => {
  vendas.push({ id: vendaId++, usuarioId: faker.helpers.arrayElement(vendedores).id, created_at: v.data, ...v });
});

// Vendas aleatórias para os 80 clientes
todosClientes.filter(c => c.id > 10).forEach(c => {
  const qtd = faker.number.int({ min: 1, max: 4 });
  for (let i = 0; i < qtd; i++) {
    const diasAtras = faker.number.int({ min: 10, max: 365 });
    const diasVenc  = faker.number.int({ min: -30, max: 60 });
    const status    = faker.helpers.arrayElement(['pendente','pago','pago','vencido','cancelado']);
    vendas.push({
      id:         vendaId++,
      clienteId:  c.id,
      usuarioId:  faker.helpers.arrayElement(vendedores).id,
      valor:      parseFloat(faker.commerce.price({ min: 500, max: 50000, dec: 2 })),
      data:       passado(diasAtras),
      vencimento: diasVenc >= 0 ? futuro(diasVenc) : passado(-diasVenc),
      status,
      descricao:  faker.helpers.arrayElement(DESCRICOES),
      created_at: passado(diasAtras),
    });
  }
});

// ─── 4. PAGAMENTOS ───────────────────────────────────────────
const FORMAS = ['pix','pix','cartao_credito','cartao_debito','boleto','transferencia','dinheiro'];
let pagId = 1;
const pagamentos = [];

vendas.forEach(v => {
  if (v.status === 'cancelado' || v.status === 'vencido') return;
  if (v.status === 'pago') {
    const parcelas = faker.number.int({ min: 1, max: 3 });
    const vlrParc  = parseFloat((v.valor / parcelas).toFixed(2));
    for (let p = 0; p < parcelas; p++) {
      pagamentos.push({
        id:              pagId++,
        venda_id:        v.id,
        valor_pago:      p === parcelas-1 ? parseFloat((v.valor - vlrParc*(parcelas-1)).toFixed(2)) : vlrParc,
        data:            passado(faker.number.int({min:1, max:60})),
        forma_pagamento: faker.helpers.arrayElement(FORMAS),
        observacoes:     null,
        created_at:      v.created_at,
      });
    }
  } else if (v.status === 'pendente' && faker.datatype.boolean(0.2)) {
    pagamentos.push({
      id:              pagId++,
      venda_id:        v.id,
      valor_pago:      parseFloat((v.valor * 0.5).toFixed(2)),
      data:            passado(faker.number.int({min:1, max:30})),
      forma_pagamento: faker.helpers.arrayElement(FORMAS),
      observacoes:     'Pagamento parcial — saldo pendente',
      created_at:      v.created_at,
    });
  }
});

// ─── 5. HISTORICO ────────────────────────────────────────────
const TIPOS_HIST = ['ligacao','reuniao','email','proposta','visita','suporte'];
const DESC_HIST  = {
  ligacao:  ['Ligação de prospecção.', 'Retorno ao cliente.', 'Follow-up telefônico.'],
  reuniao:  ['Reunião de alinhamento.', 'Apresentação de proposta.', 'Reunião de kickoff.'],
  email:    ['E-mail de apresentação.', 'Proposta enviada por e-mail.'],
  proposta: ['Proposta enviada.', 'Revisão de proposta.'],
  visita:   ['Visita comercial.', 'Visita técnica.'],
  suporte:  ['Chamado aberto.', 'Problema resolvido.'],
};
let histId = 1;
const historico = [];
todosClientes.forEach(c => {
  Array.from({ length: faker.number.int({min:1, max:3}) }).forEach(() => {
    const tipo = faker.helpers.arrayElement(TIPOS_HIST);
    historico.push({
      id: histId++, cliente_id: c.id,
      usuario_id: faker.helpers.arrayElement(users).id,
      tipo, descricao: faker.helpers.arrayElement(DESC_HIST[tipo]),
      data: passado(faker.number.int({min:1, max:365})),
      created_at: passado(faker.number.int({min:1, max:365})),
    });
  });
});

// ─── 6. AUDIT_LOG ────────────────────────────────────────────
let auditId = 1;
const auditLog = Array.from({ length: 150 }, () => {
  const entidade = faker.helpers.arrayElement(['clientes','vendas','pagamentos','users']);
  const acao     = faker.helpers.arrayElement(['LOGIN','CREATE','UPDATE','DELETE','EXPORT']);
  return {
    id: auditId++,
    usuario_id:  faker.helpers.arrayElement(users).id,
    acao, entidade,
    entidade_id: faker.number.int({min:1, max:90}),
    detalhes:    JSON.stringify({ acao, entidade }),
    ip:          faker.internet.ip(),
    created_at:  passado(faker.number.int({min:1, max:180})),
  };
});

// ─── GERAR SQL ───────────────────────────────────────────────
const lines = [];
lines.push(`-- CARTIVORE — Seed CART-032 | Gerado em: ${isoNow()}`);
lines.push(`-- Seed faker: ${SEED} | Senha: ${SENHA} | Schema real do projeto`);
lines.push('-- Cenários cobertos: adimplente, inadimplente, bloqueado, em risco, sem coordenada');
lines.push('BEGIN;');
lines.push('');

// users
lines.push('-- ── users ──────────────────────────────────────────────────');
users.forEach(u => {
  lines.push(`INSERT INTO users (id,nome,email,senha,role,ativo,created_at) VALUES (${u.id},${sqls(u.nome)},${sqls(u.email)},${sqls(senhaHash)},${sqls(u.role)},1,${sqls(isoNow())});`);
});
lines.push('');

// clientes
lines.push('-- ── clientes ───────────────────────────────────────────────');
lines.push('-- IDs 1-10: cenários fixos de teste | IDs 11+: volume aleatório');
todosClientes.forEach(c => {
  lines.push(`INSERT INTO clientes (id,nome,cpf_cnpj,segmento,telefone,email,endereco,cidade,estado,cep,lat,lng,status,observacoes,limite_credito,prazo,ativo,created_at,updated_at) VALUES (${c.id},${sqls(c.nome)},${sqls(c.cpf_cnpj)},${sqls(c.segmento)},${sqls(c.telefone)},${sqls(c.email)},${sqls(c.endereco)},${sqls(c.cidade)},${sqls(c.estado)},${sqls(c.cep)},${c.lat??'NULL'},${c.lng??'NULL'},${sqls(c.status)},${sqls(c.observacoes)},${c.limite_credito},${c.prazo},${c.ativo},${sqls(c.created_at)},${sqls(c.updated_at)});`);
});
lines.push('');

// vendas
lines.push('-- ── vendas ─────────────────────────────────────────────────');
lines.push('-- Clientes 1-10: cenários fixos | Demais: volume aleatório');
vendas.forEach(v => {
  lines.push(`INSERT INTO vendas (id,cliente_id,usuario_id,valor,data,vencimento,status,descricao,created_at) VALUES (${v.id},${v.clienteId},${v.usuarioId},${v.valor},${sqls(v.data)},${sqls(v.vencimento)},${sqls(v.status)},${sqls(v.descricao)},${sqls(v.created_at)});`);
});
lines.push('');

// pagamentos
lines.push('-- ── pagamentos ─────────────────────────────────────────────');
pagamentos.forEach(p => {
  lines.push(`INSERT INTO pagamentos (id,venda_id,valor_pago,data,forma_pagamento,observacoes,created_at) VALUES (${p.id},${p.venda_id},${p.valor_pago},${sqls(p.data)},${sqls(p.forma_pagamento)},${sqls(p.observacoes)},${sqls(p.created_at)});`);
});
lines.push('');

// historico
lines.push('-- ── historico ──────────────────────────────────────────────');
historico.forEach(h => {
  lines.push(`INSERT INTO historico (id,cliente_id,usuario_id,tipo,descricao,data,created_at) VALUES (${h.id},${h.cliente_id},${h.usuario_id},${sqls(h.tipo)},${sqls(h.descricao)},${sqls(h.data)},${sqls(h.created_at)});`);
});
lines.push('');

// audit_log
lines.push('-- ── audit_log ──────────────────────────────────────────────');
auditLog.forEach(a => {
  lines.push(`INSERT INTO audit_log (id,usuario_id,acao,entidade,entidade_id,detalhes,ip,created_at) VALUES (${a.id},${a.usuario_id},${sqls(a.acao)},${sqls(a.entidade)},${a.entidade_id},${sqls(a.detalhes)},${sqls(a.ip)},${sqls(a.created_at)});`);
});

lines.push('');
lines.push('COMMIT;');
lines.push('');
lines.push(`-- Totais: users=${users.length} | clientes=${todosClientes.length} | vendas=${vendas.length} | pagamentos=${pagamentos.length} | historico=${historico.length} | audit_log=${auditLog.length}`);

fs.writeFileSync('seed.sql', lines.join('\n'), 'utf8');

// JSON
fs.writeFileSync('seed.json', JSON.stringify({
  meta: {
    seed: SEED, senha_padrao: SENHA, gerado_em: isoNow(),
    cenarios_fixos: {
      adimplentes:       'IDs 1, 2, 3 — vendas pagas em dia',
      inadimplentes:     'IDs 4, 5 — vendas com status vencido',
      bloqueado:         'ID 6 — bloqueado manualmente',
      em_risco:          'IDs 7, 8 — venda pendente com vencimento no passado',
      sem_coordenadas:   'IDs 9, 10 — lat/lng null (geocodificação falhou)',
    },
    totais: {
      users: users.length, clientes: todosClientes.length,
      vendas: vendas.length, pagamentos: pagamentos.length,
      historico: historico.length, audit_log: auditLog.length,
    }
  },
  users: users.map(u => ({...u, senha:'[HASH bcrypt]'})),
  clientes: todosClientes, vendas, pagamentos, historico, audit_log: auditLog,
}, null, 2), 'utf8');

// Resumo
console.log('\n✅ Seed CART-032 gerado!');
console.log('──────────────────────────────────────────');
console.log('  Cenários fixos (IDs 1–10):');
console.log('    1-3  → adimplente com vendas pagas');
console.log('    4-5  → inadimplente com vendas vencidas');
console.log('    6    → bloqueado');
console.log('    7-8  → em risco (pendente vencido)');
console.log('    9-10 → sem coordenadas (lat/lng null)');
console.log('──────────────────────────────────────────');
console.log(`  users:       ${users.length}`);
console.log(`  clientes:    ${todosClientes.length} (10 fixos + 80 aleatórios)`);
console.log(`  vendas:      ${vendas.length}`);
console.log(`  pagamentos:  ${pagamentos.length}`);
console.log(`  historico:   ${historico.length}`);
console.log(`  audit_log:   ${auditLog.length}`);
console.log(`\n  🔑 Senha: ${SENHA}`);
console.log('  📄 sqlite3 cartivore.db < seed.sql');
