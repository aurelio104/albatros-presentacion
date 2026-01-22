import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { STORAGE_PATHS } from '../utils/storage.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

// Servir imágenes estáticas desde almacenamiento persistente
router.use('/images', express.static(STORAGE_PATHS.images()))

// Servir archivos (PDFs, Excel) desde almacenamiento persistente
router.use('/files', express.static(STORAGE_PATHS.files()))

export default router
