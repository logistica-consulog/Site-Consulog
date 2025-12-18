// API Specification types based on documentation

export interface PedidoPreItem {
  codigo: string // Código do produto
  qtde: string // Quantidade (como string na API)
}

export interface EnderecoEntrega {
  nome?: string // Nome do cliente
  cnpj?: string // CNPJ/CPF do cliente
  ie?: string // Inscrição Estadual
  cep?: string // CEP
  endereco?: string // Endereço de entrega
  bairro?: string // Bairro
  cidade?: string // Cidade
  estado?: string // Estado
  telefone?: string // Telefone
  fis_jur?: string // (J/F) Pessoa Jurídica ou Pessoa Física
  numero?: string // Número do endereço
}

export interface Pedido {
  entrega?: string // Data de entrega (formato yyyy-mm-dd hh:mm)
  nota_fiscal?: string // Número da Nota Fiscal
  serie?: string // Série da Nota Fiscal
  chave_acesso?: string // Chave de Acesso da Nota Fiscal
  cliente: string // CNPJ/CPF do Cliente (obrigatório)
  pedido?: string // Número do pedido (obrigatório)
  itens: PedidoPreItem[] // Itens do pedido (obrigatório)
  endereco_entregas?: EnderecoEntrega[] // Endereços de entrega
  observacao?: string // Campo de observações
  prefixo?: string // Tipo do pedido (1-6)
  pedido_vinculado?: string // Pedido de Venda vinculado
  franquia?: string // Franquia vinculada
  transp_nome?: string // Transportadora vinculada
  data_doca?: string // Data de doca (formato yyyy-mm-dd hh:mm:ss)
}

export interface CreatePedidoPreRequest {
  token?: string // Token será adicionado automaticamente
  pedidos: Pedido[] // Lista de solicitações (obrigatório)
}

export interface CreatePedidoPreResponse {
  success: boolean
  message?: string // Mensagem única de sucesso
  messages?: string[] // Array de mensagens (erros ou avisos)
}

// Display types for UI components
export interface PedidoPreDisplay {
  id: number
  numero: string
  cliente: string
  data: string
  dataEntrega: string
  status: string
  valorTotal: string
  quantidadeItens: number
  observacoes?: string
}

// Form types for UI
export interface PedidoPreFormData {
  pedidos: PedidoFormData[]
}

export interface PedidoFormData {
  entrega: string
  nota_fiscal: string
  serie: string
  chave_acesso: string
  cliente: string
  pedido: string
  observacao: string
  prefixo: string
  pedido_vinculado: string
  franquia: string
  transp_nome: string
  data_doca: string
  itens: ItemFormData[]
  endereco_entregas?: EnderecoEntregaFormData[]
}

export interface ItemFormData {
  codigo: string
  qtde: string
}

export interface EnderecoEntregaFormData {
  nome: string
  cnpj: string
  ie: string
  cep: string
  endereco: string
  bairro: string
  cidade: string
  estado: string
  telefone: string
  fis_jur: string
  numero: string
}

// Validation types
export interface ValidationError {
  field: string
  message: string
}

export interface FormValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

// Prefixo constants (tipo do pedido)
export const PEDIDO_PREFIXOS = {
  PEDIDO_VENDA: '1',
  REQUISICAO_INTERNA: '2',
  DEVOLUCAO: '3',
  RETRABALHO: '4',
  PEDIDO_PARTICULARIDADE: '5',
  DESCARTE: '6',
} as const

export type PedidoPrefixo = typeof PEDIDO_PREFIXOS[keyof typeof PEDIDO_PREFIXOS]

// Prefixo display mapping
export const PEDIDO_PREFIXOS_MAP = {
  [PEDIDO_PREFIXOS.PEDIDO_VENDA]: {
    label: 'Pedido de Venda',
    value: '1',
  },
  [PEDIDO_PREFIXOS.REQUISICAO_INTERNA]: {
    label: 'Requisição Interna',
    value: '2',
  },
  [PEDIDO_PREFIXOS.DEVOLUCAO]: {
    label: 'Devolução',
    value: '3',
  },
  [PEDIDO_PREFIXOS.RETRABALHO]: {
    label: 'Retrabalho',
    value: '4',
  },
  [PEDIDO_PREFIXOS.PEDIDO_PARTICULARIDADE]: {
    label: 'Pedido Particularidade',
    value: '5',
  },
  [PEDIDO_PREFIXOS.DESCARTE]: {
    label: 'Descarte',
    value: '6',
  },
} as const

// Pessoa Física/Jurídica constants
export const PESSOA_TIPOS = {
  FISICA: 'F',
  JURIDICA: 'J',
} as const

export const PESSOA_TIPOS_MAP = {
  [PESSOA_TIPOS.FISICA]: {
    label: 'Pessoa Física',
    value: 'F',
  },
  [PESSOA_TIPOS.JURIDICA]: {
    label: 'Pessoa Jurídica',
    value: 'J',
  },
} as const