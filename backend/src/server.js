import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import contentRoutes from './routes/content.js'
import uploadRoutes from './routes/upload.js'
import documentRoutes from './routes/document.js'

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
    // Permitir requests sin origin (mobile apps, Postman, etc.) solo en desarrollo
    if (!origin && process.env.NODE_ENV === 'development') {
      return callback(null, true)
    }
    
    if (!origin) {
      return callback(new Error('Origin requerido'))
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
      console.warn(`CORS bloqueado para origin: ${origin}`)
      callback(new Error('No permitido por CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}))

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// Crear directorios necesarios
const dataDir = path.join(__dirname, '..', 'data')
const imagesDir = path.join(__dirname, '..', 'public', 'images')

async function ensureDirectories() {
  try {
    await fs.mkdir(dataDir, { recursive: true })
    await fs.mkdir(imagesDir, { recursive: true })
    console.log('✅ Directorios creados/verificados')
  } catch (error) {
    console.error('Error creando directorios:', error)
  }
}

// Servir archivos estáticos (imágenes)
app.use('/images', express.static(path.join(__dirname, '..', 'public', 'images')))

// Rutas API
app.use('/api/content', contentRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/process-document', documentRoutes)

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
    console.log(`🚀 Servidor backend ejecutándose en puerto ${PORT}`)
    console.log(`📡 Ambiente: ${process.env.NODE_ENV || 'development'}`)
    console.log(`🔒 CORS permitido para: ${ALLOWED_ORIGINS.join(', ')}`)
  })
}

startServer().catch(console.error)
