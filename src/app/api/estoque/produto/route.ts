import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization')

    if (!authorization) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      )
    }

    // Extract token from Authorization header (Bearer token)
    const token = authorization.replace('Bearer ', '')

    // Get request body
    const body = await request.json()
    const produto = body.produto || ''

    // Build payload for external API (GET with body)
    const payload = {
      token,
      produto
    }

    const url = `https://portal.logsmart.com.br/api/v1/estoque/produto`

    console.log('📡 Searching products:', { produto })

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

    console.log('📦 Product search response status:', response.status)

    if (response.status !== 200) {
      console.error('Product search API error:', response.status, JSON.stringify(response.data).substring(0, 500))
      return NextResponse.json(
        { error: 'Failed to search products', status: response.status },
        { status: response.status }
      )
    }

    // Check if response is valid
    if (response.data && typeof response.data === 'object') {
      console.log('✅ Product search results:', response.data.data?.length || 0, 'items')
      return NextResponse.json(response.data, { status: 200 })
    } else {
      console.log('Non-JSON response received:', String(response.data).substring(0, 500))
      return NextResponse.json(
        { error: 'Invalid response format' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Product search proxy error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
