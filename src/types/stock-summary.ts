export interface StockSummaryItem {
  material: string
  lote: string
  nota_fiscal: string
  emitente: string
  unid_medida: string
  quantidade: string
  valor_total: string
}

export interface StockSummaryResponse {
  success: boolean
  data: StockSummaryItem[]
  message?: string
}

export interface StockSummaryDisplay {
  material: string
  lote: string
  notaFiscal: string
  emitente: string
  unidadeMedida: string
  quantidade: number
  valorTotal: number
}

export interface StockSummaryFilters {
  depositante_cnpj?: string
  pesquisa?: string
}

export interface StockSummaryStats {
  totalItens: number
  totalEmitentes: number
  valorTotalGeral: number
  totalQuantidade: number
}