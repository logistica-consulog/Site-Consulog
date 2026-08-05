import { NextRequest } from 'next/server'
import {
  handleExternalApiResponse,
  extractAuthToken,
  createUnauthorizedResponse,
  createInternalServerErrorResponse,
} from '../_utils/api-handler'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const authorization = request.headers.get('authorization')
    const clientId = request.headers.get('x-client-id')

    const token = extractAuthToken(authorization)
    if (!token || !clientId) {
      return createUnauthorizedResponse()
    }

    // Add token and client id as query parameters
    searchParams.set('token', token)
    searchParams.set('search', `cliente:${clientId}`)

    // Add default pagination if not provided
    if (!searchParams.has('page')) {
      searchParams.set('page', '1')
    }

    const queryString = searchParams.toString()
    const url = `https://portal.logsmart.com.br/api/v1/pedidos?${queryString}`

    // Forward the request to the actual API with timeout and caching
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60', // Cache for 1 minute
      },
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(30000), // 30 second timeout
    })

    // Use centralized handler for consistent error handling
    return handleExternalApiResponse(response, 'Pedidos')
  } catch (error) {
    console.error('Orders proxy error:', error)
    return createInternalServerErrorResponse()
  }
}
