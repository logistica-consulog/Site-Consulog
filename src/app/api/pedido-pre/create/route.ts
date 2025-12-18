import { NextRequest, NextResponse } from 'next/server'

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
      if (authorization) {
        token = authorization.replace('Bearer ', '')
      }
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

    // Check if response is JSON
    const contentType = response.headers.get('content-type')
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Pedido-pre create API error:', response.status, errorText.substring(0, 500))
      return NextResponse.json(
        { error: 'Failed to create pedido-pre', status: response.status },
        { status: response.status }
      )
    }

    // Try to parse as JSON, if it fails, log the response
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json()
      return NextResponse.json(data, { status: 201 })
    } else {
      const textData = await response.text()
      console.log('Non-JSON response received:', textData.substring(0, 500))
      
      // If it's HTML, it might be a login page redirect
      if (textData.includes('<!DOCTYPE') || textData.includes('<html>')) {
        return NextResponse.json(
          { error: 'Authentication failed - received HTML response' },
          { status: 401 }
        )
      }
      
      return NextResponse.json(
        { error: 'Invalid response format', contentType },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Pedido-pre create proxy error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}