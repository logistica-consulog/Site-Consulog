import {
  OrderFilters,
  OrderLotesPaginatedResponse,
  OrderLotesGeralResponse,
  OrderEncerradosResponse,
  OrderLoteDisplay,
  OrderLote,
  Order,
  OrderItem
} from '@/types/orders'
import api from './api'
import { cacheManager } from '@/utils/cache'
import { formatters } from '@/utils/formatters'

const CACHE_TTL = 120000 // 2 minutes

/**
 * Service para buscar pedidos usando o endpoint /pedidos/lotes/geral
 * Este endpoint retorna pedidos com detalhes de lotes em formato paginado (50 por página)
 *
 * IMPORTANTE: Busca todas as páginas para permitir filtragem correta em memória
 */
export const ordersLotesService = {
  /**
   * Busca todos os pedidos com detalhes de lotes
   * Faz múltiplas requisições para buscar todas as páginas dos endpoints
   * /pedidos/lotes/geral e /pedidos/encerrados
   * Cacheia todos os dados e aplica filtros/paginação em memória
   */
  async getOrdersWithLotes(
    page: number = 1,
    limit?: number,
    filters?: OrderFilters
  ): Promise<OrderLotesPaginatedResponse> {
    // Cache key simples - apenas para TODOS os dados (sem filtros na chave)
    const cacheKey = cacheManager.createKey('orders-lotes-combined', { all: true })
    const cachedData = cacheManager.get<OrderLotesPaginatedResponse>(cacheKey)

    if (cachedData) {
      console.log('✅ Usando cache de pedidos combinados')
      return this.applyFiltersInMemory(cachedData, filters, page, limit)
    }

    try {
      console.log('🔄 Buscando todos os pedidos de /pedidos/lotes/geral...')

      // Buscar todos os pedidos do endpoint /pedidos/lotes/geral
      const geralLotes = await this.fetchAllLotesPages()

      console.log(`📋 ${geralLotes.length} pedidos encontrados em /pedidos/lotes/geral`)

      let encerradosLotes: OrderLote[] = []
      try {
        console.log('🔄 Buscando todos os pedidos de /pedidos/encerrados...')

        // Buscar todos os pedidos do endpoint /pedidos/encerrados
        encerradosLotes = await this.fetchAllEncerradosPages()

        console.log(`📋 ${encerradosLotes.length} pedidos encontrados em /pedidos/encerrados`)
      } catch (error) {
        console.warn('⚠️ Erro ao buscar pedidos encerrados, continuando apenas com pedidos gerais:', error)
        // Continuar com apenas os pedidos gerais se o endpoint de encerrados falhar
      }

      // Combinar os dados de ambos os endpoints
      const allLotes = [...geralLotes, ...encerradosLotes]

      console.log(`📋 ${allLotes.length} pedidos encontrados no total (combinado)`)

      // Transformar para formato de display
      const displayLotes = allLotes.map(lote => this.transformLoteToDisplay(lote))

      // Criar resposta completa
      const allData: OrderLotesPaginatedResponse = {
        orders: displayLotes,
        originalOrders: allLotes,
        totalCount: displayLotes.length,
        currentPage: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false
      }

      // Cachear TODOS os dados (uma única entrada de cache)
      cacheManager.set(cacheKey, allData, CACHE_TTL)

      // Aplicar filtros em memória antes de retornar
      return this.applyFiltersInMemory(allData, filters, page, limit)
    } catch (error) {
      console.error('❌ Erro ao buscar pedidos com lotes:', error)
      throw new Error('Não foi possível carregar os pedidos. Tente novamente.')
    }
  },

  /**
   * Busca todas as páginas do endpoint /pedidos/lotes/geral
   * O endpoint retorna 50 itens por página
   */
  async fetchAllLotesPages(): Promise<OrderLote[]> {
    const allLotes: OrderLote[] = []
    let currentPage = 1
    let hasMorePages = true

    while (hasMorePages) {
      const params = new URLSearchParams()
      params.append('page', currentPage.toString())

      console.log(`📄 Buscando página ${currentPage} de /pedidos/lotes/geral...`)

      const response = await api.get<OrderLotesGeralResponse>(
        `/pedidos/lotes/geral?${params.toString()}`
      )

      if (!response.data.success || !response.data.data?.dados) {
        console.error('❌ Resposta inválida da API:', response.data)
        break
      }

      const { dados, pagina_atual, ultima_pagina, de, ate, total } = response.data.data

      allLotes.push(...dados)

      console.log(`   → Página ${pagina_atual}/${ultima_pagina}: itens ${de}-${ate} de ${total}`)

      // Verificar se há mais páginas
      hasMorePages = pagina_atual < ultima_pagina
      currentPage++
    }

    return allLotes
  },

  /**
   * Busca todos os pedidos do endpoint /pedidos/encerrados
   * Este endpoint retorna Order[] diretamente, não OrderLote[]
   * Precisamos transformar para OrderLote para compatibilidade
   */
  async fetchAllEncerradosPages(): Promise<OrderLote[]> {
    console.log(`📄 Buscando pedidos de /pedidos/encerrados...`)

    const response = await api.get<OrderEncerradosResponse>(`/pedidos/encerrados`)

    if (!response.data.success || !response.data.data) {
      console.error('❌ Resposta inválida da API:', response.data)
      return []
    }

    const orders = response.data.data
    console.log(`📋 ${orders.length} pedidos encontrados em /pedidos/encerrados`)

    // Transformar Order para OrderLote
    const lotes = orders.map(order => this.transformOrderToLote(order))

    return lotes
  },

  /**
   * Transforma Order (endpoint /pedidos/encerrados) em OrderLote
   * Para manter compatibilidade com o formato existente
   */
  transformOrderToLote(order: Order): OrderLote {
    // Transformar itens de OrderItemBasic para OrderItem
    const itens: OrderItem[] = (order.itens || order.pedido_items || []).map(item => ({
      produto: item.prod_cprod,
      prod_xprod: item.prod_xprod,
      hunit: item.hunit,
      lote: item.lote || '',
      endereco: item.endereco || '',
      qtde_solicitada: item.prod_qcom,
      qtde_separada: item.prod_qcom_conf || '0',
      peso_liquido_total: '0',
      peso_bruto_total: '0'
    }))

    return {
      id: order.id,
      pedido: order.pedido_venda || order.id.toString(),
      num_carga: order.num_carga,
      volumes: null,
      nota_fiscal: order.nota_fiscal || '',
      serie_nota_fiscal: order.serie_nota_fiscal || '',
      data_add: order.data_add,
      situacao: 'Encerrado',
      cod_status: order.status_id,
      status_produtos: 'Finalizado',
      produtos_separados: 'S',
      editado: order.editado,
      status: order.status === 'F' ? 'Finalizado' : order.status,
      itens: itens,
      endereco_entregas: order.endereco_entregas || null
    }
  },

  /**
   * Transforma OrderLote (API) em OrderLoteDisplay (UI)
   */
  transformLoteToDisplay(lote: OrderLote): OrderLoteDisplay {
    // Extrair dados do cliente (pode ser null no endpoint /lotes/geral)
    const enderecoEntrega = lote.endereco_entregas?.[0]
    const clienteNome = enderecoEntrega?.nome || 'Cliente não informado'
    const clienteCnpj = enderecoEntrega?.cnpj || '-'

    return {
      id: lote.id,
      pedido: lote.pedido,
      data: this.formatDate(lote.data_add),
      cliente: clienteNome,
      clienteCnpj: clienteCnpj,
      dataEntrega: this.formatDate(lote.data_add), // Usando data_add como data de entrega
      dataEntregaISO: this.toISODate(lote.data_add),
      status: lote.status,
      situacao: lote.situacao,
      notaFiscal: lote.nota_fiscal || '-',
      serieNotaFiscal: lote.serie_nota_fiscal || '-',
      numCarga: lote.num_carga,
      volumes: lote.volumes,
      items: lote.itens?.length || 0,
      statusProdutos: lote.status_produtos,
      produtosSeparados: lote.produtos_separados === 'S',
      editado: lote.editado,
      itens: lote.itens || [],
      enderecoEntregas: lote.endereco_entregas || null
    }
  },

  /**
   * Aplica filtros em memória sobre os dados cacheados
   */
  applyFiltersInMemory(
    allData: OrderLotesPaginatedResponse,
    filters?: OrderFilters,
    page: number = 1,
    limit?: number
  ): OrderLotesPaginatedResponse {
    let filteredOrders = [...allData.orders]
    let filteredOriginalOrders = [...allData.originalOrders]

    // Aplicar filtros em memória
    if (filters) {
      // Filtrar por status
      if (filters.status) {
        filteredOrders = filteredOrders.filter(order => order.status === filters.status)
        filteredOriginalOrders = filteredOriginalOrders.filter(order =>
          order.status === filters.status
        )
      }

      // Filtrar por situação
      if (filters.situacao) {
        filteredOrders = filteredOrders.filter(order => order.situacao === filters.situacao)
        filteredOriginalOrders = filteredOriginalOrders.filter(order =>
          order.situacao === filters.situacao
        )
      }

      // Filtrar por número do pedido
      if (filters.numero) {
        const numeroLower = filters.numero.toLowerCase()
        filteredOrders = filteredOrders.filter(order =>
          order.pedido.toLowerCase().includes(numeroLower)
        )
        filteredOriginalOrders = filteredOriginalOrders.filter(order =>
          order.pedido.toLowerCase().includes(numeroLower)
        )
      }

      // Filtrar por número de carga
      if (filters.numCarga) {
        const numCargaLower = filters.numCarga.toLowerCase()
        filteredOrders = filteredOrders.filter(order =>
          order.numCarga?.toLowerCase().includes(numCargaLower)
        )
        filteredOriginalOrders = filteredOriginalOrders.filter(order =>
          order.num_carga?.toLowerCase().includes(numCargaLower)
        )
      }

      // Filtrar por cliente
      if (filters.cliente) {
        const clienteLower = filters.cliente.toLowerCase()
        filteredOrders = filteredOrders.filter(order =>
          order.cliente.toLowerCase().includes(clienteLower) ||
          order.clienteCnpj.toLowerCase().includes(clienteLower)
        )
        filteredOriginalOrders = filteredOriginalOrders.filter(order => {
          const enderecoEntrega = order.endereco_entregas?.[0]
          const nome = enderecoEntrega?.nome || ''
          const cnpj = enderecoEntrega?.cnpj || ''
          return nome.toLowerCase().includes(clienteLower) ||
                 cnpj.toLowerCase().includes(clienteLower)
        })
      }

      // Filtrar por data de início
      if (filters.dataInicio) {
        filteredOrders = filteredOrders.filter(order =>
          order.dataEntregaISO && order.dataEntregaISO >= filters.dataInicio!
        )
        filteredOriginalOrders = filteredOriginalOrders.filter(order => {
          const isoDate = this.toISODate(order.data_add)
          return isoDate && isoDate >= filters.dataInicio!
        })
      }

      // Filtrar por data de fim
      if (filters.dataFim) {
        filteredOrders = filteredOrders.filter(order =>
          order.dataEntregaISO && order.dataEntregaISO <= filters.dataFim!
        )
        filteredOriginalOrders = filteredOriginalOrders.filter(order => {
          const isoDate = this.toISODate(order.data_add)
          return isoDate && isoDate <= filters.dataFim!
        })
      }
    }

    // Aplicar paginação em memória se necessário
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

  /**
   * Formata data para exibição
   */
  formatDate(dateString: string): string {
    return formatters.date(dateString)
  },

  /**
   * Converte data para formato ISO (YYYY-MM-DD)
   */
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
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
      } else if (dateString.includes('/')) {
        // Format: "05/06/2025" or "DD/MM/YYYY" (Brazilian format)
        const [day, month, year] = dateString.split('/')
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
      } else if (dateString.match(/^\d{4}-\d{2}-\d{2}/)) {
        // Already in ISO format: "2025-09-23" or "2025-09-23 00:00"
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

  /**
   * Exporta pedidos filtrados para CSV
   */
  async exportOrders(filters?: OrderFilters): Promise<Blob> {
    // Buscar pedidos filtrados
    const response = await this.getOrdersWithLotes(1, undefined, filters)
    const orders = response.orders

    // Criar CSV
    const headers = [
      'Pedido',
      'Data',
      'Cliente',
      'CNPJ',
      'Status',
      'Situação',
      'Nota Fiscal',
      'Série NF',
      'Num. Carga',
      'Volumes',
      'Itens'
    ]

    const rows = orders.map(order => [
      order.pedido,
      order.data,
      order.cliente,
      order.clienteCnpj,
      order.status,
      order.situacao,
      order.notaFiscal,
      order.serieNotaFiscal,
      order.numCarga || '-',
      order.volumes || '-',
      order.items.toString()
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  }
}
