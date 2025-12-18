'use client'

import { useState } from 'react'
import { StockSummaryFilters as FilterType } from '@/types/stock-summary'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { X } from 'lucide-react'

interface StockSummaryFiltersProps {
  filters: FilterType
  onFilterChange: (filters: FilterType) => void
  loading: boolean
}

export function StockSummaryFilters({ filters, onFilterChange, loading }: StockSummaryFiltersProps) {
  const [localFilters, setLocalFilters] = useState<FilterType>(filters)
  
  const handleClear = () => {
    const emptyFilters: FilterType = {}
    setLocalFilters(emptyFilters)
    onFilterChange(emptyFilters)
  }

  const hasFilters = Object.values(localFilters).some(value => value !== undefined && value !== '' && value !== null)

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          {/* Status indicators can be added here if needed */}
        </div>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            disabled={loading}
          >
            <X className="h-4 w-4 mr-1" />
            Limpar
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Input
            label="CNPJ do Depositante"
            placeholder="00.000.000/0000-00"
            value={localFilters.depositante_cnpj || ''}
            onChange={(e) => {
              const newFilters = { ...localFilters, depositante_cnpj: e.target.value || undefined }
              setLocalFilters(newFilters)
              onFilterChange(newFilters)
            }}
          />
        </div>

        <div>
          <Input
            label="Pesquisar"
            placeholder="Material, emitente..."
            value={localFilters.pesquisa || ''}
            onChange={(e) => {
              const newFilters = { ...localFilters, pesquisa: e.target.value || undefined }
              setLocalFilters(newFilters)
              onFilterChange(newFilters)
            }}
          />
        </div>
      </div>
    </div>
  )
}