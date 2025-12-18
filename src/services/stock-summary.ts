import { StockSummaryItem, StockSummaryFilters, StockSummaryResponse, StockSummaryDisplay, StockSummaryStats } from '@/types/stock-summary'
import api from './api'
import { cacheManager } from '@/utils/cache'
import { formatters } from '@/utils/formatters'

const CACHE_TTL = 300000 // 5 minutes (stock data changes less frequently)

export const stockSummaryService = {
  async getStockSummary(filters?: StockSummaryFilters): Promise<StockSummaryDisplay[]> {
    // Check cache first
    const cacheKey = cacheManager.createKey('stock-summary', filters)
    const cachedData = cacheManager.get<StockSummaryDisplay[]>(cacheKey)
    
    if (cachedData) {
      return cachedData
    }
    
    try {
      const params = new URLSearchParams()
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString())
          }
        })
      }

      console.log('📡 Fetching stock summary from API:', params.toString())
      const response = await api.get<StockSummaryResponse>(
        `/estoque/sumarizado-nf?${params.toString()}`
      )
      
      // Transform API data to display format
      const stockSummaryItems = response.data.data || []
      const displayItems: StockSummaryDisplay[] = stockSummaryItems
        .map(item => ({
          material: item.material,
          lote: item.lote,
          notaFiscal: item.nota_fiscal,
          emitente: item.emitente,
          unidadeMedida: item.unid_medida,
          quantidade: parseFloat(item.quantidade) || 0,
          valorTotal: parseFloat(item.valor_total) || 0
        }))
        .filter(item => {
          // Apply client-side filters if needed
          if (filters?.pesquisa && !item.material.toLowerCase().includes(filters.pesquisa.toLowerCase()) 
            && !item.emitente.toLowerCase().includes(filters.pesquisa.toLowerCase())) {
            return false
          }
          return true
        })
        .sort((a, b) => {
          // Sort by valor total descending, then by material
          if (b.valorTotal !== a.valorTotal) {
            return b.valorTotal - a.valorTotal
          }
          return a.material.localeCompare(b.material)
        })
      
      // Cache the result
      cacheManager.set(cacheKey, displayItems, CACHE_TTL)
      
      return displayItems
    } catch (error) {
      console.error('Error fetching stock summary data:', error)
      throw error
    }
  },

  getStockSummaryStats(stockSummaryItems: StockSummaryDisplay[]): StockSummaryStats {
    const totalItens = stockSummaryItems.length
    const totalEmitentes = new Set(stockSummaryItems.map(item => item.emitente)).size
    const valorTotalGeral = stockSummaryItems.reduce((sum, item) => sum + item.valorTotal, 0)
    const totalQuantidade = stockSummaryItems.reduce((sum, item) => sum + item.quantidade, 0)

    return {
      totalItens,
      totalEmitentes,
      valorTotalGeral,
      totalQuantidade
    }
  },

  async exportStockSummary(filters?: StockSummaryFilters): Promise<Blob> {
    try {
      const stockSummaryItems = await this.getStockSummary(filters)
      const csvContent = this.generateCSV(stockSummaryItems)
      return new Blob([csvContent], { type: 'text/csv' })
    } catch (error) {
      console.error('Error exporting stock summary data:', error)
      throw error
    }
  },

  generateCSV(stockSummaryItems: StockSummaryDisplay[]): string {
    const headers = [
      'Material',
      'Lote',
      'Nota Fiscal',
      'Emitente', 
      'Unidade Medida',
      'Quantidade',
      'Valor Total'
    ]
    
    const rows = stockSummaryItems.map(item => [
      item.material,
      item.lote,
      item.notaFiscal,
      item.emitente,
      item.unidadeMedida,
      item.quantidade.toFixed(5),
      item.valorTotal.toFixed(2)
    ])
    
    return [headers, ...rows].map(row => row.join(',')).join('\n')
  },

  formatCurrency(value: number): string {
    return formatters.currency(value)
  },

  formatNumber(value: number, decimals: number = 5): string {
    return formatters.number(value, decimals)
  }
}