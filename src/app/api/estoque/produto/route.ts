import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import { extractAuthToken, createUnauthorizedResponse } from '../../_utils/api-handler'

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization')

    const token = extractAuthToken(authorization)
    if (!token) {
      return createUnauthorizedResponse()
    }

    // Get request body
    const body = await request.json()
    const produto = body.produto || ''

    // Build payload for external API (GET with body)
    const payload = {
      token,
      produto
    }

    const url = `https://portal.logsmart.com.br/api/v1/estoque/produto`

    // Use axios for GET request with body (native fetch doesn't support this)
    const response = await axios({
      method: 'GET',
      url,
      headers: {
        'Content-Type': 'application/json',
      },
      data: payload, // axios uses 'data' for request body with GET
      timeout: 10000, // 10 second timeout
      validateStatus: () => true, // Don't throw on any status code
    })

    if (response.status !== 200) {
      console.error(`[Estoque - Produto] External API error - Status: ${response.status}`)

      // Handle 500 Internal Server Error
      if (response.status === 500) {
        return NextResponse.json(
          {
            error: 'Internal server error',
            status: response.status,
            message: 'Ocorreu um erro interno no servidor. Por favor, entre em contato com o administrador do sistema.',
          },
          { status: 500 }
        )
      }

      // Check if HTML error page was returned
      const dataStr = String(response.data)
      if (dataStr.includes('<!DOCTYPE') || dataStr.includes('<html>')) {
        const errorCodeMatch = dataStr.match(/<h2[^>]*>(\d+)<\/h2>/)
        const errorCode = errorCodeMatch ? errorCodeMatch[1] : 'unknown'

        console.error(`[Estoque - Produto] External API returned HTML error - Code: ${errorCode}`)

        // Return 502 to prevent logout
        return NextResponse.json(
          {
            error: 'External API temporarily unavailable',
            errorCode,
            message: 'O serviço está temporariamente indisponível. Por favor, tente novamente em alguns instantes.',
          },
          { status: 502 }
        )
      }

      return NextResponse.json(
        { error: 'Failed to search products', status: response.status },
        { status: response.status }
      )
    }

    // Check if response is valid
    if (response.data && typeof response.data === 'object') {
      return NextResponse.json(response.data, { status: 200 })
    } else {
      console.error(`[Estoque - Produto] Invalid response format`)
      return NextResponse.json(
        {
          error: 'Invalid response format',
          message: 'A resposta do servidor está em formato inválido. Por favor, entre em contato com o administrador do sistema.',
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Product search proxy error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Ocorreu um erro interno no servidor. Por favor, entre em contato com o administrador do sistema.',
      },
      { status: 500 }
    )
  }
}
