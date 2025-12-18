'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Package, 
  ClipboardList, 
  FileText,
  Menu,
  Plus
} from 'lucide-react'
import { cn } from '@/utils/cn'

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()

  const menuItems = [
    {
      name: 'Pedidos',
      href: '/pedidos',
      icon: ClipboardList
    },
    {
      name: 'Criar Pedido',
      href: '/pedido-pre',
      icon: Plus
    },
    {
      name: 'Estoque',
      href: '/estoque',
      icon: Package
    },
    {
      name: 'Estoque Sumarizado',
      href: '/estoque-sumarizado',
      icon: FileText
    }
  ]

  return (
    <div 
      className={cn(
        'bg-white shadow-lg border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col group',
        'w-20 hover:w-64',
        className
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center overflow-hidden">
        <div className="px-3 py-2">
          <Menu className="h-5 w-5 text-gray-700 flex-shrink-0" />
        </div>
        <span className="text-lg font-semibold text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap delay-75">
          Menu
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200',
                'hover:bg-gray-100 overflow-hidden',
                isActive 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:text-gray-900'
              )}
              title={item.name}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-blue-700 rounded-r-md"></div>
              )}
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap delay-75">
                {item.name}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 overflow-hidden">
        <div className="text-xs text-gray-500 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap delay-75">
          Consulog © 2024
        </div>
      </div>
    </div>
  )
}