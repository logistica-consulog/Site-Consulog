// Estrutura do endpoint /pedidos (listagem)
export interface Order {
  id: number
  criado: string
  empresa: number
  status: string
  user: number
  observacao: string
  conferido: string | null
  data_add: string
  data_alt: string
  proprietario: number
  cliente: number
  data_entrega: string
  pedido_venda: string
  ordem_montagem: string | null
  status_id: number
  nota_fiscal: string | null
  serie_nota_fiscal: string | null
  tipo_frete: string | null
  cliente_cnpj: string
  cod_rota: string
  sequencia_entrega: string
  transp_cnpj: string | null
  transp_nome: string
  doca_id: number
  status_o: string | null
  status_id_o: number | null
  prefixo: string
  cod_ponto_entrega: string
  desc_ponto_entrega: string
  etiqueta_emitida: boolean
  cod_empresa: string | null
  data_nota: string | null
  tempo_nota: string | null
  data_exped: string | null
  tempo_exped: string | null
  cliente_nome: string | null
  num_carga: string | null
  chave_acesso: string | null
  agrupado: boolean
  qtde_pedidos_carga: number | null
  transp_placa: string | null
  chave_acesso_emb: string | null
  nota_fiscal_emb: string | null
  serie_nota_fiscal_emb: string | null
  editado: boolean
  danfe: string | null
  xml_filial: number
  estoque_canal_id: string | null
  nivel_acordo_id: string | null
  info_pedido_omie: boolean
  status_atualizado_via_script: boolean
  integrou_bloqueado: boolean
  entrega_completa: boolean
  volumes_entregues: string | null
  aceite_realizado: boolean
  rt: string | null
  conf_carrinho_ini: boolean
  conf_carrinho_fim: boolean
  nf_manual_conf: string | null
  cria_pedido_bling: boolean
  itens?: OrderItemBasic[]
  pedido_items?: OrderItemBasic[]
  endereco_entregas?: EnderecoEntrega[]
}

// Estrutura básica de item (endpoint /pedidos)
export interface OrderItemBasic {
  id: number
  nf_id: number
  prod_id: number
  prod_qcom: string
  pedido: number
  posicao_id: number
  endereco: string
  nf_cnf: string
  prod_cprod: string
  prod_xprod: string
  prod_ucom: string
  local_id: number
  referencia: string
  conferido: string | null
  alocacao_id: number
  data_add: string
  data_alt: string
  empresa: number | null
  data_vcto: string | null
  prod_qcom_mov: string
  hunit: number
  tracking: string | null
  status: number
  status_o: string | null
  sequencia: number
  armazem: string
  picking_inicio: string | null
  picking_fim: string | null
  picking_tempo: string | null
  user_id: number | null
  tipo_volume: string | null
  avaria: string | null
  avaria_qtd: string | null
  avaria_posicao_id: string | null
  avaria_data: string | null
  avaria_usuario_id: string | null
  lote: string | null
  unidade_medida_secundaria: string | null
  qtde_secundaria: string | null
  alocacao_id_baixa: string | null
  prod_qcom_baixa: string | null
  data_baixa: string | null
  nf_saida_id: string | null
  prod_qcom_conf: string
  nf_entrada_id: string | null
  embalagem_id: string | null
  prod_pai: string | null
  id_integracao: number
  conferencia_reentrada: boolean
  liberacao_reentrada: boolean
  item_reentrada: boolean
  qtde_reentrada: string | null
  alocacao_reentrada: boolean
  nr_reentrada: boolean
  prod_qcom_conf_aceite: string | null
  conferencia_inicio: string | null
  conferencia_fim: string | null
  conferencia_tempo: string | null
  hu_conf_express: string | null
  preco: string | null
  tabela_preco: string | null
  serie: string | null
  ca: string | null
  reload: boolean
  realocacao: boolean
  realocacao_fim: boolean
  nova_linha: boolean
}

// Estrutura do endpoint /pedidos/lotes (detalhes completos)
export interface OrderLote {
  id: number
  pedido: string // Número do pedido (ex: "000082218-XXX")
  num_carga: string | null
  volumes: string | null
  nota_fiscal: string
  serie_nota_fiscal: string
  data_add: string
  situacao: string // Ex: "Aberto"
  cod_status: number
  status_produtos: string // Ex: "Produtos separados"
  produtos_separados: string // "S" ou "N"
  editado: boolean
  status: string // Ex: "Em Conferencia"
  itens: OrderItem[]
  endereco_entregas?: EnderecoEntrega[] | null // Pode ser null no endpoint /lotes/geral
}

// Resposta do endpoint /pedidos/lotes/geral (lista paginada de lotes)
export interface OrderLotesGeralResponse {
  success: boolean
  data: {
    total: number
    por_pagina: number
    pagina_atual: number
    ultima_pagina: number
    proxima_pagina_url: string | null
    pagina_anterior_url: string | null
    de: number
    ate: number
    dados: OrderLote[]
  }
  message?: string
  errors?: string[]
}

export interface OrderItem {
  produto: string // Código do produto
  hunit: number
  lote: string
  endereco: string
  qtde_solicitada: string
  qtde_separada: string
  peso_liquido_total: string
  peso_bruto_total: string
}

export interface EnderecoEntrega {
  id: number
  nome: string
  cnpj: string
  ie: string
  cep: string
  endereco: string
  bairro: string
  cidade: string
  estado: string
  telefone: string
  fis_jur: string // "F" ou "J"
  pedido_id: number
  data_add: string
  data_alt: string
  pedido_pre_id: number
  numero: string
  complemento: string | null
}

export type OrderStatus =
  | 'Pendente'
  | 'Aguardando Separação'
  | 'Em separação'
  | 'Aguardando conferência'
  | 'Em conferência'
  | 'Aguardando carregamento'
  | 'Finalizado'

// Helper interfaces for display (usando dados de /pedidos)
export interface OrderDisplay {
  id: number
  numero: string
  data: string
  cliente: string
  dataEntrega: string
  dataEntregaISO?: string | null // ISO format for filtering (YYYY-MM-DD)
  transportadora: string
  status: string
  notaFiscal: string
  numCarga: string | null
  items: number
}

// Display interface para OrderLote (usando dados de /pedidos/lotes/geral)
export interface OrderLoteDisplay {
  id: number
  pedido: string // Número do pedido
  data: string // data_add formatada
  cliente: string // Nome do cliente (do endereco_entregas ou "Cliente não informado")
  clienteCnpj: string // CNPJ do cliente (do endereco_entregas)
  dataEntrega: string // Formatada para exibição
  dataEntregaISO?: string | null
  status: string
  situacao: string // from lote
  notaFiscal: string // from lote
  serieNotaFiscal: string // from lote
  numCarga: string | null // from lote
  volumes: string | null // from lote
  items: number
  statusProdutos: string // from lote
  produtosSeparados: boolean // from lote (S/N -> boolean)
  editado: boolean // from lote
  itens: OrderItem[] // detailed items from lote
  enderecoEntregas?: EnderecoEntrega[] | null // from lote (pode ser null)
}

// Resposta paginada para OrderLote
export interface OrderLotesPaginatedResponse {
  orders: OrderLoteDisplay[]
  originalOrders: OrderLote[]
  totalCount: number
  currentPage: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  errors?: string[] // Partial failures
}

// Status mapping for display (mapeando diretamente - sem transformação)
export const ORDER_STATUS_MAP: Record<string, string> = {
  'Pendente': 'Pendente',
  'Aguardando Separação': 'Aguardando Separação',
  'Em separação': 'Em separação',
  'Aguardando conferência': 'Aguardando conferência',
  'Em conferência': 'Em conferência',
  'Aguardando carregamento': 'Aguardando carregamento',
  'Finalizado': 'Finalizado'
}

export interface OrderFilters {
  status?: string
  dataInicio?: string
  dataFim?: string
  cliente?: string
  numero?: string
  situacao?: string // Filtro para situação do lote
  numCarga?: string // Filtro para número de carga
}

export interface OrdersResponse {
  success: boolean
  data: Order[]
  message?: string
}

export interface OrdersPaginatedResponse {
  orders: OrderDisplay[]
  originalOrders: Order[]
  totalCount: number
  currentPage: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export const ORDER_STATUS_COLORS: Record<string, string> = {
  'Pendente': 'warning',
  'Aguardando Separação': 'warning',
  'Em separação': 'info',
  'Aguardando conferência': 'warning',
  'Em conferência': 'info',
  'Aguardando carregamento': 'info',
  'Finalizado': 'success'
}