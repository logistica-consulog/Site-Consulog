'use client'

import { StockStats as StockStatsType } from '@/types/stock'
import { Package, Warehouse, TrendingUp, AlertTriangle } from 'lucide-react'

interface StockStatsProps {
  stats: StockStatsType
  loading?: boolean
}

export function StockStats({ stats, loading }: StockStatsProps) {
  const statCards = [
    {
      name: 'Total de Itens',
      value: stats.totalItens,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      name: 'Armazéns',
      value: stats.totalArmazens,
      icon: Warehouse,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      name: 'Com Saldo',
      value: stats.itensComSaldo,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200'
    },
    {
      name: 'Zerados',
      value: stats.itensZerados,
      icon: AlertTriangle,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200'
    }
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 border border-gray-200 animate-pulse">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-200 rounded-md"></div>
              <div className="ml-4 flex-1">
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-12"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat) => {
        const Icon = stat.icon
        
        return (
          <div
            key={stat.name}
            className={`bg-white rounded-lg shadow p-6 border ${stat.borderColor} hover:shadow-md transition-shadow`}
          >
            <div className="flex items-center">
              <div className={`flex-shrink-0 ${stat.bgColor} p-2 rounded-md`}>
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stat.value.toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}