import { NextRequest } from 'next/server'
import {
  handleExternalApiResponse,
  extractAuthToken,
  createUnauthorizedResponse,
  createInternalServerErrorResponse,
} from '../../_utils/api-handler'

/**
 * GET /api/pedidos/encerrados
 * Proxy para o endpoint /pedidos/encerrados da API externa
 * Retorna pedidos com status "Finalizado"
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const authorization = request.headers.get('authorization')

    const token = extractAuthToken(authorization)
    if (!token) {
      return createUnauthorizedResponse()
    }

    // Construir URL com parâmetros de paginação
    let url = `https://portal.logsmart.com.br/api/v1/pedidos/encerrados?token=${token}`

    // Adicionar parâmetros de paginação se fornecidos
    const page = searchParams.get('page')
    const perPage = searchParams.get('per_page')

    if (page) {
      url += `&page=${page}`
    }

    if (perPage) {
      url += `&per_page=${perPage}`
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(30000), // 30 second timeout
    })

    // Use centralized handler for consistent error handling
    return handleExternalApiResponse(response, 'Pedidos - Encerrados')
  } catch (error) {
    console.error('❌ Erro ao buscar pedidos encerrados:', error)
    return createInternalServerErrorResponse()
  }
}
