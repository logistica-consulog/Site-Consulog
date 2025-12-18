import { useState, useCallback } from 'react'

export interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: string
  lastLoadTime: number | null
  cacheHit: boolean
}

export interface UseAsyncStateReturn<T> extends AsyncState<T> {
  execute: (asyncFn: () => Promise<T>) => Promise<void>
  setData: (data: T | null) => void
  clearError: () => void
  reset: () => void
}

export function useAsyncState<T>(initialData: T | null = null): UseAsyncStateReturn<T> {
  const [data, setData] = useState<T | null>(initialData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [lastLoadTime, setLastLoadTime] = useState<number | null>(null)
  const [cacheHit, setCacheHit] = useState(false)

  const execute = useCallback(async (asyncFn: () => Promise<T>) => {
    setLoading(true)
    setError('')
    setCacheHit(false)
    
    const startTime = Date.now()
    
    try {
      const result = await asyncFn()
      setData(result)
      
      const loadTime = Date.now() - startTime
      setLastLoadTime(loadTime)
      
      // Consider it a cache hit if response is very fast (< 100ms)
      setCacheHit(loadTime < 100)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      console.error('AsyncState error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const clearError = useCallback(() => {
    setError('')
  }, [])

  const reset = useCallback(() => {
    setData(initialData)
    setLoading(false)
    setError('')
    setLastLoadTime(null)
    setCacheHit(false)
  }, [initialData])

  return {
    data,
    loading,
    error,
    lastLoadTime,
    cacheHit,
    execute,
    setData,
    clearError,
    reset
  }
}