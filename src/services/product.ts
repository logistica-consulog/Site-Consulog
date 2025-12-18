import api from './api'
import { Product, ProductSearchResponse } from '@/types/product'

export const productService = {
  async searchProducts(query: string): Promise<Product[]> {
    try {
      if (!query || query.trim().length < 2) {
        return []
      }

      console.log('🔍 Searching products:', query)

      const response = await api.post<ProductSearchResponse>(
        `/estoque/produto`,
        { produto: query }
      )

      console.log('✅ Product search results:', response.data.data?.length || 0, 'items')

      return response.data.data || []
    } catch (error) {
      console.error('❌ Error searching products:', error)
      return []
    }
  }
}
