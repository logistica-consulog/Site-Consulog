'use client'

import { OrderLoteDisplay } from '@/types/orders'
import { Package, Clock, CheckCircle, Truck } from 'lucide-react'

interface OrdersStatsProps {
  orders: OrderLoteDisplay[]
  totalCount: number
  selectedStatus?: string | 'all'
  onStatusFilter: (status: string | 'all') => void
  statusCounts?: {
    total: number
    pendente: number
    aguardandoSeparacao: number
    emSeparacao: number
    aguardandoConferencia: number
    emConferencia: number
    aguardandoCarregamento: number
    finalizado: number
  }
}

export function OrdersStats({ orders, totalCount, selectedStatus = 'all', onStatusFilter, statusCounts }: OrdersStatsProps) {
  // Use provided statusCounts if available, otherwise calculate from current orders
  const stats = statusCounts || {
    total: totalCount,
    pendente: orders.filter((o: OrderLoteDisplay) => o.status === 'Pendente').length,
    aguardandoSeparacao: orders.filter((o: OrderLoteDisplay) => o.status === 'Aguardando Separação').length,
    emSeparacao: orders.filter((o: OrderLoteDisplay) => o.status === 'Em Separação').length,
    aguardandoConferencia: orders.filter((o: OrderLoteDisplay) => o.status === 'Aguardando Conferencia').length,
    emConferencia: orders.filter((o: OrderLoteDisplay) => o.status === 'Em Conferencia').length,
    aguardandoCarregamento: orders.filter((o: OrderLoteDisplay) => o.status === 'Aguardando Carregamento').length,
    finalizado: orders.filter((o: OrderLoteDisplay) => o.status === 'Finalizado').length,
  }

  const statCards = [
    {
      title: 'Total',
      value: stats.total,
      icon: Package,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      filterValue: 'all' as const,
      hoverColor: 'hover:bg-blue-50'
    },
    {
      title: 'Pendente',
      value: stats.pendente,
      icon: Clock,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      filterValue: 'Pendente',
      hoverColor: 'hover:bg-yellow-50'
    },
    {
      title: 'Aguard. Separação',
      value: stats.aguardandoSeparacao,
      icon: Clock,
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      filterValue: 'Aguardando Separação',
      hoverColor: 'hover:bg-orange-50'
    },
    {
      title: 'Em Separação',
      value: stats.emSeparacao,
      icon: Package,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      filterValue: 'Em Separação',
      hoverColor: 'hover:bg-purple-50'
    },
    {
      title: 'Aguard. Conferência',
      value: stats.aguardandoConferencia,
      icon: Clock,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      filterValue: 'Aguardando Conferencia',
      hoverColor: 'hover:bg-yellow-50'
    },
    {
      title: 'Em Conferência',
      value: stats.emConferencia,
      icon: CheckCircle,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-600',
      filterValue: 'Em Conferencia',
      hoverColor: 'hover:bg-indigo-50'
    },
    {
      title: 'Aguard. Carregamento',
      value: stats.aguardandoCarregamento,
      icon: Truck,
      color: 'bg-cyan-500',
      textColor: 'text-cyan-600',
      filterValue: 'Aguardando Carregamento',
      hoverColor: 'hover:bg-cyan-50'
    },
    {
      title: 'Finalizado',
      value: stats.finalizado,
      icon: CheckCircle,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      filterValue: 'Finalizado',
      hoverColor: 'hover:bg-green-50'
    }
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
      {statCards.map((stat, index) => {
        const IconComponent = stat.icon
        const isSelected = selectedStatus === stat.filterValue
        return (
          <button
            key={index}
            onClick={() => onStatusFilter(stat.filterValue)}
            className={`bg-white rounded-lg shadow p-2 border-2 transition-all duration-200 w-full ${
              isSelected
                ? 'border-blue-500 shadow-lg transform scale-105'
                : 'border-gray-200 hover:shadow-md'
            } ${stat.hoverColor} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
          >
            <div className="flex flex-col space-y-2">
              <p className={`text-xs font-medium text-left ${
                isSelected ? 'text-blue-700' : 'text-gray-500'
              }`}>
                {stat.title}
              </p>
              <div className="flex items-center">
                <div className={`${stat.color} rounded-lg p-2 mr-2 ${isSelected ? 'shadow-md' : ''}`}>
                  <IconComponent className="h-4 w-4 text-white" />
                </div>
                <p className={`text-lg font-bold ${
                  isSelected ? 'text-blue-700' : stat.textColor
                }`}>
                  {stat.value}
                </p>
              </div>
            </div>
            {isSelected && (
              <div className="mt-2">
                <div className="h-1 bg-blue-500 rounded-full"></div>
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}