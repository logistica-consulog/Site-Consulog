import { useState, useEffect, useRef } from 'react'

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiry: number
}

interface CacheOptions {
  ttl?: number // Time to live in milliseconds (default: 2 minutes)
  key: string
}

export function useCache<T>(options: CacheOptions) {
  const { ttl = 120000, key } = options // Default 2 minutes
  const cacheRef = useRef<Map<string, CacheEntry<T>>>(new Map())
  
  const get = (cacheKey?: string): T | null => {
    const fullKey = cacheKey ? `${key}_${cacheKey}` : key
    const entry = cacheRef.current.get(fullKey)
    
    if (!entry) return null
    
    const now = Date.now()
    if (now > entry.expiry) {
      cacheRef.current.delete(fullKey)
      return null
    }
    
    return entry.data
  }
  
  const set = (data: T, cacheKey?: string): void => {
    const fullKey = cacheKey ? `${key}_${cacheKey}` : key
    const now = Date.now()
    
    cacheRef.current.set(fullKey, {
      data,
      timestamp: now,
      expiry: now + ttl
    })
  }
  
  const clear = (cacheKey?: string): void => {
    if (cacheKey) {
      const fullKey = `${key}_${cacheKey}`
      cacheRef.current.delete(fullKey)
    } else {
      // Clear all entries that start with the key
      const keysToDelete = Array.from(cacheRef.current.keys()).filter(k => k.startsWith(key))
      keysToDelete.forEach(k => cacheRef.current.delete(k))
    }
  }
  
  const clearExpired = (): void => {
    const now = Date.now()
    const keysToDelete: string[] = []
    
    cacheRef.current.forEach((entry, key) => {
      if (now > entry.expiry) {
        keysToDelete.push(key)
      }
    })
    
    keysToDelete.forEach(key => cacheRef.current.delete(key))
  }
  
  // Clean up expired entries periodically
  useEffect(() => {
    const interval = setInterval(clearExpired, 60000) // Every minute
    return () => clearInterval(interval)
  }, [])
  
  return { get, set, clear, clearExpired }
}