#!/usr/bin/env node

/**
 * Script para verificar backups disponibles en el servidor
 */

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const BACKUPS_DIR = path.join(__dirname, '..', 'data', 'backups')

async function checkBackups() {
  console.log('🔍 Verificando backups disponibles...\n')

  try {
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

    if (backups.length === 0) {
      console.log('⚠️  No se encontraron backups en el servidor local')
      console.log('   Los backups solo están disponibles en el servidor de producción (Koyeb)')
      return
    }

    console.log(`✅ Se encontraron ${backups.length} backups:\n`)

    for (const backup of backups.slice(0, 10)) { // Mostrar solo los 10 más recientes
      const filePath = path.join(BACKUPS_DIR, backup.filename)
      try {
        const content = await fs.readFile(filePath, 'utf-8')
        const data = JSON.parse(content)
        const widgetCount = data.content?.widgets?.length || 0

        console.log(`📦 ${backup.filename}`)
        console.log(`   Fecha: ${backup.date?.toLocaleString('es-ES') || 'Desconocida'}`)
        console.log(`   Widgets: ${widgetCount}`)
        console.log('')
      } catch (error) {
        console.log(`⚠️  Error leyendo ${backup.filename}: ${error.message}`)
      }
    }

    if (backups.length > 10) {
      console.log(`... y ${backups.length - 10} backups más\n`)
    }

    console.log('💡 Para recuperar un backup:')
    console.log('   1. Ve al panel de administración')
    console.log('   2. Haz clic en "📚 Presentaciones"')
    console.log('   3. Los backups aparecerán como presentaciones si están en el servidor')

  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('⚠️  No existe el directorio de backups')
      console.log('   Esto es normal si nunca se ha guardado contenido')
    } else {
      console.error('❌ Error:', error.message)
    }
  }
}

checkBackups().catch(console.error)
