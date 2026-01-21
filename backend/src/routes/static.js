import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

// Servir imágenes estáticas
router.use('/images', express.static(path.join(__dirname, '..', '..', 'public', 'images')))

export default router
