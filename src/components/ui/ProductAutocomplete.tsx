'use client'

import { useState, useEffect, useRef } from 'react'
import { Product } from '@/types/product'
import { productService } from '@/services/product'
import { Search, Loader2 } from 'lucide-react'

interface ProductAutocompleteProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  required?: boolean
}

export function ProductAutocomplete({
  value,
  onChange,
  placeholder = 'Digite para buscar...',
  label,
  required
}: ProductAutocompleteProps) {
  const [searchTerm, setSearchTerm] = useState(value)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  // Sync with external value changes
  useEffect(() => {
    setSearchTerm(value)
  }, [value])

  // Search products with debounce
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    if (searchTerm.length < 2) {
      setProducts([])
      setShowDropdown(false)
      return
    }

    debounceTimer.current = setTimeout(async () => {
      setLoading(true)
      const results = await productService.searchProducts(searchTerm)
      setProducts(results)
      setShowDropdown(results.length > 0)
      setLoading(false)
    }, 300)

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [searchTerm])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (product: Product) => {
    const productCode = product.prod_cprod.trim()
    setSearchTerm(productCode)
    onChange(productCode)
    setShowDropdown(false)
  }

  return (
    <div className="space-y-2" ref={dropdownRef}>
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        <div className="relative">
          <input
            type="text"
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 pr-10 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              onChange(e.target.value)
            }}
            onFocus={() => {
              if (products.length > 0) {
                setShowDropdown(true)
              }
            }}
            required={required}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            {loading ? (
              <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
            ) : (
              <Search className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </div>

        {/* Dropdown */}
        {showDropdown && products.length > 0 && (
          <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
            {products.map((product, index) => (
              <div
                key={`${product.prod_id}-${index}`}
                className="px-4 py-2 cursor-pointer hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
                onClick={() => handleSelect(product)}
              >
                <div className="font-medium text-gray-900 text-sm">
                  {product.prod_cprod.trim()}
                </div>
                <div className="text-xs text-gray-600 mt-0.5">
                  {product.prod_xprod.trim()}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No results message */}
        {showDropdown && !loading && searchTerm.length >= 2 && products.length === 0 && (
          <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg p-4 text-center text-sm text-gray-500">
            Nenhum produto encontrado
          </div>
        )}
      </div>
    </div>
  )
}
