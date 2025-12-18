/**
 * Sistema de Logging para Produção
 *
 * Em produção, apenas errors são logados (configurável via LOG_LEVEL)
 * Em desenvolvimento, todos os logs são permitidos
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class Logger {
  private level: LogLevel;
  private isProduction: boolean;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.level = (process.env.LOG_LEVEL as LogLevel) || (this.isProduction ? 'error' : 'debug');
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.level];
  }

  private formatMessage(level: LogLevel, message: string, ...args: any[]): void {
    if (!this.shouldLog(level)) return;

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    switch (level) {
      case 'debug':
        console.debug(prefix, message, ...args);
        break;
      case 'info':
        console.info(prefix, message, ...args);
        break;
      case 'warn':
        console.warn(prefix, message, ...args);
        break;
      case 'error':
        console.error(prefix, message, ...args);
        break;
    }
  }

  debug(message: string, ...args: any[]): void {
    this.formatMessage('debug', message, ...args);
  }

  info(message: string, ...args: any[]): void {
    this.formatMessage('info', message, ...args);
  }

  warn(message: string, ...args: any[]): void {
    this.formatMessage('warn', message, ...args);
  }

  error(message: string, ...args: any[]): void {
    this.formatMessage('error', message, ...args);
  }

  // Helper para logar erros de API
  apiError(endpoint: string, error: any): void {
    this.error(`API Error [${endpoint}]:`, error?.message || error);
  }

  // Helper para logar sucesso de API (apenas em dev)
  apiSuccess(endpoint: string, data?: any): void {
    if (!this.isProduction) {
      this.debug(`API Success [${endpoint}]:`, data);
    }
  }
}

// Exportar instância singleton
export const logger = new Logger();

// Para compatibilidade com código antigo, exportar também como default
export default logger;
