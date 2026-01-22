import express from 'express'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import logger from '../utils/logger.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()
const CONTENT_FILE = path.join(__dirname, '..', '..', 'data', 'content.json')
const PRESENTATIONS_DIR = path.join(__dirname, '..', '..', 'data', 'presentations')

// Asegurar que el directorio de presentaciones existe
async function ensurePresentationsDir() {
  try {
    await fs.mkdir(PRESENTATIONS_DIR, { recursive: true })
  } catch (error) {
    logger.error('Error creando directorio de presentaciones:', error)
  }
}

// GET - Listar todas las presentaciones guardadas
router.get('/', async (req, res) => {
  try {
    await ensurePresentationsDir()
    
    const files = await fs.readdir(PRESENTATIONS_DIR)
    const presentations = []
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        try {
          const filePath = path.join(PRESENTATIONS_DIR, file)
          const content = await fs.readFile(filePath, 'utf-8')
          const data = JSON.parse(content)
          
          // Validar y parsear fecha de forma segura
          let parsedDate = null
          if (data.timestamp) {
            try {
              const date = new Date(data.timestamp)
              if (!isNaN(date.getTime())) {
                parsedDate = date
              }
            } catch (dateError) {
              logger.warn(`Fecha inválida en ${file}:`, data.timestamp)
            }
          }
          
          presentations.push({
            id: file.replace('.json', ''),
            name: data.name || file.replace('.json', ''),
            filename: file,
            timestamp: data.timestamp || null,
            date: parsedDate,
            widgetCount: data.content?.widgets?.length || 0
          })
        } catch (error) {
          logger.warn(`Error leyendo presentación ${file}:`, error.message)
        }
      }
    }
    
    // Ordenar por fecha (más reciente primero)
    presentations.sort((a, b) => {
      if (!a.date || !b.date) return 0
      return b.date.getTime() - a.date.getTime()
    })
    
    res.json({ presentations })
  } catch (error) {
    logger.error('Error listando presentaciones:', error)
    res.status(500).json({
      error: 'Error al listar presentaciones',
      details: error.message || 'Error desconocido'
    })
  }
})

// GET - Obtener una presentación específica
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id
    const filePath = path.join(PRESENTATIONS_DIR, `${id}.json`)
    
    try {
      const content = await fs.readFile(filePath, 'utf-8')
      const data = JSON.parse(content)
      res.json(data)
    } catch (error) {
      if (error.code === 'ENOENT') {
        res.status(404).json({
          error: 'Presentación no encontrada'
        })
      } else {
        throw error
      }
    }
  } catch (error) {
    logger.error('Error obteniendo presentación:', error)
    res.status(500).json({
      error: 'Error al obtener presentación',
      details: error.message || 'Error desconocido'
    })
  }
})

// POST - Guardar presentación con nombre
router.post('/save', async (req, res) => {
  try {
    await ensurePresentationsDir()
    
    const { name, content } = req.body
    
    if (!name || !name.trim()) {
      return res.status(400).json({
        error: 'El nombre de la presentación es requerido'
      })
    }
    
    if (!content || !content.widgets || !content.settings) {
      return res.status(400).json({
        error: 'El contenido de la presentación es inválido'
      })
    }
    
    // Crear ID único basado en el nombre (sanitizado)
    const id = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
      .replace(/[^a-z0-9]+/g, '-') // Reemplazar caracteres especiales con guiones
      .replace(/^-+|-+$/g, '') // Eliminar guiones al inicio y final
    
    const filePath = path.join(PRESENTATIONS_DIR, `${id}.json`)
    
    // Verificar si ya existe
    let exists = false
    try {
      await fs.access(filePath)
      exists = true
    } catch (error) {
      // No existe, continuar
    }
    
    const presentationData = {
      id,
      name: name.trim(),
      timestamp: new Date().toISOString(),
      version: '1.0',
      content
    }
    
    await fs.writeFile(filePath, JSON.stringify(presentationData, null, 2), 'utf-8')
    
    logger.info(`✅ Presentación guardada: ${name} (${id})`)
    
    res.json({
      success: true,
      message: exists ? 'Presentación actualizada exitosamente' : 'Presentación guardada exitosamente',
      id,
      name: presentationData.name,
      timestamp: presentationData.timestamp
    })
  } catch (error) {
    logger.error('Error guardando presentación:', error)
    res.status(500).json({
      error: 'Error al guardar presentación',
      details: error.message || 'Error desconocido'
    })
  }
})

// POST - Cargar presentación (aplicar al contenido actual)
router.post('/load/:id', async (req, res) => {
  try {
    const id = req.params.id
    const filePath = path.join(PRESENTATIONS_DIR, `${id}.json`)
    
    // Leer presentación
    let presentationData
    try {
      const content = await fs.readFile(filePath, 'utf-8')
      presentationData = JSON.parse(content)
    } catch (error) {
      if (error.code === 'ENOENT') {
        return res.status(404).json({
          error: 'Presentación no encontrada'
        })
      }
      throw error
    }
    
    // Crear backup del contenido actual antes de cargar
    const backupsDir = path.join(__dirname, '..', '..', 'data', 'backups')
    try {
      await fs.mkdir(backupsDir, { recursive: true })
      
      let currentContent = null
      try {
        const currentData = await fs.readFile(CONTENT_FILE, 'utf-8')
        currentContent = JSON.parse(currentData)
      } catch (error) {
        // No hay contenido previo
      }
      
      if (currentContent) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
        const backupFilename = `content-backup-before-load-${timestamp}.json`
        const backupPath = path.join(backupsDir, backupFilename)
        
        const backupData = {
          timestamp: new Date().toISOString(),
          version: '1.0',
          content: currentContent,
          loadedFrom: id
        }
        
        await fs.writeFile(backupPath, JSON.stringify(backupData, null, 2), 'utf-8')
        logger.info(`✅ Backup automático creado antes de cargar: ${backupFilename}`)
      }
    } catch (backupError) {
      logger.warn('⚠️  No se pudo crear backup automático antes de cargar:', backupError.message)
    }
    
    // Aplicar contenido de la presentación
    await fs.mkdir(path.dirname(CONTENT_FILE), { recursive: true })
    await fs.writeFile(CONTENT_FILE, JSON.stringify(presentationData.content, null, 2), 'utf-8')
    
    logger.info(`✅ Presentación cargada: ${presentationData.name} (${id})`)
    
    res.json({
      success: true,
      message: 'Presentación cargada exitosamente',
      presentation: {
        id: presentationData.id,
        name: presentationData.name,
        timestamp: presentationData.timestamp
      }
    })
  } catch (error) {
    logger.error('Error cargando presentación:', error)
    res.status(500).json({
      error: 'Error al cargar presentación',
      details: error.message || 'Error desconocido'
    })
  }
})

// DELETE - Eliminar presentación
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id
    const filePath = path.join(PRESENTATIONS_DIR, `${id}.json`)
    
    try {
      await fs.unlink(filePath)
      logger.info(`✅ Presentación eliminada: ${id}`)
      
      res.json({
        success: true,
        message: 'Presentación eliminada exitosamente'
      })
    } catch (error) {
      if (error.code === 'ENOENT') {
        res.status(404).json({
          error: 'Presentación no encontrada'
        })
      } else {
        throw error
      }
    }
  } catch (error) {
    logger.error('Error eliminando presentación:', error)
    res.status(500).json({
      error: 'Error al eliminar presentación',
      details: error.message || 'Error desconocido'
    })
  }
})

export default router
