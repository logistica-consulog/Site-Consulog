'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/auth'

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false)
  const checkTokenValidity = useAuthStore((state) => state.checkTokenValidity)

  useEffect(() => {
    // Check token validity on app initialization
    checkTokenValidity()
    setIsInitialized(true)
  }, [checkTokenValidity])

  // Don't render children until auth is initialized
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Inicializando...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}