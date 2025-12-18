import { StockItem, StockFilters, StockResponse, StockDisplay, StockStats } from '@/types/stock'
import api from './api'
import { cacheManager } from '@/utils/cache'
import { formatters } from '@/utils/formatters'

const CACHE_TTL = 300000 // 5 minutes (stock data changes less frequently)

export const stockService = {
  async getStock(filters?: StockFilters): Promise<StockDisplay[]> {
    // Check cache first
    const cacheKey = cacheManager.createKey('stock', filters)
    const cachedData = cacheManager.get<StockDisplay[]>(cacheKey)
    
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

      console.log('📡 Fetching stock from API:', params.toString())
      const response = await api.get<StockResponse>(
        `/estoque/saldo-geral?${params.toString()}`
      )

      console.log('✅ Stock API response:', {
        success: response.data.success,
        total: response.data.data.pagination.total,
        message: response.data.message
      })

      // Transform API data to display format (new format: response.data.data.data)
      const stockItems = response.data.data.data || []
      const displayItems: StockDisplay[] = stockItems
        .map(item => ({
          codigo: item.codigo,
          armazem: item.armazem || 'N/A',
          saldoDisponivel: parseFloat(item.saldo_disponivel) || 0,
          saldoTotal: parseFloat(item.saldo_total) || 0,
          pesoDisponivel: parseFloat(item.peso_disponivel) || 0,
          pesoTotal: parseFloat(item.peso_total) || 0
        }))
        .filter(item => {
          // Apply client-side filters if needed
          if (filters?.saldoMinimo && item.saldoDisponivel < filters.saldoMinimo) {
            return false
          }
          if (filters?.codigo && !item.codigo.toLowerCase().includes(filters.codigo.toLowerCase())) {
            return false
          }
          if (filters?.armazem && !item.armazem.toLowerCase().includes(filters.armazem.toLowerCase())) {
            return false
          }
          return true
        })
        .sort((a, b) => {
          // Sort by available stock descending, then by code
          if (b.saldoDisponivel !== a.saldoDisponivel) {
            return b.saldoDisponivel - a.saldoDisponivel
          }
          return a.codigo.localeCompare(b.codigo)
        })
      
      // Cache the result
      cacheManager.set(cacheKey, displayItems, CACHE_TTL)
      
      return displayItems
    } catch (error) {
      console.error('Error fetching stock data:', error)
      throw error
    }
  },

  getStockStats(stockItems: StockDisplay[]): StockStats {
    const totalItens = stockItems.length
    const totalArmazens = new Set(stockItems.map(item => item.armazem)).size
    const itensComSaldo = stockItems.filter(item => item.saldoDisponivel > 0).length
    const itensZerados = stockItems.filter(item => item.saldoDisponivel === 0).length

    return {
      totalItens,
      totalArmazens,
      itensComSaldo,
      itensZerados
    }
  },

  async exportStock(filters?: StockFilters): Promise<Blob> {
    try {
      const stockItems = await this.getStock(filters)
      const csvContent = this.generateCSV(stockItems)
      return new Blob([csvContent], { type: 'text/csv' })
    } catch (error) {
      console.error('Error exporting stock data:', error)
      throw error
    }
  },

  generateCSV(stockItems: StockDisplay[]): string {
    const headers = [
      'Código',
      'Armazém', 
      'Saldo Disponível',
      'Saldo Total',
      'Peso Disponível (kg)',
      'Peso Total (kg)'
    ]
    
    const rows = stockItems.map(item => [
      item.codigo,
      item.armazem,
      item.saldoDisponivel.toFixed(2),
      item.saldoTotal.toFixed(2),
      item.pesoDisponivel.toFixed(3),
      item.pesoTotal.toFixed(3)
    ])
    
    return [headers, ...rows].map(row => row.join(',')).join('\n')
  },

  formatNumber(value: number, decimals: number = 2): string {
    return formatters.number(value, decimals)
  }
}