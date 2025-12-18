'use client'

import { useEffect, useState } from 'react'
import { OrderLoteDisplay, OrderFilters, OrderLote } from '@/types/orders'
import { ordersLotesService } from '@/services/ordersLotes'
import { OrdersTable } from '@/components/orders/OrdersTable'
import { OrderFiltersComponent } from '@/components/orders/OrderFilters'
import { OrdersStats } from '@/components/orders/OrdersStats'
import { OrdersSkeleton } from '@/components/ui/OrdersSkeleton'
import { Button } from '@/components/ui/Button'
import { Download, RefreshCw } from 'lucide-react'

export default function PedidosPage() {
  const [orders, setOrders] = useState<OrderLoteDisplay[]>([])
  const [originalOrders, setOriginalOrders] = useState<OrderLote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState<OrderFilters>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<string | 'all'>('all')
  const [lastLoadTime, setLastLoadTime] = useState<number | null>(null)
  const [cacheHit, setCacheHit] = useState(false)
  const [statusCounts, setStatusCounts] = useState({
    total: 0,
    pendente: 0,
    aguardandoSeparacao: 0,
    emSeparacao: 0,
    aguardandoConferencia: 0,
    emConferencia: 0,
    aguardandoCarregamento: 0,
    finalizado: 0
  })

  const loadOrders = async (page: number = 1, newFilters: OrderFilters = filters) => {
    try {
      setLoading(true)
      setError('')
      setCacheHit(false)

      const startTime = Date.now()
      const response = await ordersLotesService.getOrdersWithLotes(page, undefined, newFilters)
      const loadTime = Date.now() - startTime

      setOrders(response.orders)
      setOriginalOrders(response.originalOrders)
      setCurrentPage(response.currentPage)
      setTotalPages(response.totalPages)
      setTotalCount(response.totalCount)
      setLastLoadTime(loadTime)

      // Check if this was likely a cache hit (very fast response)
      setCacheHit(loadTime < 100)

      // Calculate status counts from filtered data (excluding status filter)
      // This gives us counts for each status WITHIN the current filter context
      const filtersWithoutStatus = { ...newFilters }
      delete filtersWithoutStatus.status

      const responseForCounts = await ordersLotesService.getOrdersWithLotes(1, undefined, filtersWithoutStatus)

      const counts = {
        total: responseForCounts.orders.length,
        pendente: responseForCounts.orders.filter((o: OrderLoteDisplay) => o.status === 'Pendente').length,
        aguardandoSeparacao: responseForCounts.orders.filter((o: OrderLoteDisplay) => o.status === 'Aguardando Separação').length,
        emSeparacao: responseForCounts.orders.filter((o: OrderLoteDisplay) => o.status === 'Em Separação').length,
        aguardandoConferencia: responseForCounts.orders.filter((o: OrderLoteDisplay) => o.status === 'Aguardando Conferencia').length,
        emConferencia: responseForCounts.orders.filter((o: OrderLoteDisplay) => o.status === 'Em Conferencia').length,
        aguardandoCarregamento: responseForCounts.orders.filter((o: OrderLoteDisplay) => o.status === 'Aguardando Carregamento').length,
        finalizado: responseForCounts.orders.filter((o: OrderLoteDisplay) => o.status === 'Finalizado').length,
      }
      setStatusCounts(counts)
    } catch (err) {
      setError('Erro ao carregar pedidos. Tente novamente.')
      console.error('Error loading orders:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadOrders(currentPage, filters)
    setRefreshing(false)
  }

  const handleFilterChange = (newFilters: OrderFilters) => {
    setFilters(newFilters)
    setCurrentPage(1)
    // Reset status selection if filters are cleared
    if (!newFilters.status) {
      setSelectedStatus('all')
    }
    loadOrders(1, newFilters)
  }

  const handleStatusFilter = (status: string | 'all') => {
    setSelectedStatus(status)
    const newFilters = { 
      ...filters, 
      status: status === 'all' ? undefined : status 
    }
    setFilters(newFilters)
    setCurrentPage(1)
    loadOrders(1, newFilters)
  }

  const handleExport = async () => {
    try {
      const blob = await ordersLotesService.exportOrders(filters)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `pedidos_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Error exporting orders:', err)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  return (
    <>
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Consulta de Pedidos
                </h1>
                <div className="flex items-center space-x-4 mt-1">
                  <p className="text-sm text-gray-500">
                    Acompanhe o status dos seus pedidos em tempo real
                  </p>
                  {lastLoadTime && (
                    <div className="flex items-center space-x-2">
                      {cacheHit ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ⚡ Cache ({lastLoadTime}ms)
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          📡 API ({lastLoadTime}ms)
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  loading={refreshing}
                  disabled={loading}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  disabled={loading}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section - Top */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <OrderFiltersComponent
            filters={filters}
            onFiltersChange={handleFilterChange}
            loading={loading}
            selectedStatus={selectedStatus}
          />
        </div>
      </div>

      {/* Main Content - Stats and Orders Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Content with loading states */}
        {loading ? (
          <OrdersSkeleton />
        ) : (
          <>
            {/* Statistics Cards */}
            <OrdersStats
              orders={orders}
              totalCount={totalCount}
              selectedStatus={selectedStatus}
              onStatusFilter={handleStatusFilter}
              statusCounts={statusCounts}
            />

            {/* Orders Table */}
            <OrdersTable
              orders={orders}
              originalOrders={originalOrders}
              loading={false}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => {
                setCurrentPage(page)
                loadOrders(page, filters)
              }}
            />
          </>
        )}
      </div>
    </>
  )
}