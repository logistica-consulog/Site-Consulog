import axios, { AxiosError } from 'axios'

// Use local API routes that proxy to the external API
const API_BASE_URL = '/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-storage')
  if (token) {
    try {
      const auth = JSON.parse(token)
      if (auth.state?.token) {
        config.headers.Authorization = `Bearer ${auth.state.token}`
      }
      if (auth.state?.user?.id) {
        config.headers['X-Client-Id'] = String(auth.state.user.id)
      }
    } catch (error) {
      console.error('Error parsing auth token:', error)
    }
  }
  return config
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status

    // Only logout on 401 (Unauthorized) - real authentication issues
    // Do NOT logout on 502 (Bad Gateway) or 503 (Service Unavailable)
    // Those indicate external API problems, not auth issues
    if (status === 401) {
      // Additional check: only logout if it's truly an auth error
      // If the error message indicates external API issue, don't logout
      const errorData = error.response?.data as any
      const isExternalApiError =
        errorData?.error?.includes('External API') ||
        errorData?.errorCode

      if (!isExternalApiError) {
        // Real authentication failure - logout
        localStorage.removeItem('auth-storage')
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export default api
