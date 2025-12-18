'use client'

import { useState } from 'react'
import { StockFilters } from '@/types/stock'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { X } from 'lucide-react'

interface StockFiltersProps {
  filters: StockFilters
  onFiltersChange: (filters: StockFilters) => void
  loading?: boolean
}

export function StockFiltersComponent({ 
  filters, 
  onFiltersChange, 
  loading 
}: StockFiltersProps) {
  const [localFilters, setLocalFilters] = useState<StockFilters>(filters)

  const handleClear = () => {
    const emptyFilters = {}
    setLocalFilters(emptyFilters)
    onFiltersChange(emptyFilters)
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
            label="Código do Produto"
            placeholder="Ex: 04.00011"
            value={localFilters.codigo || ''}
            onChange={(e) => {
              const newFilters = { ...localFilters, codigo: e.target.value || undefined }
              setLocalFilters(newFilters)
              onFiltersChange(newFilters)
            }}
          />
        </div>

        <div>
          <Input
            label="Saldo Mínimo"
            type="number"
            placeholder="0"
            min="0"
            step="0.01"
            value={localFilters.saldoMinimo || ''}
            onChange={(e) => {
              const newFilters = {
                ...localFilters,
                saldoMinimo: e.target.value ? parseFloat(e.target.value) : undefined
              }
              setLocalFilters(newFilters)
              onFiltersChange(newFilters)
            }}
          />
        </div>
      </div>
    </div>
  )
}