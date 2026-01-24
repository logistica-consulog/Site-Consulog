import { NextResponse } from 'next/server'

/**
 * Handles external API responses and errors in a consistent way
 * Prevents automatic logout by returning appropriate status codes
 */
export async function handleExternalApiResponse(
  response: Response,
  endpointName: string
): Promise<NextResponse> {
  const contentType = response.headers.get('content-type')

  // If response is not OK, handle error
  if (!response.ok) {
    console.error(`[${endpointName}] External API error - Status: ${response.status}`)

    // For 500 errors, guide user to contact administrator
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

    return NextResponse.json(
      {
        error: 'Failed to fetch data from external API',
        status: response.status,
      },
      { status: response.status }
    )
  }

  // Try to parse as JSON
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json()
    return NextResponse.json(data, { status: 200 })
  }

  // If not JSON, it might be an HTML error page
  const textData = await response.text()

  // If it's HTML, it's likely an error from the external API server
  if (textData.includes('<!DOCTYPE') || textData.includes('<html>')) {
    // Extract error code if present (format: <h2>ERROR_CODE</h2>)
    const errorCodeMatch = textData.match(/<h2[^>]*>(\d+)<\/h2>/)
    const errorCode = errorCodeMatch ? errorCodeMatch[1] : 'unknown'

    console.error(`[${endpointName}] External API returned HTML error - Code: ${errorCode}`)

    // Return 502 (Bad Gateway) to indicate external API error
    // This prevents automatic logout since it's not an auth issue
    return NextResponse.json(
      {
        error: 'External API temporarily unavailable',
        errorCode,
        message:
          'O serviço está temporariamente indisponível. Por favor, tente novamente em alguns instantes.',
      },
      { status: 502 }
    )
  }

  // Unknown response format
  console.error(`[${endpointName}] Invalid response format - Content-Type: ${contentType}`)
  return NextResponse.json(
    {
      error: 'Invalid response format',
      contentType,
      message: 'A resposta do servidor está em formato inválido. Por favor, entre em contato com o administrador do sistema.',
    },
    { status: 500 }
  )
}

/**
 * Validates authorization header and returns token
 * Returns null if authorization is missing
 */
export function extractAuthToken(authHeader: string | null): string | null {
  if (!authHeader) {
    return null
  }

  return authHeader.replace('Bearer ', '')
}

/**
 * Creates an unauthorized response
 */
export function createUnauthorizedResponse(): NextResponse {
  return NextResponse.json(
    { error: 'Authorization header required' },
    { status: 401 }
  )
}

/**
 * Creates an internal server error response with user-friendly message
 */
export function createInternalServerErrorResponse(details?: string): NextResponse {
  return NextResponse.json(
    {
      error: 'Internal server error',
      message: 'Ocorreu um erro interno no servidor. Por favor, entre em contato com o administrador do sistema.',
      ...(details && { details }),
    },
    { status: 500 }
  )
}
