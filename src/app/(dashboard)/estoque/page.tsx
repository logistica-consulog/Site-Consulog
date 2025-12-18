'use client'

import { useEffect, useState } from 'react'
import { StockDisplay, StockFilters } from '@/types/stock'
import { stockService } from '@/services/stock'
import { StockTable } from '@/components/stock/StockTable'
import { StockFiltersComponent } from '@/components/stock/StockFilters'
import { StockStats } from '@/components/stock/StockStats'
import { Button } from '@/components/ui/Button'
import { Download, RefreshCw } from 'lucide-react'

export default function EstoquePage() {
  const [stockItems, setStockItems] = useState<StockDisplay[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState<StockFilters>({})
  const [refreshing, setRefreshing] = useState(false)
  const [lastLoadTime, setLastLoadTime] = useState<number | null>(null)
  const [cacheHit, setCacheHit] = useState(false)

  const loadStock = async (newFilters: StockFilters = filters) => {
    try {
      setLoading(true)
      setError('')
      setCacheHit(false)
      
      const startTime = Date.now()
      const items = await stockService.getStock(newFilters)
      const loadTime = Date.now() - startTime
      
      setStockItems(items)
      setLastLoadTime(loadTime)
      
      // Check if this was likely a cache hit (very fast response)
      setCacheHit(loadTime < 100)
    } catch (err) {
      setError('Erro ao carregar dados de estoque. Tente novamente.')
      console.error('Error loading stock:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadStock(filters)
    setRefreshing(false)
  }

  const handleFilterChange = (newFilters: StockFilters) => {
    setFilters(newFilters)
    loadStock(newFilters)
  }

  const handleExport = async () => {
    try {
      const blob = await stockService.exportStock(filters)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `estoque_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Error exporting stock:', err)
      setError('Erro ao exportar dados de estoque.')
    }
  }

  useEffect(() => {
    loadStock()
  }, [])

  const stats = stockService.getStockStats(stockItems)

  return (
    <>
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Consulta de Estoque
                </h1>
                <div className="flex items-center space-x-4 mt-1">
                  <p className="text-sm text-gray-500">
                    Acompanhe os saldos de estoque em tempo real
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
          <StockFiltersComponent
            filters={filters}
            onFiltersChange={handleFilterChange}
            loading={loading}
          />
        </div>
      </div>

      {/* Main Content - Stats and Stock Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Statistics Cards */}
        <StockStats stats={stats} loading={loading} />

        {/* Stock Table */}
        <StockTable stockItems={stockItems} loading={loading} />
      </div>
    </>
  )
}