import { NextRequest, NextResponse } from 'next/server'
import {
  handleExternalApiResponse,
  extractAuthToken,
  createUnauthorizedResponse,
  createInternalServerErrorResponse,
} from '../../_utils/api-handler'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const authorization = request.headers.get('authorization')

    const token = extractAuthToken(authorization)
    if (!token) {
      return createUnauthorizedResponse()
    }

    // Get pedido or nota_fiscal parameter (at least one is required)
    const pedidoId = searchParams.get('pedido')
    const notaFiscal = searchParams.get('nota_fiscal')

    if (!pedidoId && !notaFiscal) {
      return NextResponse.json(
        { error: 'Pedido ou Nota Fiscal é obrigatório' },
        { status: 400 }
      )
    }

    // Build URL for /pedidos/lotes endpoint
    let url = `https://portal.logsmart.com.br/api/v1/pedidos/lotes?token=${token}`

    if (pedidoId) {
      url += `&pedido=${pedidoId}`
    }

    if (notaFiscal) {
      url += `&nota_fiscal=${notaFiscal}`
    }

    // Forward the request to the actual API with timeout
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(30000), // 30 second timeout
    })

    // Use centralized handler for consistent error handling
    return handleExternalApiResponse(response, 'Pedidos - Lotes')
  } catch (error) {
    console.error('Order Lotes proxy error:', error)
    return createInternalServerErrorResponse()
  }
}
