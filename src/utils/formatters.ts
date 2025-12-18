export const formatters = {
  /**
   * Formats a date string to Brazilian format (DD/MM/YYYY)
   * Handles various input formats from API
   */
  date(dateString: string | null | undefined): string {
    if (!dateString || dateString === 'null' || dateString === 'undefined') {
      return 'Data não informada'
    }

    try {
      // Handle different date formats from API
      if (dateString.includes(' - ')) {
        // Format: "05/06/2025 - 14:44:50"
        const [datePart] = dateString.split(' - ')
        const [day, month, year] = datePart.split('/')
        return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`
      } else if (dateString.includes('/')) {
        // Format: "05/06/2025" - already in DD/MM/YYYY
        return dateString
      } else if (dateString.match(/^\d{4}-\d{2}-\d{2}/)) {
        // ISO format: "2025-09-23" or "2025-09-23 00:00"
        // Extract date part and convert to DD/MM/YYYY (avoid timezone issues)
        const datePart = dateString.substring(0, 10) // "2025-09-23"
        const [year, month, day] = datePart.split('-')
        return `${day}/${month}/${year}`
      } else {
        // Other formats - try with Date object
        const date = new Date(dateString)

        if (isNaN(date.getTime())) {
          return dateString // Return original if can't parse
        }

        return date.toLocaleDateString('pt-BR')
      }
    } catch (error) {
      console.warn('Date formatting error:', error, 'Input:', dateString)
      return dateString // Return original if formatting fails
    }
  },

  /**
   * Formats a number to Brazilian format with specified decimals
   */
  number(value: number | string | null | undefined, decimals: number = 2): string {
    const numValue = typeof value === 'string' ? parseFloat(value) : value
    
    if (numValue === null || numValue === undefined || isNaN(numValue)) {
      return '0' + (decimals > 0 ? ',' + '0'.repeat(decimals) : '')
    }
    
    return numValue.toLocaleString('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })
  },

  /**
   * Formats a number as Brazilian currency (R$)
   */
  currency(value: number | string | null | undefined): string {
    const numValue = typeof value === 'string' ? parseFloat(value) : value
    
    if (numValue === null || numValue === undefined || isNaN(numValue)) {
      return 'R$ 0,00'
    }
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue)
  },

  /**
   * Formats weight in kilograms with 3 decimals
   */
  weight(value: number | string | null | undefined): string {
    return formatters.number(value, 3) + ' kg'
  },

  /**
   * Formats percentage with 1 decimal
   */
  percentage(value: number | string | null | undefined): string {
    return formatters.number(value, 1) + '%'
  },

  /**
   * Formats a phone number to Brazilian format
   */
  phone(value: string | null | undefined): string {
    if (!value) return ''
    
    const cleaned = value.replace(/\D/g, '')
    
    if (cleaned.length === 11) {
      // Format: (11) 99999-9999
      return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    } else if (cleaned.length === 10) {
      // Format: (11) 9999-9999
      return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
    }
    
    return value // Return original if doesn't match expected patterns
  },

  /**
   * Formats CNPJ to Brazilian format
   */
  cnpj(value: string | null | undefined): string {
    if (!value) return ''
    
    const cleaned = value.replace(/\D/g, '')
    
    if (cleaned.length === 14) {
      // Format: 00.000.000/0000-00
      return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
    }
    
    return value // Return original if doesn't match expected pattern
  },

  /**
   * Formats CPF to Brazilian format
   */
  cpf(value: string | null | undefined): string {
    if (!value) return ''
    
    const cleaned = value.replace(/\D/g, '')
    
    if (cleaned.length === 11) {
      // Format: 000.000.000-00
      return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    }
    
    return value // Return original if doesn't match expected pattern
  },

  /**
   * Truncates text to specified length with ellipsis
   */
  truncate(text: string | null | undefined, length: number = 50): string {
    if (!text) return ''
    
    if (text.length <= length) return text
    
    return text.substring(0, length).trim() + '...'
  },

  /**
   * Formats file size in bytes to human readable format
   */
  fileSize(bytes: number | null | undefined): string {
    if (!bytes || bytes === 0) return '0 B'
    
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i]
  }
}