import express from 'express'
import multer from 'multer'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import logger from '../utils/logger.js'
import { STORAGE_PATHS, ensureStorageDir } from '../utils/storage.js'
import AdmZip from 'adm-zip'
import { PDFDocument } from 'pdf-lib'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

// Función helper para obtener la URL del backend
function getBackendUrl(req) {
  if (process.env.BACKEND_URL) return process.env.BACKEND_URL
  if (process.env.KOYEB_URL) return process.env.KOYEB_URL
  
  if (req) {
    const protocol = req.get('X-Forwarded-Proto') || (req.secure ? 'https' : 'http') || req.protocol
    const isProduction = process.env.NODE_ENV === 'production'
    const finalProtocol = (isProduction && protocol === 'http') ? 'https' : protocol
    const host = req.get('host') || req.get('X-Forwarded-Host')
    if (host) return `${finalProtocol}://${host}`
  }
  
  return 'http://localhost:3001'
}

// Generar vista previa de PDF (primera página como imagen)
async function generatePdfPreview(fileBuffer, filename, req) {
  try {
    const { createRequire } = await import('module')
    const require = createRequire(import.meta.url)
    const pdfParse = require('pdf-parse')
    
    const data = await pdfParse(fileBuffer)
    // Por ahora, retornar null (se puede implementar con pdf-lib o pdf2pic más adelante)
    // Para PDFs, podemos usar la primera página como preview
    return null
  } catch (error) {
    logger.warn('No se pudo generar preview de PDF:', error.message)
    return null
  }
}

// Generar vista previa de Word (primera imagen del documento)
async function generateWordPreview(fileBuffer, filename, req) {
  try {
    const zip = new AdmZip(fileBuffer)
    const zipEntries = zip.getEntries()
    
    // Buscar la primera imagen en word/media/
    for (const entry of zipEntries) {
      if (entry.entryName.startsWith('word/media/') && !entry.isDirectory) {
        const buffer = entry.getData()
        if (buffer && buffer.length > 0) {
          const ext = path.extname(entry.entryName).toLowerCase()
          const previewName = `preview-${Date.now()}-${path.basename(entry.entryName)}`
          const previewPath = path.join(STORAGE_PATHS.images(), previewName)
          await fs.writeFile(previewPath, buffer)
          const backendUrl = getBackendUrl(req)
          return `${backendUrl}/images/${previewName}`
        }
      }
    }
    return null
  } catch (error) {
    logger.warn('No se pudo generar preview de Word:', error.message)
    return null
  }
}

// Generar vista previa de Excel (primera hoja como imagen - requiere conversión)
async function generateExcelPreview(fileBuffer, filename, req) {
  // Por ahora, retornar null (se puede implementar con xlsx y conversión a imagen más adelante)
  return null
}

// Configurar multer para guardar archivos adjuntos
const storage = multer.memoryStorage() // Guardar en memoria para procesar

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  },
  fileFilter: (req, file, cb) => {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/pdf', // .pdf
      'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif' // imágenes
    ]
    
    const validExtensions = ['.docx', '.xlsx', '.pdf', '.jpg', '.jpeg', '.png', '.webp', '.gif']
    const ext = path.extname(file.originalname).toLowerCase()
    
    if (validTypes.includes(file.mimetype) || validExtensions.includes(ext)) {
      cb(null, true)
    } else {
      cb(new Error(`Tipo de archivo no válido. Use .docx, .xlsx, .pdf o imágenes.`))
    }
  }
})

// POST - Subir archivo adjunto
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No se proporcionó ningún archivo'
      })
    }

    const file = req.file
    const ext = path.extname(file.originalname).toLowerCase()
    const timestamp = Date.now()
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileId = `${timestamp}-${sanitizedName}`
    
    // Determinar tipo de archivo
    let fileType = 'image'
    if (ext === '.docx') fileType = 'word'
    else if (ext === '.xlsx') fileType = 'excel'
    else if (ext === '.pdf') fileType = 'pdf'
    
    // Guardar archivo en el directorio apropiado
    const filesDir = STORAGE_PATHS.files()
    await ensureStorageDir(filesDir)
    
    const filePath = path.join(filesDir, fileId)
    await fs.writeFile(filePath, file.buffer)
    
    const backendUrl = getBackendUrl(req)
    const fileUrl = `${backendUrl}/files/${fileId}`
    
    // Generar vista previa según el tipo
    let previewUrl = null
    if (fileType === 'image') {
      // Para imágenes, la URL es la misma que el archivo
      previewUrl = fileUrl
    } else if (fileType === 'pdf') {
      previewUrl = await generatePdfPreview(file.buffer, fileId, req)
    } else if (fileType === 'word') {
      previewUrl = await generateWordPreview(file.buffer, fileId, req)
    } else if (fileType === 'excel') {
      previewUrl = await generateExcelPreview(file.buffer, fileId, req)
    }
    
    const attachment = {
      id: fileId,
      url: fileUrl,
      previewUrl: previewUrl || fileUrl, // Si no hay preview, usar la URL del archivo
      filename: file.originalname,
      type: fileType,
      size: file.size,
      uploadedAt: new Date().toISOString()
    }
    
    logger.info(`✅ Archivo adjunto subido: ${file.originalname} (${fileType}, ${(file.size / 1024).toFixed(2)} KB)`)
    
    res.json({
      success: true,
      attachment
    })
  } catch (error) {
    logger.error('Error al subir archivo adjunto:', error)
    res.status(500).json({
      error: 'Error al subir el archivo adjunto',
      details: error.message || 'Error desconocido'
    })
  }
})

export default router
