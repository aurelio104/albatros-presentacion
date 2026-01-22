import express from 'express'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import logger from '../utils/logger.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()
const CONTENT_FILE = path.join(__dirname, '..', '..', 'data', 'content.json')
const BACKUPS_DIR = path.join(__dirname, '..', '..', 'data', 'backups')

// Asegurar que el directorio de backups existe
async function ensureBackupsDir() {
  try {
    await fs.mkdir(BACKUPS_DIR, { recursive: true })
  } catch (error) {
    logger.error('Error creando directorio de backups:', error)
  }
}

// GET - Listar todos los backups
router.get('/', async (req, res) => {
  try {
    await ensureBackupsDir()
    
    const files = await fs.readdir(BACKUPS_DIR)
    const backups = files
      .filter(f => f.endsWith('.json') && f.startsWith('content-backup-'))
      .map(f => {
        const match = f.match(/content-backup-(\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2})\.json/)
        return {
          filename: f,
          timestamp: match ? match[1] : null,
          date: match ? new Date(match[1].replace(/(\d{4})-(\d{2})-(\d{2})-(\d{2})-(\d{2})-(\d{2})/, '$1-$2-$3T$4:$5:$6')) : null
        }
      })
      .filter(b => b.timestamp)
      .sort((a, b) => {
        if (!a.date || !b.date) return 0
        return b.date.getTime() - a.date.getTime() // Más reciente primero
      })
    
    res.json({ backups })
  } catch (error) {
    logger.error('Error listando backups:', error)
    res.status(500).json({
      error: 'Error al listar backups',
      details: error.message || 'Error desconocido'
    })
  }
})

// GET - Obtener un backup específico
router.get('/:filename', async (req, res) => {
  try {
    const filename = req.params.filename
    
    // Validar que el archivo es un backup válido
    if (!filename.startsWith('content-backup-') || !filename.endsWith('.json')) {
      return res.status(400).json({
        error: 'Nombre de archivo inválido'
      })
    }
    
    const backupPath = path.join(BACKUPS_DIR, filename)
    
    try {
      const content = await fs.readFile(backupPath, 'utf-8')
      const data = JSON.parse(content)
      res.json(data)
    } catch (error) {
      if (error.code === 'ENOENT') {
        res.status(404).json({
          error: 'Backup no encontrado'
        })
      } else {
        throw error
      }
    }
  } catch (error) {
    logger.error('Error obteniendo backup:', error)
    res.status(500).json({
      error: 'Error al obtener backup',
      details: error.message || 'Error desconocido'
    })
  }
})

// POST - Crear backup del contenido actual
router.post('/create', async (req, res) => {
  try {
    await ensureBackupsDir()
    
    // Leer contenido actual
    let currentContent
    try {
      const contentData = await fs.readFile(CONTENT_FILE, 'utf-8')
      currentContent = JSON.parse(contentData)
    } catch (error) {
      if (error.code === 'ENOENT') {
        return res.status(404).json({
          error: 'No hay contenido para respaldar'
        })
      }
      throw error
    }
    
    // Crear backup con timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    const backupFilename = `content-backup-${timestamp}.json`
    const backupPath = path.join(BACKUPS_DIR, backupFilename)
    
    const backupData = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      content: currentContent
    }
    
    await fs.writeFile(backupPath, JSON.stringify(backupData, null, 2), 'utf-8')
    
    logger.info(`✅ Backup creado: ${backupFilename}`)
    
    res.json({
      success: true,
      message: 'Backup creado exitosamente',
      filename: backupFilename,
      timestamp: backupData.timestamp
    })
  } catch (error) {
    logger.error('Error creando backup:', error)
    res.status(500).json({
      error: 'Error al crear backup',
      details: error.message || 'Error desconocido'
    })
  }
})

// POST - Restaurar un backup
router.post('/restore/:filename', async (req, res) => {
  try {
    const filename = req.params.filename
    
    // Validar que el archivo es un backup válido
    if (!filename.startsWith('content-backup-') || !filename.endsWith('.json')) {
      return res.status(400).json({
        error: 'Nombre de archivo inválido'
      })
    }
    
    const backupPath = path.join(BACKUPS_DIR, filename)
    
    // Leer backup
    let backupData
    try {
      const content = await fs.readFile(backupPath, 'utf-8')
      backupData = JSON.parse(content)
    } catch (error) {
      if (error.code === 'ENOENT') {
        return res.status(404).json({
          error: 'Backup no encontrado'
        })
      }
      throw error
    }
    
    // Crear backup del estado actual antes de restaurar
    const currentTimestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    const currentBackupFilename = `content-backup-before-restore-${currentTimestamp}.json`
    const currentBackupPath = path.join(BACKUPS_DIR, currentBackupFilename)
    
    try {
      const currentContent = await fs.readFile(CONTENT_FILE, 'utf-8')
      const currentBackupData = {
        timestamp: new Date().toISOString(),
        version: '1.0',
        content: JSON.parse(currentContent),
        restoredFrom: filename
      }
      await fs.writeFile(currentBackupPath, JSON.stringify(currentBackupData, null, 2), 'utf-8')
      logger.info(`✅ Backup automático creado antes de restaurar: ${currentBackupFilename}`)
    } catch (error) {
      logger.warn('⚠️  No se pudo crear backup automático antes de restaurar:', error.message)
    }
    
    // Restaurar contenido
    await fs.mkdir(path.dirname(CONTENT_FILE), { recursive: true })
    await fs.writeFile(CONTENT_FILE, JSON.stringify(backupData.content, null, 2), 'utf-8')
    
    logger.info(`✅ Contenido restaurado desde: ${filename}`)
    
    res.json({
      success: true,
      message: 'Contenido restaurado exitosamente',
      restoredFrom: filename,
      backupCreated: currentBackupFilename
    })
  } catch (error) {
    logger.error('Error restaurando backup:', error)
    res.status(500).json({
      error: 'Error al restaurar backup',
      details: error.message || 'Error desconocido'
    })
  }
})

export default router
