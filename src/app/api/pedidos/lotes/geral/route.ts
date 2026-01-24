import { NextRequest } from 'next/server'
import {
  handleExternalApiResponse,
  extractAuthToken,
  createUnauthorizedResponse,
  createInternalServerErrorResponse,
} from '../../../_utils/api-handler'

/**
 * GET /api/pedidos/lotes/geral
 * Proxy para o endpoint /pedidos/lotes/geral da API externa
 * Retorna todos os pedidos com detalhes de lotes em formato paginado
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
    let url = `https://portal.logsmart.com.br/api/v1/pedidos/lotes/geral?token=${token}`

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
    return handleExternalApiResponse(response, 'Pedidos - Lotes Geral')
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('❌ Erro interno ao buscar lotes/geral:', error.message)
      return createInternalServerErrorResponse(error.message)
    }

    console.error('❌ Erro desconhecido ao buscar lotes/geral')
    return createInternalServerErrorResponse()
  }
}
