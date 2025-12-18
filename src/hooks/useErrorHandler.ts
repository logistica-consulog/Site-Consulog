import { useState, useCallback } from 'react'

export interface ErrorInfo {
  message: string
  type: 'error' | 'warning' | 'info'
  timestamp: number
  context?: string
}

export interface UseErrorHandlerReturn {
  error: string
  errorInfo: ErrorInfo | null
  hasError: boolean
  handleError: (error: any, userMessage?: string, context?: string) => void
  handleWarning: (message: string, context?: string) => void
  handleInfo: (message: string, context?: string) => void
  clearError: () => void
  retryAction?: () => void
  setRetryAction: (action: (() => void) | undefined) => void
}

const ERROR_MESSAGES: Record<string, string> = {
  // Network errors
  'Failed to fetch': 'Erro de conexão. Verifique sua internet.',
  'Network Error': 'Erro de rede. Tente novamente.',
  'timeout': 'Tempo limite excedido. Tente novamente.',
  
  // API errors
  '401': 'Sessão expirada. Faça login novamente.',
  '403': 'Acesso negado. Verifique suas permissões.',
  '404': 'Recurso não encontrado.',
  '422': 'Dados inválidos. Verifique os campos.',
  '500': 'Erro interno do servidor. Tente mais tarde.',
  '503': 'Serviço temporariamente indisponível.',
  
  // Default messages
  'default': 'Ocorreu um erro inesperado. Tente novamente.'
}

export function useErrorHandler(): UseErrorHandlerReturn {
  const [error, setError] = useState('')
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | null>(null)
  const [retryAction, setRetryAction] = useState<(() => void) | undefined>(undefined)

  const getErrorMessage = useCallback((error: any): string => {
    if (typeof error === 'string') {
      return ERROR_MESSAGES[error] || error
    }

    if (error?.response?.status) {
      const statusMessage = ERROR_MESSAGES[error.response.status.toString()]
      if (statusMessage) return statusMessage
    }

    if (error?.message) {
      // Check if message contains known error patterns
      const message = error.message.toLowerCase()
      for (const [key, value] of Object.entries(ERROR_MESSAGES)) {
        if (message.includes(key.toLowerCase())) {
          return value
        }
      }
      return error.message
    }

    return ERROR_MESSAGES.default
  }, [])

  const createErrorInfo = useCallback((
    message: string, 
    type: ErrorInfo['type'],
    context?: string
  ): ErrorInfo => ({
    message,
    type,
    timestamp: Date.now(),
    context
  }), [])

  const handleError = useCallback((
    error: any, 
    userMessage?: string, 
    context?: string
  ) => {
    const finalMessage = userMessage || getErrorMessage(error)
    const info = createErrorInfo(finalMessage, 'error', context)
    
    setError(finalMessage)
    setErrorInfo(info)
    
    // Log detailed error information for debugging
    console.error('Error handled:', {
      originalError: error,
      userMessage: finalMessage,
      context,
      timestamp: info.timestamp
    })

    // Optional: Send to error tracking service
    // errorTrackingService.captureError(error, context)
  }, [getErrorMessage, createErrorInfo])

  const handleWarning = useCallback((message: string, context?: string) => {
    const info = createErrorInfo(message, 'warning', context)
    setError(message)
    setErrorInfo(info)
    
    console.warn('Warning:', { message, context, timestamp: info.timestamp })
  }, [createErrorInfo])

  const handleInfo = useCallback((message: string, context?: string) => {
    const info = createErrorInfo(message, 'info', context)
    setError(message)
    setErrorInfo(info)
    
    console.info('Info:', { message, context, timestamp: info.timestamp })
  }, [createErrorInfo])

  const clearError = useCallback(() => {
    setError('')
    setErrorInfo(null)
    setRetryAction(undefined)
  }, [])

  return {
    error,
    errorInfo,
    hasError: !!error,
    handleError,
    handleWarning,
    handleInfo,
    clearError,
    retryAction,
    setRetryAction
  }
}