import { HTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'yellow' | 'orange' | 'purple' | 'indigo' | 'cyan' | 'green'
}

const Badge = ({ className, variant = 'default', children, ...props }: BadgeProps) => {
  const variants: Record<string, string> = {
    default:  'bg-gray-100   text-gray-800',
    success:  'bg-green-100  text-green-800',
    green:    'bg-green-100  text-green-800',
    warning:  'bg-yellow-100 text-yellow-800',
    yellow:   'bg-yellow-100 text-yellow-800',
    error:    'bg-red-100    text-red-800',
    info:     'bg-blue-100   text-blue-800',
    orange:   'bg-orange-100 text-orange-800',
    purple:   'bg-purple-100 text-purple-800',
    indigo:   'bg-indigo-100 text-indigo-800',
    cyan:     'bg-cyan-100   text-cyan-800',
  }

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variants[variant] ?? variants.default,
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export { Badge }
