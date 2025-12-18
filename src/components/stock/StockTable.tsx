'use client'

import { StockDisplay, WAREHOUSE_COLORS } from '@/types/stock'
import { stockService } from '@/services/stock'
import { Package2, Weight } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'

interface StockTableProps {
  stockItems: StockDisplay[]
  loading: boolean
}

export function StockTable({ stockItems, loading }: StockTableProps) {
  const formatNumber = (value: number, decimals: number = 2) => {
    return stockService.formatNumber(value, decimals)
  }

  const getWarehouseBadgeColor = (warehouse: string) => {
    return WAREHOUSE_COLORS[warehouse] || WAREHOUSE_COLORS['default']
  }

  const getStockStatus = (available: number, total: number) => {
    if (available === 0) return { text: 'Sem Saldo', color: 'error' as const }
    if (available < total * 0.1) return { text: 'Baixo', color: 'warning' as const }
    if (available === total) return { text: 'Completo', color: 'success' as const }
    return { text: 'Disponível', color: 'info' as const }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200"></div>
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 border-t border-gray-200"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Código do Produto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Armazém
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Saldo Disponível
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Saldo Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Peso (kg)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {stockItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <Package2 className="h-8 w-8 text-gray-400 mb-2" />
                    <p>Nenhum produto encontrado</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Tente ajustar os filtros ou verifique sua conexão
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              stockItems.map((item, index) => {
                const stockStatus = getStockStatus(item.saldoDisponivel, item.saldoTotal)
                
                return (
                  <tr key={`${item.codigo}-${item.armazem}-${index}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Package2 className="h-4 w-4 text-gray-400 mr-2" />
                        <div className="text-sm font-medium text-gray-900">
                          {item.codigo}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getWarehouseBadgeColor(item.armazem)}`}>
                        {item.armazem}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="font-medium">
                        {formatNumber(item.saldoDisponivel)}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatNumber(item.saldoTotal)}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center">
                        <Weight className="h-3 w-3 mr-1" />
                        <span className="text-xs">
                          {formatNumber(item.pesoDisponivel, 3)}
                        </span>
                      </div>
                      {item.pesoTotal !== item.pesoDisponivel && (
                        <div className="text-xs text-gray-400">
                          Total: {formatNumber(item.pesoTotal, 3)}
                        </div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={stockStatus.color}>
                        {stockStatus.text}
                      </Badge>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
      
      {stockItems.length > 0 && (
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
          <div className="text-sm text-gray-700">
            Exibindo {stockItems.length} {stockItems.length === 1 ? 'produto' : 'produtos'}
          </div>
        </div>
      )}
    </div>
  )
}