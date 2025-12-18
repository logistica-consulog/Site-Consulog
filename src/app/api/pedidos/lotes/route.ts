import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const authorization = request.headers.get('authorization')

    if (!authorization) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      )
    }

    // Extract token from Authorization header (Bearer token)
    const token = authorization.replace('Bearer ', '')

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

    // Check if response is JSON
    const contentType = response.headers.get('content-type')

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Order Lotes API error:', response.status, errorText.substring(0, 500))
      return NextResponse.json(
        { error: 'Failed to fetch order details', status: response.status },
        { status: response.status }
      )
    }

    // Try to parse as JSON
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json()
      return NextResponse.json(data, { status: 200 })
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
    console.error('Order Lotes proxy error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
