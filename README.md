# Consulog Frontend

Sistema de gestão logística desenvolvido em Next.js com TypeScript.

## 🚀 Funcionalidades

- **Autenticação**
- **Visualização de Pedidos, Estoque e Estoque Sumarizado**
- **Criação de Pedidos**
- **Cache de informação para navegação fluída**
- **Exportação em CSV** 

### 📱 Telas

#### Tela de Login
- Campos: e-mail e senha

#### Tela de Pedidos
- Tabela responsiva com as colunas:
  - Data do pedido
  - Número do pedido
  - Cliente
  - Nota Fiscal
  - Status (com badges coloridos)
  - Situação
  - Itens (botão para ver detalhes)
- Filtros: Número do Pedido, cliente, data início, data fim
- Cards de estatísticas por status (clicáveis para filtrar)
- Exportação para CSV
- Cache inteligente (2 minutos)
- Indicador de origem dos dados (cache ou API)

#### Modal de Itens do Pedido
- Lista detalhada de itens do lote
- Informações exibidas:
  - Produto (código e HU)
  - Lote
  - Endereço de armazenamento
  - Quantidade solicitada
  - Quantidade separada
  - Peso líquido
  - Peso bruto total
- Design responsivo com scroll horizontal

#### Tela de Criação de Pedidos
- Formulário completo para criação de novos pedidos
- Seleção de cliente
- Adição de itens ao pedido
- Validação de dados em tempo real
- Confirmação antes de enviar

#### Tela de Estoque
- Listagem completa de produtos em estoque
- Informações por produto:
  - Código do produto
  - Armazem
  - Saldo disponível
  - Saldo total
  - Peso (kg)
  - Status
- Filtros: produto e saldo
- Exportação para CSV

#### Tela de Estoque Sumarizado
- Visão consolidada do estoque por produto
- Informações agregadas:
  - Total por produto (soma de todos os lotes)
  - Quantidade de lotes diferentes
  - Status de disponibilidade
- Filtros: CNPJ do cliente e filtro geral
- Cards de estatística: total de itens, total de emitentes, quantidade total valor total


## 🛠 Tecnologias Utilizadas

- **Next.js 15** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Zustand** - Gerenciamento de estado
- **React Hook Form** - Formulários
- **Zod** - Validação de schemas
- **Axios** - Cliente HTTP
- **Lucide React** - Ícones

## 🔧 Instalação e Configuração

### Usando Docker (Recomendado)

```bash
# Iniciar a aplicação em modo desenvolvimento
make docker-up

# Parar a aplicação
make docker-down

# Rebuild completo (sem cache)
make docker-rebuild
```

**Características do ambiente Docker:**
- Hot reload ativado (mudanças no código refletem automaticamente)
- Volumes montados para desenvolvimento
- Porta 3000 exposta (http://localhost:3000)
- Reinício automático em caso de falha

**Outros comandos úteis:**
```bash
# Ver todos os comandos disponíveis
make help

# Ver logs da aplicação
make docker-logs

# Acessar shell do container
make docker-shell

# Ver status dos containers
make docker-ps
```

## 📁 Estrutura do Projeto

```
src/
├── app/                          # Next.js App Router
│   ├── (dashboard)/              # Rotas protegidas (com autenticação)
│   │   ├── estoque/             # Página de estoque
│   │   ├── estoque-sumarizado/  # Página de estoque sumarizado
│   │   ├── pedido-pre/          # Página de criação de pedidos
│   │   ├── pedidos/             # Página de listagem de pedidos
│   │   └── layout.tsx           # Layout do dashboard
│   ├── api/                     # API Routes (Next.js)
│   │   ├── auth/               # Autenticação
│   │   ├── estoque/            # Endpoints de estoque
│   │   ├── pedido-pre/         # Endpoints de criação de pedidos
│   │   └── pedidos/            # Endpoints de pedidos
│   ├── login/                   # Página de login
│   ├── layout.tsx               # Layout root
│   ├── globals.css              # Estilos globais
│   └── page.tsx                 # Página inicial
│
├── components/
│   ├── forms/                   # Formulários
│   │   └── LoginForm.tsx
│   ├── layout/                  # Componentes de layout
│   │   ├── Header.tsx
│   │   └── Sidebar.tsx
│   ├── orders/                  # Componentes de pedidos
│   │   ├── OrderDetailsModal.tsx
│   │   ├── OrderFilters.tsx
│   │   ├── OrderItemsModal.tsx
│   │   ├── OrdersStats.tsx
│   │   └── OrdersTable.tsx
│   ├── stock/                   # Componentes de estoque
│   │   ├── StockFilters.tsx
│   │   ├── StockStats.tsx
│   │   └── StockTable.tsx
│   ├── stock-summary/           # Componentes de estoque sumarizado
│   │   ├── StockSummaryFilters.tsx
│   │   ├── StockSummaryStats.tsx
│   │   └── StockSummaryTable.tsx
│   ├── providers/               # Providers React
│   │   └── AuthProvider.tsx
│   └── ui/                      # Componentes base reutilizáveis
│       ├── Badge.tsx
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── ErrorBoundary.tsx
│       ├── OrdersSkeleton.tsx
│       ├── ProductAutocomplete.tsx
│       └── StatsCards.tsx
│
├── hooks/                       # Custom React Hooks
│   ├── useAuth.ts
│   ├── useCache.ts
│   ├── useDebounce.ts
│   ├── useAsyncState.ts
│   └── useErrorHandler.ts
│
├── services/                    # Serviços de API
│   ├── api.ts                   # Cliente HTTP base (Axios)
│   ├── auth.ts                  # Autenticação
│   ├── orders.ts                # Serviço de pedidos
│   ├── ordersLotes.ts           # Serviço de lotes
│   ├── stock.ts                 # Serviço de estoque
│   ├── stock-summary.ts         # Serviço de estoque sumarizado
│   ├── product.ts               # Serviço de produtos
│   └── pedido-pre.ts            # Serviço de criação de pedidos
│
├── store/                       # State Management (Zustand)
│   └── auth.ts                  # Store de autenticação
│
├── types/                       # TypeScript Types & Interfaces
│   ├── auth.ts
│   ├── orders.ts
│   ├── stock.ts
│   ├── stock-summary.ts
│   ├── product.ts
│   └── pedido-pre.ts
│
└── utils/                       # Funções utilitárias
    ├── cache.ts                 # Sistema de cache
    ├── cn.ts                    # Utility para className (Tailwind)
    ├── formatters.ts            # Formatadores de data, moeda, etc
    └── logger.ts                # Sistema de logs
```
