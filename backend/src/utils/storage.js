/**
 * Utilidades para manejar almacenamiento persistente
 * En Koyeb, usamos un volumen montado en /app/storage
 * En desarrollo, usamos directorios locales
 */

import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Detectar si estamos en Koyeb (con volumen persistente)
const STORAGE_BASE = process.env.STORAGE_PATH || '/app/storage'
const IS_KOYEB = process.env.KOYEB_APP || process.env.KOYEB_SERVICE || false

// Si no estamos en Koyeb o el volumen no está montado, usar rutas relativas
const getStorageBase = () => {
  // En desarrollo o si STORAGE_PATH no está configurado, usar directorio relativo
  if (!IS_KOYEB || !process.env.STORAGE_PATH) {
    return path.join(__dirname, '..', '..')
  }
  return STORAGE_BASE
}

// Rutas de almacenamiento
export const STORAGE_PATHS = {
  // Base del almacenamiento
  base: getStorageBase(),
  
  // Datos
  data: () => path.join(getStorageBase(), 'data'),
  content: () => path.join(getStorageBase(), 'data', 'content.json'),
  presentations: () => path.join(getStorageBase(), 'data', 'presentations'),
  backups: () => path.join(getStorageBase(), 'data', 'backups'),
  
  // Archivos públicos
  public: () => path.join(getStorageBase(), 'public'),
  images: () => path.join(getStorageBase(), 'public', 'images'),
  files: () => path.join(getStorageBase(), 'public', 'files'), // Para PDFs y Excel
}

// Función helper para asegurar que un directorio existe
export async function ensureStorageDir(dirPath) {
  const fs = await import('fs/promises')
  try {
    await fs.mkdir(dirPath, { recursive: true })
  } catch (error) {
    // Si falla, intentar crear el directorio padre
    const parentDir = path.dirname(dirPath)
    if (parentDir !== dirPath) {
      await ensureStorageDir(parentDir)
      await fs.mkdir(dirPath, { recursive: true })
    } else {
      throw error
    }
  }
}

// Función helper para inicializar todo el almacenamiento
export async function initializeStorage() {
  const fs = await import('fs/promises')
  const logger = (await import('./logger.js')).default
  
  try {
    // Crear todos los directorios necesarios
    await ensureStorageDir(STORAGE_PATHS.data())
    await ensureStorageDir(STORAGE_PATHS.presentations())
    await ensureStorageDir(STORAGE_PATHS.backups())
    await ensureStorageDir(STORAGE_PATHS.images())
    await ensureStorageDir(STORAGE_PATHS.files())
    
    logger.info(`✅ Almacenamiento inicializado en: ${getStorageBase()}`)
    logger.info(`   Modo: ${IS_KOYEB ? 'Koyeb (Volumen persistente)' : 'Local/Desarrollo'}`)
    
    return true
  } catch (error) {
    logger.error('❌ Error inicializando almacenamiento:', error)
    return false
  }
}

// Verificar que el almacenamiento esté disponible
export async function verifyStorage() {
  const fs = await import('fs/promises')
  
  try {
    const base = getStorageBase()
    await fs.access(base)
    return true
  } catch (error) {
    return false
  }
}
