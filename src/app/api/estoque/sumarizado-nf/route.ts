import { NextRequest } from 'next/server'
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

    // Build the query parameters for the external API
    const queryParams = new URLSearchParams({ token })
    
    // Add any additional query parameters from the request
    searchParams.forEach((value, key) => {
      queryParams.set(key, value)
    })

    const queryString = queryParams.toString()
    const url = `https://portal.logsmart.com.br/api/v1/estoque/sumarizado-nf?${queryString}`

    // Forward the request to the actual API with timeout and caching
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      },
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(30000), // 30 second timeout
    })

    // Use centralized handler for consistent error handling
    return handleExternalApiResponse(response, 'Estoque - Sumarizado NF')
  } catch (error) {
    console.error('Stock Summary proxy error:', error)
    return createInternalServerErrorResponse()
  }
}