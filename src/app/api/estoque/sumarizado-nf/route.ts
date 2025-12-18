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

    // Build the query parameters for the external API
    const queryParams = new URLSearchParams({ token })
    
    // Add any additional query parameters from the request
    searchParams.forEach((value, key) => {
      queryParams.set(key, value)
    })

    const queryString = queryParams.toString()
    const url = `https://portal.logsmart.com.br/api/v1/estoque/sumarizado-nf?${queryString}`

    console.log('📡 Fetching stock summary from API:', url.substring(0, 100) + '...')

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

    // Check if response is JSON
    const contentType = response.headers.get('content-type')
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Stock Summary API error:', response.status, errorText.substring(0, 500))
      return NextResponse.json(
        { error: 'Failed to fetch stock summary data', status: response.status },
        { status: response.status }
      )
    }

    // Try to parse as JSON, if it fails, log the response
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json()
      console.log(`✅ Stock summary fetched successfully: ${data.data?.length || 0} items`)
      return NextResponse.json(data, { status: 200 })
    } else {
      const textData = await response.text()
      console.log('Non-JSON response received:', textData.substring(0, 500))
      
      // If it's HTML, it might be a login page redirect or authentication issue
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
    console.error('Stock Summary proxy error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}