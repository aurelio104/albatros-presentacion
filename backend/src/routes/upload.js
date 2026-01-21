import express from 'express'
import multer from 'multer'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import logger from '../utils/logger.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

// Configurar multer para guardar archivos
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', '..', 'public', 'images')
    await fs.mkdir(uploadDir, { recursive: true })
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now()
    const originalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')
    cb(null, `${timestamp}-${originalName}`)
  }
})

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (validTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Tipo de archivo no válido. Solo se permiten imágenes.'))
    }
  }
})

// POST - Subir imagen
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No se proporcionó ningún archivo'
      })
    }

    // Retornar URL relativa (el frontend deberá usar la URL del backend)
    const fileUrl = `/images/${req.file.filename}`
    
    // Detectar protocolo correcto (HTTPS en producción)
    let backendUrl = process.env.BACKEND_URL || process.env.KOYEB_URL
    if (!backendUrl && req) {
      const protocol = req.get('X-Forwarded-Proto') || 
                       (req.secure ? 'https' : 'http') ||
                       req.protocol
      const isProduction = process.env.NODE_ENV === 'production'
      const finalProtocol = (isProduction && protocol === 'http') ? 'https' : protocol
      const host = req.get('host') || req.get('X-Forwarded-Host')
      if (host) {
        backendUrl = `${finalProtocol}://${host}`
      }
    }
    if (!backendUrl) {
      backendUrl = 'http://localhost:3001' // Fallback desarrollo
    }
    
    const fullUrl = `${backendUrl}${fileUrl}`

    res.json({
      success: true,
      url: fullUrl, // URL completa para usar en el frontend
      localUrl: fileUrl, // URL relativa
      fileName: req.file.filename,
      size: req.file.size,
      type: req.file.mimetype
    })
  } catch (error) {
    logger.error('Error al subir archivo:', error)
    res.status(500).json({
      error: 'Error al subir el archivo',
      details: error.message || 'Error desconocido'
    })
  }
})

export default router
