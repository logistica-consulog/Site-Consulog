import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/pedidos/lotes/geral
 * Proxy para o endpoint /pedidos/lotes/geral da API externa
 * Retorna todos os pedidos com detalhes de lotes em formato paginado
 */
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

    const token = authorization.replace('Bearer ', '')

    // Construir URL com parâmetros de paginação
    let url = `https://portal.logsmart.com.br/api/v1/pedidos/lotes/geral?token=${token}`

    // Adicionar parâmetros de paginação se fornecidos
    const page = searchParams.get('page')
    const perPage = searchParams.get('per_page')

    if (page) {
      url += `&page=${page}`
    }

    if (perPage) {
      url += `&per_page=${perPage}`
    }

    console.log('🔄 Buscando pedidos de lotes/geral:', url.replace(token, 'TOKEN_HIDDEN'))

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(30000), // 30 second timeout
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Erro ao buscar lotes/geral:', response.status, errorText)
      return NextResponse.json(
        {
          error: 'Failed to fetch orders from lotes/geral',
          status: response.status,
          details: errorText
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log(`✅ Lotes/geral retornou ${data.data?.dados?.length || 0} pedidos`)

    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
      },
    })
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('❌ Erro interno ao buscar lotes/geral:', error.message)
      return NextResponse.json(
        { error: 'Internal server error', details: error.message },
        { status: 500 }
      )
    }

    console.error('❌ Erro desconhecido ao buscar lotes/geral')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
