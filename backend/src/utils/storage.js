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
// STORAGE_PATH debe estar configurado explícitamente en Koyeb
const STORAGE_BASE = process.env.STORAGE_PATH || '/app/storage'
// Detectar Koyeb por variables de entorno o por la presencia de STORAGE_PATH
const IS_KOYEB = !!process.env.STORAGE_PATH || process.env.KOYEB_APP || process.env.KOYEB_SERVICE || false

// Si no estamos en Koyeb o el volumen no está montado, usar rutas relativas
const getStorageBase = () => {
  // Si STORAGE_PATH está configurado, usarlo (Koyeb con volumen)
  if (process.env.STORAGE_PATH) {
    return process.env.STORAGE_PATH
  }
  // En desarrollo, usar directorio relativo
  return path.join(__dirname, '..', '..')
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

async function firstExistingDir(candidates) {
  const fs = await import('fs/promises')
  for (const dir of candidates) {
    try {
      const stat = await fs.stat(dir)
      if (stat.isDirectory()) return dir
    } catch {
      // siguiente candidato
    }
  }
  return null
}

async function copySeedFiles(seedDir, destDir) {
  const fs = await import('fs/promises')
  const logger = (await import('./logger.js')).default
  if (!seedDir) return 0

  await ensureStorageDir(destDir)
  const files = await fs.readdir(seedDir)
  let copied = 0

  for (const file of files) {
    if (file.startsWith('.') || file.startsWith('._')) continue
    const src = path.join(seedDir, file)
    const dest = path.join(destDir, file)
    const stat = await fs.stat(src)
    if (!stat.isFile()) continue
    await fs.copyFile(src, dest)
    copied += 1
    logger.info(`📦 Semilla copiada: ${file}`)
  }

  return copied
}

async function seedBundledContent() {
  const fs = await import('fs/promises')
  const logger = (await import('./logger.js')).default

  const presentationSeedDir = await firstExistingDir([
    path.join(process.cwd(), 'seed', 'presentations'),
    path.join(__dirname, '..', '..', 'seed', 'presentations'),
    path.join(__dirname, '..', '..', '..', 'data', 'presentations'),
  ])

  const filesSeedDir = await firstExistingDir([
    path.join(process.cwd(), 'seed', 'files'),
    path.join(__dirname, '..', '..', 'seed', 'files'),
    path.join(__dirname, '..', '..', '..', 'public', 'files'),
    path.join(__dirname, '..', '..', 'public', 'files'),
  ])

  const presentationsCopied = await copySeedFiles(presentationSeedDir, STORAGE_PATHS.presentations())
  const filesCopied = await copySeedFiles(filesSeedDir, STORAGE_PATHS.files())

  const agendaPath = path.join(STORAGE_PATHS.presentations(), 'agenda-20-agosto-2026.json')
  try {
    const raw = await fs.readFile(agendaPath, 'utf-8')
    const agenda = JSON.parse(raw)
    const activeInfo = {
      id: agenda.id || 'agenda-20-agosto-2026',
      name: agenda.name || 'Agenda 20 de agosto 2026 — Reunión de Accionistas',
      timestamp: new Date().toISOString(),
    }
    await fs.writeFile(
      path.join(STORAGE_PATHS.data(), 'active-presentation.json'),
      JSON.stringify(activeInfo, null, 2),
      'utf-8'
    )
    if (agenda.content) {
      await fs.writeFile(STORAGE_PATHS.content(), JSON.stringify(agenda.content, null, 2), 'utf-8')
    }
    logger.info(`✅ Presentación activa: ${activeInfo.name}`)
  } catch (error) {
    logger.warn('No se pudo activar la presentación sembrada:', error.message)
  }

  if (presentationsCopied || filesCopied) {
    logger.info(`📦 Semillas aplicadas: ${presentationsCopied} presentaciones, ${filesCopied} archivos`)
  }
}

// Función helper para inicializar todo el almacenamiento
export async function initializeStorage() {
  const logger = (await import('./logger.js')).default
  
  try {
    // Crear todos los directorios necesarios
    await ensureStorageDir(STORAGE_PATHS.data())
    await ensureStorageDir(STORAGE_PATHS.presentations())
    await ensureStorageDir(STORAGE_PATHS.backups())
    await ensureStorageDir(STORAGE_PATHS.images())
    await ensureStorageDir(STORAGE_PATHS.files())

    await seedBundledContent()
    
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
