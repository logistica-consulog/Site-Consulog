import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AuthState, LoginRequest } from '@/types/auth'
import { authService } from '@/services/auth'

interface AuthStateWithTimestamp extends AuthState {
  loginTimestamp?: number
  tokenExpiry?: number
}

export const useAuthStore = create<AuthStateWithTimestamp>()(
  persist(
    (set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  loginTimestamp: undefined,
  tokenExpiry: undefined,

  login: async (credentials: LoginRequest) => {
    try {
      const response = await authService.login(credentials)
      
      const user = {
        id: response.data.data.usuario.id,
        email: response.data.data.usuario.email,
        name: response.data.data.usuario.name,
        avatar: response.data.data.usuario.avatar,
        empresa: {
          id: response.data.data.empresa.id,
          nome: response.data.data.empresa.xnome,
          fantasia: response.data.data.empresa.xfant
        }
      }
      
      const now = Date.now()
      const tokenExpiry = now + (7 * 24 * 60 * 60 * 1000) // 7 days from now
      
      set({
        user,
        token: response.data.data.token,
        isAuthenticated: true,
        loginTimestamp: now,
        tokenExpiry: tokenExpiry,
      })
    } catch (error) {
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        loginTimestamp: undefined,
        tokenExpiry: undefined,
      })
      throw error
    }
  },

  checkTokenValidity: () => {
    const state = get()
    if (!state.token || !state.tokenExpiry) {
      return false
    }
    
    const now = Date.now()
    if (now > state.tokenExpiry) {
      // Token expired, logout
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        loginTimestamp: undefined,
        tokenExpiry: undefined,
      })
      return false
    }
    
    return true
  },

  logout: () => {
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      loginTimestamp: undefined,
      tokenExpiry: undefined,
    })
  },
}),
{
  name: 'auth-storage',
}
))