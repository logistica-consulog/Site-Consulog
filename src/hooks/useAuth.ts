'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'

export function useAuth(redirectTo?: string) {
  const { isAuthenticated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated && redirectTo) {
      router.push(redirectTo)
    }
  }, [isAuthenticated, redirectTo, router])

  return { isAuthenticated }
}

export function useRequireAuth() {
  return useAuth('/login')
}