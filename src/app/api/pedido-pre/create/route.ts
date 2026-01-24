import { NextRequest, NextResponse } from 'next/server'
import {
  handleExternalApiResponse,
  extractAuthToken,
  createInternalServerErrorResponse,
} from '../../_utils/api-handler'

export async function POST(request: NextRequest) {
  try {
    // Get request body
    const body = await request.json()

    // Validate required fields (basic validation)
    if (!body) {
      return NextResponse.json(
        { error: 'Request body is required' },
        { status: 400 }
      )
    }

    // Extract token from body (if not present, try header for backward compatibility)
    let token = body.token

    if (!token) {
      const authorization = request.headers.get('authorization')
      token = extractAuthToken(authorization)
    }

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required in request body or Authorization header' },
        { status: 401 }
      )
    }

    // Ensure token is in the body
    const requestBody = {
      ...body,
      token
    }

    const url = `https://portal.logsmart.com.br/api/v1/pedido-pre/create`

    // Forward the POST request to the actual API
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(30000), // 30 second timeout
    })

    // Use centralized handler for consistent error handling
    return handleExternalApiResponse(response, 'Pedido-Pre - Create')
  } catch (error) {
    console.error('Pedido-pre create proxy error:', error)
    return createInternalServerErrorResponse()
  }
}