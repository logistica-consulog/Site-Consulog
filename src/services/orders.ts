import { OrderFilters, OrdersPaginatedResponse, OrdersResponse, OrderDisplay } from '@/types/orders'
import api from './api'
import { cacheManager } from '@/utils/cache'
import { formatters } from '@/utils/formatters'

const CACHE_TTL = 120000 // 2 minutes

export const ordersService = {
  async getOrders(
    page: number = 1,
    limit?: number,
    filters?: OrderFilters
  ): Promise<OrdersPaginatedResponse> {
    // Simple cache key - only for ALL data (no filters in cache key)
    const cacheKey = cacheManager.createKey('orders', { all: true })
    const cachedData = cacheManager.get<OrdersPaginatedResponse>(cacheKey)

    if (cachedData) {
      // Apply filters in memory
      return this.applyFiltersInMemory(cachedData, filters, page, limit)
    }

    try {
      const params = new URLSearchParams()

      // Only add pagination for API request
      params.append('page', '1')
      // No limit - get all data

      const response = await api.get<OrdersResponse>(
        `/pedidos?${params.toString()}`
      )

      // Transform API data to display format
      const orders = response.data.data || []
      const displayOrders: OrderDisplay[] = orders.map(order => ({
        id: order.id,
        numero: order.pedido_venda || order.id.toString(),
        data: this.formatDate(order.criado),
        cliente: order.cliente_cnpj || order.cliente_nome || 'Cliente não informado',
        dataEntrega: this.formatDate(order.data_entrega),
        dataEntregaISO: this.toISODate(order.data_entrega),
        transportadora: order.transp_nome || 'Não informado',
        status: order.status,
        notaFiscal: order.nota_fiscal || '-',
        numCarga: order.num_carga,
        items: order.itens ? order.itens.length : 0
      }))

      // Store ALL data in cache
      const allData = {
        orders: displayOrders,
        originalOrders: orders,
        totalCount: displayOrders.length,
        currentPage: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false
      }

      // Cache ALL the data (single cache entry)
      cacheManager.set(cacheKey, allData, CACHE_TTL)

      // Apply filters in memory before returning
      return this.applyFiltersInMemory(allData, filters, page, limit)
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error)
      throw new Error('Não foi possível carregar os pedidos. Tente novamente.')
    }
  },

  applyFiltersInMemory(
    allData: OrdersPaginatedResponse,
    filters?: OrderFilters,
    page: number = 1,
    limit?: number
  ): OrdersPaginatedResponse {
    let filteredOrders = [...allData.orders]
    let filteredOriginalOrders = [...allData.originalOrders]

    // Apply filters in memory
    if (filters) {
      // Filter by status (using "status" field from new API)
      if (filters.status) {
        filteredOrders = filteredOrders.filter(order => order.status === filters.status)
        filteredOriginalOrders = filteredOriginalOrders.filter(order =>
          order.status === filters.status
        )
      }

      // Filter by numero (pedido_venda field)
      if (filters.numero) {
        const numeroLower = filters.numero.toLowerCase()
        filteredOrders = filteredOrders.filter(order =>
          order.numero.toLowerCase().includes(numeroLower)
        )
        filteredOriginalOrders = filteredOriginalOrders.filter(order =>
          (order.pedido_venda || '').toLowerCase().includes(numeroLower)
        )
      }

      // Filter by cliente
      if (filters.cliente) {
        const clienteLower = filters.cliente.toLowerCase()
        filteredOrders = filteredOrders.filter(order =>
          order.cliente.toLowerCase().includes(clienteLower)
        )
        filteredOriginalOrders = filteredOriginalOrders.filter(order =>
          (order.cliente_cnpj || order.cliente_nome || '').toLowerCase().includes(clienteLower)
        )
      }

      // Filter by date range (data_entrega field)
      if (filters.dataInicio) {
        filteredOrders = filteredOrders.filter(order =>
          order.dataEntregaISO && order.dataEntregaISO >= filters.dataInicio!
        )
        filteredOriginalOrders = filteredOriginalOrders.filter(order => {
          const isoDate = this.toISODate(order.data_entrega)
          return isoDate && isoDate >= filters.dataInicio!
        })
      }

      if (filters.dataFim) {
        filteredOrders = filteredOrders.filter(order =>
          order.dataEntregaISO && order.dataEntregaISO <= filters.dataFim!
        )
        filteredOriginalOrders = filteredOriginalOrders.filter(order => {
          const isoDate = this.toISODate(order.data_entrega)
          return isoDate && isoDate <= filters.dataFim!
        })
      }
    }

    // Apply pagination in memory if needed
    const totalCount = filteredOrders.length
    const totalPages = limit ? Math.ceil(totalCount / limit) : 1
    const startIndex = limit ? (page - 1) * limit : 0
    const endIndex = limit ? startIndex + limit : totalCount

    return {
      orders: filteredOrders.slice(startIndex, endIndex),
      originalOrders: filteredOriginalOrders.slice(startIndex, endIndex),
      totalCount,
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    }
  },

  formatDate(dateString: string): string {
    return formatters.date(dateString)
  },

  toISODate(dateString: string | null | undefined): string | null {
    if (!dateString || dateString === 'null' || dateString === 'undefined') {
      return null
    }

    try {
      // Handle different date formats from API
      if (dateString.includes(' - ')) {
        // Format: "05/06/2025 - 14:44:50" (Brazilian format with time)
        const [datePart] = dateString.split(' - ')
        const [day, month, year] = datePart.split('/')
        // Return ISO format directly from parsed values (no Date object to avoid timezone issues)
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
      } else if (dateString.includes('/')) {
        // Format: "05/06/2025" or "DD/MM/YYYY" (Brazilian format)
        const [day, month, year] = dateString.split('/')
        // Return ISO format directly from parsed values (no Date object to avoid timezone issues)
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
      } else if (dateString.match(/^\d{4}-\d{2}-\d{2}/)) {
        // Already in ISO format: "2025-09-23" or "2025-09-23 00:00"
        // Extract just the date part (YYYY-MM-DD)
        return dateString.substring(0, 10)
      } else {
        // Other formats - try to parse with Date object
        const date = new Date(dateString)

        if (isNaN(date.getTime())) {
          return null
        }

        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      }
    } catch (error) {
      console.warn('Date ISO conversion error:', error, 'Input:', dateString)
      return null
    }
  },

  async exportOrders(filters?: OrderFilters): Promise<Blob> {
    // Get filtered orders from cache/API
    const response = await this.getOrders(1, undefined, filters)

    // Generate CSV from filtered orders
    const csvContent = this.generateCSV(response.orders)
    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  },

  generateCSV(orders: OrderDisplay[]): string {
    // UTF-8 BOM for Excel compatibility
    const BOM = '\uFEFF'

    const headers = [
      'ID',
      'Data',
      'Pedido',
      'Cliente',
      'Data Entrega',
      'Transportadora',
      'Status',
      'Nota Fiscal',
      'Num. Carga',
      'Total Itens'
    ]
    const rows = orders.map(order => [
      order.id.toString(),
      order.data,
      order.numero,
      order.cliente,
      order.dataEntrega,
      order.transportadora,
      order.status,
      order.notaFiscal,
      order.numCarga || '-',
      order.items.toString()
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    return BOM + csvContent
  }
}