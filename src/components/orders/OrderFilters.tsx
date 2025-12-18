'use client'

import { useState, useEffect } from 'react'
import { OrderFilters } from '@/types/orders'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { X, Search } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'

interface OrderFiltersComponentProps {
  filters: OrderFilters
  onFiltersChange: (filters: OrderFilters) => void
  loading: boolean
  selectedStatus?: string
}


export function OrderFiltersComponent({ 
  filters, 
  onFiltersChange, 
  loading,
  selectedStatus
}: OrderFiltersComponentProps) {
  const [localFilters, setLocalFilters] = useState<OrderFilters>(filters)
  const [isFiltering, setIsFiltering] = useState(false)

  // Debounced function for dynamic filtering
  const debouncedOnFiltersChange = useDebounce((newFilters: OrderFilters) => {
    onFiltersChange(newFilters)
    setIsFiltering(false)
  }, 300)

  const handleFilterChange = (key: keyof OrderFilters, value: string) => {
    const newFilters = { ...localFilters, [key]: value || undefined }
    setLocalFilters(newFilters)
    
    // Show filtering indicator
    setIsFiltering(true)
    
    // Apply filters dynamically with debounce
    debouncedOnFiltersChange(newFilters)
  }

  const clearFilters = () => {
    const emptyFilters = {}
    setLocalFilters(emptyFilters)
    onFiltersChange(emptyFilters)
  }

  // Update local filters when external filters change (e.g., from status cards)
  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const hasActiveFilters = Object.values(localFilters).some(value => value) || (selectedStatus && selectedStatus !== 'all')

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          {selectedStatus && selectedStatus !== 'all' && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Status: {selectedStatus}
            </span>
          )}
          {isFiltering && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              <Search className="h-3 w-3 mr-1 animate-pulse" />
              Filtrando...
            </span>
          )}
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            disabled={loading}
          >
            <X className="h-4 w-4 mr-1" />
            Limpar
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Search by order number */}
        <div>
          <Input
            label="Número do Pedido"
            placeholder="Digite para buscar pedidos..."
            value={localFilters.numero || ''}
            onChange={(e) => handleFilterChange('numero', e.target.value)}
          />
        </div>

        {/* Search by client */}
        <div>
          <Input
            label="Cliente"
            placeholder="Digite para buscar clientes..."
            value={localFilters.cliente || ''}
            onChange={(e) => handleFilterChange('cliente', e.target.value)}
          />
        </div>

        {/* Date range */}
        <div>
          <Input
            label="Data Início"
            type="date"
            value={localFilters.dataInicio || ''}
            onChange={(e) => handleFilterChange('dataInicio', e.target.value)}
          />
        </div>
        
        <div>
          <Input
            label="Data Fim"
            type="date"
            value={localFilters.dataFim || ''}
            onChange={(e) => handleFilterChange('dataFim', e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}