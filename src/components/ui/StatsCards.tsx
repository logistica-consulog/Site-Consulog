'use client'

import { LucideIcon } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface StatCard {
  id: string
  title: string
  value: number | string
  icon: LucideIcon
  color?: string
  bgColor?: string
  borderColor?: string
  subtitle?: string
  trend?: {
    value: number
    isPositive: boolean
    label?: string
  }
  onClick?: () => void
  isSelected?: boolean
  loading?: boolean
}

interface StatsCardsProps {
  cards: StatCard[]
  loading?: boolean
  columns?: 1 | 2 | 3 | 4 | 5 | 6
  className?: string
}

const COLUMN_CLASSES = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
  6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
}

const DEFAULT_COLORS = {
  color: 'text-blue-600',
  bgColor: 'bg-blue-50',
  borderColor: 'border-blue-200'
}

export function StatsCards({ 
  cards, 
  loading = false, 
  columns = 4, 
  className 
}: StatsCardsProps) {
  if (loading) {
    return (
      <div className={cn('grid gap-6 mb-8', COLUMN_CLASSES[columns], className)}>
        {[...Array(cards.length || 4)].map((_, i) => (
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
    <div className={cn('grid gap-6 mb-8', COLUMN_CLASSES[columns], className)}>
      {cards.map((card) => {
        const Icon = card.icon
        const colors = {
          color: card.color || DEFAULT_COLORS.color,
          bgColor: card.bgColor || DEFAULT_COLORS.bgColor,
          borderColor: card.borderColor || DEFAULT_COLORS.borderColor
        }
        
        const isClickable = !!card.onClick
        
        return (
          <div
            key={card.id}
            className={cn(
              'bg-white rounded-lg shadow p-6 border transition-all duration-200',
              colors.borderColor,
              card.isSelected && 'ring-2 ring-blue-500 ring-opacity-50',
              isClickable && 'cursor-pointer hover:shadow-md hover:-translate-y-0.5',
              card.loading && 'opacity-50'
            )}
            onClick={card.onClick}
          >
            <div className="flex items-center">
              <div className={cn('flex-shrink-0 p-2 rounded-md', colors.bgColor)}>
                <Icon className={cn('h-6 w-6', colors.color)} />
              </div>
              
              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-600">
                    {card.title}
                  </p>
                  {card.trend && (
                    <div className={cn(
                      'flex items-center text-xs font-medium',
                      card.trend.isPositive ? 'text-green-600' : 'text-red-600'
                    )}>
                      <span className={cn(
                        'inline-block w-0 h-0 mr-1',
                        card.trend.isPositive 
                          ? 'border-l-2 border-r-2 border-b-2 border-l-transparent border-r-transparent border-b-green-600'
                          : 'border-l-2 border-r-2 border-t-2 border-l-transparent border-r-transparent border-t-red-600'
                      )}></span>
                      {Math.abs(card.trend.value)}%
                      {card.trend.label && (
                        <span className="ml-1 text-gray-500">
                          {card.trend.label}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="mt-1">
                  <p className="text-2xl font-bold text-gray-900">
                    {typeof card.value === 'number' 
                      ? card.value.toLocaleString('pt-BR')
                      : card.value
                    }
                  </p>
                  {card.subtitle && (
                    <p className="text-xs text-gray-500 mt-1">
                      {card.subtitle}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {card.loading && (
              <div className="absolute inset-0 bg-white bg-opacity-50 rounded-lg flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}