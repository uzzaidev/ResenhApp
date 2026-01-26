import pino from "pino";

/**
 * Logger Estruturado
 * 
 * Usa Pino para logs estruturados em produção.
 * Em desenvolvimento, usa console com formatação simples.
 * 
 * Sprint 7: Melhorias de Observabilidade
 */

const isDevelopment = process.env.NODE_ENV === "development";

// Logger para desenvolvimento (formatação legível)
const devLogger = {
  info: (obj: any, msg?: string) => {
    if (typeof obj === 'string') {
      console.log('[INFO]', obj);
    } else {
      console.log('[INFO]', msg || '', obj);
    }
  },
  error: (obj: any, msg?: string) => {
    if (obj instanceof Error) {
      console.error('[ERROR]', msg || obj.message, obj);
    } else if (typeof obj === 'string') {
      console.error('[ERROR]', obj);
    } else {
      console.error('[ERROR]', msg || '', obj);
    }
  },
  warn: (obj: any, msg?: string) => {
    if (typeof obj === 'string') {
      console.warn('[WARN]', obj);
    } else {
      console.warn('[WARN]', msg || '', obj);
    }
  },
  debug: (obj: any, msg?: string) => {
    if (typeof obj === 'string') {
      console.debug('[DEBUG]', obj);
    } else {
      console.debug('[DEBUG]', msg || '', obj);
    }
  },
};

// Logger para produção (Pino estruturado)
const prodLogger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  // Em produção, pode configurar transport para Datadog, Better Stack, etc.
  // transport: {
  //   target: 'pino-datadog',
  //   options: {
  //     apiKey: process.env.DATADOG_API_KEY,
  //   },
  // },
});

const logger = isDevelopment ? devLogger : prodLogger;

export default logger;
