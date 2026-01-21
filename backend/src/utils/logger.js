// Sistema de logging optimizado para producción
const isDevelopment = process.env.NODE_ENV === 'development'
const LOG_LEVEL = process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'error')

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
}

const currentLevel = levels[LOG_LEVEL] || levels.error

const logger = {
  error: (...args) => {
    if (currentLevel >= levels.error) {
      logger.error('[ERROR]', ...args)
    }
  },
  warn: (...args) => {
    if (currentLevel >= levels.warn) {
      logger.warn('[WARN]', ...args)
    }
  },
  info: (...args) => {
    if (currentLevel >= levels.info) {
      logger.debug('[INFO]', ...args)
    }
  },
  debug: (...args) => {
    if (currentLevel >= levels.debug) {
      logger.debug('[DEBUG]', ...args)
    }
  },
}

export default logger
