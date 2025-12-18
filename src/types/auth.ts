export interface LoginRequest {
  email: string
  senha: string
  client_id: string
}

export interface LoginResponse {
  success: boolean
  data: {
    data: {
      token: string
      validade: string
      usuario: {
        id: number
        name: string
        email: string
        created_at: string
        updated_at: string
        tipo: string
        ativo: boolean
        empresa: number
        avatar: string
      }
      empresa: {
        id: number
        xnome: string
        xfant: string
        cnpj_cpf: string
      }
    }
  }
  message: string
}

export interface User {
  id: number
  email: string
  name: string
  avatar: string
  empresa: {
    id: number
    nome: string
    fantasia: string
  }
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => void
  checkTokenValidity: () => boolean
}