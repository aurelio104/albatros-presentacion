// Rate limiting middleware para proteger APIs
import logger from '../utils/logger.js'

// Simple in-memory rate limiter (para producción, usar Redis)
const requestCounts = new Map()
const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutos
const MAX_REQUESTS = 100 // Máximo de requests por IP en la ventana

function cleanup() {
  const now = Date.now()
  for (const [ip, data] of requestCounts.entries()) {
    if (now - data.resetTime > RATE_LIMIT_WINDOW) {
      requestCounts.delete(ip)
    }
  }
}

// Limpiar cada 5 minutos
setInterval(cleanup, 5 * 60 * 1000)

export function rateLimiter(req, res, next) {
  // Solo aplicar en producción
  if (process.env.NODE_ENV !== 'production') {
    return next()
  }

  const ip = req.ip || req.connection.remoteAddress || 'unknown'
  const now = Date.now()
  
  let requestData = requestCounts.get(ip)
  
  if (!requestData || now - requestData.resetTime > RATE_LIMIT_WINDOW) {
    requestData = {
      count: 1,
      resetTime: now,
    }
    requestCounts.set(ip, requestData)
    return next()
  }
  
  requestData.count++
  
  if (requestData.count > MAX_REQUESTS) {
    logger.warn(`Rate limit excedido para IP: ${ip}`)
    return res.status(429).json({
      error: 'Demasiadas solicitudes',
      message: 'Por favor, intenta de nuevo más tarde',
      retryAfter: Math.ceil((RATE_LIMIT_WINDOW - (now - requestData.resetTime)) / 1000),
    })
  }
  
  next()
}
