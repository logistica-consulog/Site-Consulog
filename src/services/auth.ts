import { LoginRequest, LoginResponse } from '@/types/auth'
import api from './api'

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth', {
      ...credentials,
      client_id: 'wms_app'
    })
    return response.data
  },

  async logout(): Promise<void> {
    // Implementation depends on API requirements
    // Could be a POST to /logout endpoint
  },

  async refreshToken(token: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/refresh', {
      token
    })
    return response.data
  }
}