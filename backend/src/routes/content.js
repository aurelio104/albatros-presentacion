import express from 'express'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()
const CONTENT_FILE = path.join(__dirname, '..', '..', 'data', 'content.json')

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
    console.error('Error al leer el contenido:', error)
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

    // Asegurar que el directorio existe
    await fs.mkdir(path.dirname(CONTENT_FILE), { recursive: true })

    // Guardar contenido
    await fs.writeFile(CONTENT_FILE, JSON.stringify(body, null, 2), 'utf-8')
    
    res.json({ 
      success: true, 
      message: 'Contenido guardado exitosamente',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error al guardar el contenido:', error)
    res.status(500).json({
      error: 'Error al guardar el contenido',
      details: error.message || 'Error desconocido'
    })
  }
})

export default router
