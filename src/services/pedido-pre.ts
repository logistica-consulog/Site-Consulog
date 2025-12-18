import api from './api'
import { useAuthStore } from '@/store/auth'
import {
  CreatePedidoPreRequest,
  CreatePedidoPreResponse,
  ValidationError,
  FormValidationResult
} from '@/types/pedido-pre'

export const pedidoPreService = {
  async createPedidoPre(data: CreatePedidoPreRequest): Promise<CreatePedidoPreResponse> {
    try {
      // Get token from auth store
      const token = useAuthStore.getState().token

      if (!token) {
        throw new Error('Token de autenticação não encontrado')
      }

      // Add token to request body
      const requestData = {
        ...data,
        token
      }

      console.log('📡 Creating pedido-pre:', requestData)

      const response = await api.post<CreatePedidoPreResponse>(
        '/pedido-pre/create',
        requestData
      )

      console.log('✅ Pedido-pre response:', response.data)

      // Check if the API returned success: false with messages
      if (!response.data.success && response.data.messages) {
        throw new Error(response.data.messages.join('\n'))
      }

      return response.data

    } catch (error: any) {
      console.error('❌ Error creating pedido-pre:', error)

      // Handle different error types
      if (error.response?.data) {
        const data = error.response.data

        // Handle API response with messages array
        if (data.messages && Array.isArray(data.messages)) {
          throw new Error(data.messages.join('\n'))
        }

        // Handle single message or error field
        throw new Error(data.message || data.error || 'Erro ao criar pedido-pre')
      } else if (error.message) {
        throw new Error(error.message)
      } else {
        throw new Error('Erro interno do servidor')
      }
    }
  },

  // Validation helper based on API specification
  validatePedidoPreData(data: Partial<CreatePedidoPreRequest>): FormValidationResult {
    const errors: ValidationError[] = []
    
    // Validar pedidos (obrigatório)
    if (!data.pedidos || data.pedidos.length === 0) {
      errors.push({
        field: 'pedidos',
        message: 'Pelo menos um pedido é obrigatório'
      })
    }
    
    if (data.pedidos) {
      data.pedidos.forEach((pedido, pedidoIndex) => {
        // Cliente obrigatório
        if (!pedido.cliente) {
          errors.push({
            field: `pedidos.${pedidoIndex}.cliente`,
            message: `CNPJ/CPF do cliente é obrigatório para o pedido ${pedidoIndex + 1}`
          })
        }
        
        // Número do pedido obrigatório
        if (!pedido.pedido) {
          errors.push({
            field: `pedidos.${pedidoIndex}.pedido`,
            message: `Número do pedido é obrigatório para o pedido ${pedidoIndex + 1}`
          })
        }
        
        // Itens obrigatórios
        if (!pedido.itens || pedido.itens.length === 0) {
          errors.push({
            field: `pedidos.${pedidoIndex}.itens`,
            message: `Pelo menos um item é obrigatório para o pedido ${pedidoIndex + 1}`
          })
        }
        
        // Validar cada item
        if (pedido.itens) {
          pedido.itens.forEach((item, itemIndex) => {
            if (!item.codigo) {
              errors.push({
                field: `pedidos.${pedidoIndex}.itens.${itemIndex}.codigo`,
                message: `Código do produto é obrigatório para o item ${itemIndex + 1} do pedido ${pedidoIndex + 1}`
              })
            }
            if (!item.qtde || parseFloat(item.qtde) <= 0) {
              errors.push({
                field: `pedidos.${pedidoIndex}.itens.${itemIndex}.qtde`,
                message: `Quantidade deve ser maior que zero para o item ${itemIndex + 1} do pedido ${pedidoIndex + 1}`
              })
            }
          })
        }
      })
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
}