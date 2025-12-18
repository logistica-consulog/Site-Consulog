export interface StockItem {
  empresa: number
  codigo: string
  armazem: string | null
  saldo_disponivel: string
  saldo_total: string
  peso_disponivel: string
  peso_total: string
}

export interface StockDisplay {
  codigo: string
  armazem: string
  saldoDisponivel: number
  saldoTotal: number
  pesoDisponivel: number
  pesoTotal: number
}

export interface StockFilters {
  codigo?: string
  armazem?: string
  saldoMinimo?: number
}

export interface StockPagination {
  current_page: number
  per_page: number
  total: number
  total_pages: number
}

export interface StockResponse {
  success: boolean
  data: {
    data: StockItem[]
    pagination: StockPagination
  }
  message: string
}

export interface StockStats {
  totalItens: number
  totalArmazens: number
  itensComSaldo: number
  itensZerados: number
}

export const WAREHOUSE_COLORS: Record<string, string> = {
  'GRU': 'bg-blue-100 text-blue-800',
  'default': 'bg-gray-100 text-gray-800'
}