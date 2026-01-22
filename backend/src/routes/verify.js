import express from 'express'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import logger from '../utils/logger.js'
import { STORAGE_PATHS, verifyStorage, initializeStorage } from '../utils/storage.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

// GET - Verificar almacenamiento y presentaciones
router.get('/', async (req, res) => {
  try {
    const results = {
      storage: {
        available: false,
        base: STORAGE_PATHS.base,
        mode: process.env.STORAGE_PATH ? 'Koyeb (Volumen persistente)' : 'Local/Desarrollo',
        directories: {}
      },
      presentations: {
        count: 0,
        files: []
      },
      images: {
        count: 0,
        sample: []
      },
      backups: {
        count: 0,
        sample: []
      },
      content: {
        exists: false,
        size: 0
      }
    }

    // 1. Verificar disponibilidad del almacenamiento
    results.storage.available = await verifyStorage()
    if (!results.storage.available) {
      return res.status(500).json({
        error: 'El almacenamiento no está disponible',
        results
      })
    }

    // 2. Inicializar almacenamiento
    await initializeStorage()

    // 3. Verificar directorios
    const dirs = {
      data: STORAGE_PATHS.data(),
      presentations: STORAGE_PATHS.presentations(),
      backups: STORAGE_PATHS.backups(),
      images: STORAGE_PATHS.images(),
      files: STORAGE_PATHS.files()
    }

    for (const [name, dirPath] of Object.entries(dirs)) {
      try {
        await fs.access(dirPath)
        const stats = await fs.stat(dirPath)
        results.storage.directories[name] = {
          exists: true,
          path: dirPath,
          isDirectory: stats.isDirectory()
        }
      } catch (error) {
        results.storage.directories[name] = {
          exists: false,
          path: dirPath,
          error: error.message
        }
      }
    }

    // 4. Verificar presentaciones
    try {
      const presentationsDir = STORAGE_PATHS.presentations()
      const files = await fs.readdir(presentationsDir)
      const presentationFiles = files.filter(f => f.endsWith('.json'))
      results.presentations.count = presentationFiles.length

      for (const file of presentationFiles) {
        try {
          const filePath = path.join(presentationsDir, file)
          const stats = await fs.stat(filePath)
          const content = await fs.readFile(filePath, 'utf-8')
          const data = JSON.parse(content)

          results.presentations.files.push({
            filename: file,
            size: stats.size,
            sizeKB: (stats.size / 1024).toFixed(2),
            name: data.name || 'N/A',
            id: data.id || 'N/A',
            timestamp: data.timestamp || null,
            widgetCount: data.content?.widgets?.length || 0,
            hasSettings: !!data.content?.settings,
            version: data.version || 'N/A'
          })
        } catch (error) {
          results.presentations.files.push({
            filename: file,
            error: error.message
          })
        }
      }
    } catch (error) {
      logger.error('Error verificando presentaciones:', error)
    }

    // 5. Verificar imágenes
    try {
      const imagesDir = STORAGE_PATHS.images()
      const imageFiles = await fs.readdir(imagesDir)
      results.images.count = imageFiles.length
      results.images.sample = imageFiles.slice(0, 10).map(img => {
        return {
          filename: img,
          path: path.join(imagesDir, img)
        }
      })
    } catch (error) {
      logger.error('Error verificando imágenes:', error)
    }

    // 6. Verificar backups
    try {
      const backupsDir = STORAGE_PATHS.backups()
      const backupFiles = await fs.readdir(backupsDir)
      results.backups.count = backupFiles.length
      results.backups.sample = backupFiles.slice(0, 5).map(backup => {
        return {
          filename: backup
        }
      })
    } catch (error) {
      logger.error('Error verificando backups:', error)
    }

    // 7. Verificar contenido actual
    try {
      const contentFile = STORAGE_PATHS.content()
      const stats = await fs.stat(contentFile)
      results.content.exists = true
      results.content.size = stats.size
    } catch (error) {
      results.content.exists = false
    }

    res.json({
      success: true,
      message: 'Verificación completada',
      results,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    logger.error('Error en verificación:', error)
    res.status(500).json({
      error: 'Error durante la verificación',
      details: error.message || 'Error desconocido'
    })
  }
})

// GET - Verificar presentación específica
router.get('/presentation/:id', async (req, res) => {
  try {
    const { id } = req.params
    const presentationsDir = STORAGE_PATHS.presentations()
    const filePath = path.join(presentationsDir, `${id}.json`)

    try {
      const stats = await fs.stat(filePath)
      const content = await fs.readFile(filePath, 'utf-8')
      const data = JSON.parse(content)

      res.json({
        success: true,
        presentation: {
          id: data.id,
          name: data.name,
          timestamp: data.timestamp,
          version: data.version,
          widgetCount: data.content?.widgets?.length || 0,
          hasSettings: !!data.content?.settings,
          size: stats.size,
          sizeKB: (stats.size / 1024).toFixed(2),
          filePath: filePath
        }
      })
    } catch (error) {
      if (error.code === 'ENOENT') {
        res.status(404).json({
          error: 'Presentación no encontrada',
          id
        })
      } else {
        throw error
      }
    }
  } catch (error) {
    logger.error('Error verificando presentación:', error)
    res.status(500).json({
      error: 'Error al verificar presentación',
      details: error.message || 'Error desconocido'
    })
  }
})

export default router
