interface CacheEntry<T> {
  data: T
  timestamp: number
  expiry: number
}

export class CacheManager {
  private cache = new Map<string, CacheEntry<any>>()

  set<T>(key: string, data: T, ttl: number = 300000): void {
    const now = Date.now()
    this.cache.set(key, {
      data,
      timestamp: now,
      expiry: now + ttl
    })
    
    // Log cache set for debugging
    console.log(`💾 Cache set: ${key} (TTL: ${ttl}ms)`)
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    const now = Date.now()
    if (now > entry.expiry) {
      this.cache.delete(key)
      console.log(`⏰ Cache expired: ${key}`)
      return null
    }

    console.log(`🚀 Cache hit: ${key}`)
    return entry.data
  }

  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false
    
    const now = Date.now()
    if (now > entry.expiry) {
      this.cache.delete(key)
      return false
    }
    
    return true
  }

  delete(key: string): void {
    this.cache.delete(key)
    console.log(`🗑️ Cache deleted: ${key}`)
  }

  clear(): void {
    this.cache.clear()
    console.log('🧹 Cache cleared')
  }

  clearExpired(): void {
    const now = Date.now()
    let expiredCount = 0
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key)
        expiredCount++
      }
    }
    
    if (expiredCount > 0) {
      console.log(`🧹 Cleared ${expiredCount} expired cache entries`)
    }
  }

  getStats(): { size: number; keys: string[] } {
    this.clearExpired() // Clean before reporting
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }

  // Helper method to create cache keys consistently
  createKey(prefix: string, params?: Record<string, any>): string {
    if (!params || Object.keys(params).length === 0) {
      return prefix
    }
    
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((sorted, key) => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          sorted[key] = params[key]
        }
        return sorted
      }, {} as Record<string, any>)
    
    return `${prefix}_${JSON.stringify(sortedParams)}`
  }
}

// Global cache manager instance
export const cacheManager = new CacheManager()

// Auto-cleanup every 5 minutes
setInterval(() => {
  cacheManager.clearExpired()
}, 5 * 60 * 1000)