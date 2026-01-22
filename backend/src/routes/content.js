import express from 'express'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import logger from '../utils/logger.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

import { STORAGE_PATHS, ensureStorageDir } from '../utils/storage.js'

const router = express.Router()
const CONTENT_FILE = STORAGE_PATHS.content()

// Función para obtener contenido por defecto
function getDefaultContent() {
  return {
    widgets: [],
    settings: {
      videoBackground: '/videos/video1.MP4',
      logo: {
        src: '/images/logotB.png',
        position: 'top',
        size: 320
      },
      overlay: {
        opacity: 0.4,
        color: 'rgba(0, 0, 0, 0.4)'
      }
    }
  }
}

// GET - Obtener contenido
router.get('/', async (req, res) => {
  try {
    // Verificar si hay una presentación activa
    const ACTIVE_PRESENTATION_FILE = path.join(STORAGE_PATHS.data(), 'active-presentation.json')
    const PRESENTATIONS_DIR = STORAGE_PATHS.presentations()
    
    let activePresentationId = null
    try {
      const activeData = await fs.readFile(ACTIVE_PRESENTATION_FILE, 'utf-8')
      const activeInfo = JSON.parse(activeData)
      activePresentationId = activeInfo.id
    } catch (error) {
      // No hay presentación activa, usar contenido general
    }
    
    // Si hay una presentación activa, cargarla
    if (activePresentationId) {
      try {
        const presentationPath = path.join(PRESENTATIONS_DIR, `${activePresentationId}.json`)
        const presentationContent = await fs.readFile(presentationPath, 'utf-8')
        const presentationData = JSON.parse(presentationContent)
        
        if (presentationData.content) {
          logger.info(`📋 Cargando presentación activa: ${presentationData.name} (${activePresentationId})`)
          return res.json(presentationData.content)
        }
      } catch (error) {
        logger.warn(`⚠️  Error cargando presentación activa ${activePresentationId}, usando contenido general:`, error.message)
        // Continuar con contenido general
      }
    }
    
    // Si no hay presentación activa o falló, usar contenido general
    let content = null

    try {
      const fileContent = await fs.readFile(CONTENT_FILE, 'utf-8')
      content = JSON.parse(fileContent)
    } catch (error) {
      // Si el archivo no existe, crear contenido por defecto
      if (error.code === 'ENOENT') {
        content = getDefaultContent()
        // Guardar contenido por defecto
        await fs.mkdir(path.dirname(CONTENT_FILE), { recursive: true })
        await fs.writeFile(CONTENT_FILE, JSON.stringify(content, null, 2), 'utf-8')
      } else {
        throw error
      }
    }

    res.json(content)
  } catch (error) {
    logger.error('Error al leer el contenido:', error)
    // En caso de error, retornar contenido por defecto
    res.json(getDefaultContent())
  }
})

// POST - Guardar contenido
router.post('/', async (req, res) => {
  try {
    const body = req.body
    
    // Validar estructura básica
    if (!body.widgets || !body.settings) {
      return res.status(400).json({
        error: 'Estructura de contenido inválida'
      })
    }

    // Asegurar que el directorio existe (usando utilidad de almacenamiento)
    await ensureStorageDir(STORAGE_PATHS.data())

    // Crear backup automático antes de guardar
    const backupsDir = STORAGE_PATHS.backups()
    try {
      await ensureStorageDir(backupsDir)
      
      // Leer contenido actual si existe
      let currentContent = null
      try {
        const currentData = await fs.readFile(CONTENT_FILE, 'utf-8')
        currentContent = JSON.parse(currentData)
      } catch (error) {
        // No hay contenido previo, es la primera vez
      }
      
      // Solo crear backup si hay contenido previo
      if (currentContent) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
        const backupFilename = `content-backup-${timestamp}.json`
        const backupPath = path.join(backupsDir, backupFilename)
        
        const backupData = {
          timestamp: new Date().toISOString(),
          version: '1.0',
          content: currentContent
        }
        
        await fs.writeFile(backupPath, JSON.stringify(backupData, null, 2), 'utf-8')
        logger.debug(`✅ Backup automático creado: ${backupFilename}`)
      }
    } catch (backupError) {
      // No fallar si el backup falla, solo loguear
      logger.warn('⚠️  No se pudo crear backup automático:', backupError.message)
    }

    // Guardar contenido
    await fs.writeFile(CONTENT_FILE, JSON.stringify(body, null, 2), 'utf-8')
    
    res.json({ 
      success: true, 
      message: 'Contenido guardado exitosamente',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    logger.error('Error al guardar el contenido:', error)
    res.status(500).json({
      error: 'Error al guardar el contenido',
      details: error.message || 'Error desconocido'
    })
  }
})

export default router
