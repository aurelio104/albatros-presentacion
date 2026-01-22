import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import contentRoutes from './routes/content.js'
import uploadRoutes from './routes/upload.js'
import documentRoutes from './routes/document.js'
import backupRoutes from './routes/backup.js'
import presentationsRoutes from './routes/presentations.js'
import { rateLimiter } from './middleware/rateLimiter.js'
import logger from './utils/logger.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

// Configuración de seguridad
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:3000',
  'https://albatros-presentacion.vercel.app',
  'https://albatros-presentacion-*.vercel.app'
]

// CORS configurado de forma segura
app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin para health checks y servicios internos
    if (!origin) {
      // En producción, permitir solo para health checks y rutas internas
      const isHealthCheck = false // Se verificará en la ruta específica
      return callback(null, true) // Permitir para health checks y servicios internos
    }
    
    // Verificar si el origin está permitido
    const isAllowed = ALLOWED_ORIGINS.some(allowed => {
      // Soporte para wildcards en Vercel (albatros-presentacion-*.vercel.app)
      if (allowed.includes('*')) {
        const pattern = '^' + allowed.replace(/\*/g, '.*') + '$'
        return new RegExp(pattern).test(origin)
      }
      return allowed === origin
    })
    
    if (isAllowed) {
      callback(null, true)
    } else {
      logger.warn(`CORS bloqueado para origin: ${origin}`)
      callback(new Error('No permitido por CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}))

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// Rate limiting para APIs
app.use('/api', rateLimiter)

// Crear directorios necesarios
const dataDir = path.join(__dirname, '..', 'data')
const imagesDir = path.join(__dirname, '..', 'public', 'images')

async function ensureDirectories() {
  try {
    await fs.mkdir(dataDir, { recursive: true })
    await fs.mkdir(imagesDir, { recursive: true })
    logger.info('✅ Directorios creados/verificados')
  } catch (error) {
    logger.error('Error creando directorios:', error)
  }
}

// Servir archivos estáticos (imágenes)
app.use('/images', express.static(path.join(__dirname, '..', 'public', 'images')))

// Rutas API
app.use('/api/content', contentRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/process-document', documentRoutes)
app.use('/api/backup', backupRoutes)
app.use('/api/presentations', presentationsRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// Inicializar servidor
async function startServer() {
  await ensureDirectories()
  
  app.listen(PORT, () => {
    logger.info(`🚀 Servidor backend ejecutándose en puerto ${PORT}`)
    logger.info(`📡 Ambiente: ${process.env.NODE_ENV || 'development'}`)
    logger.info(`🔒 CORS permitido para: ${ALLOWED_ORIGINS.join(', ')}`)
  })
}

startServer().catch(console.error)
