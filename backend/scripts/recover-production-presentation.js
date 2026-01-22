#!/usr/bin/env node

/**
 * Script para recuperar la presentación actual desde producción
 * y guardarla como una presentación con nombre
 */

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PRODUCTION_URL = 'https://albatros-presentacion.vercel.app'
const BACKEND_URL = process.env.BACKEND_URL || 'https://albatros-backend-aurelio104-5f63c813.koyeb.app'
const PRESENTATION_NAME = process.argv[2] || 'Presentación Recuperada'

async function recoverPresentation() {
  console.log('🔍 Recuperando presentación desde producción...\n')
  console.log(`URL Frontend: ${PRODUCTION_URL}`)
  console.log(`URL Backend: ${BACKEND_URL}\n`)

  try {
    // Intentar obtener desde el backend primero
    console.log('📡 Intentando obtener contenido desde el backend...')
    let content = null
    
    try {
      const backendResponse = await fetch(`${BACKEND_URL}/api/content`, {
        headers: {
          'Accept': 'application/json',
        },
      })

      if (backendResponse.ok) {
        content = await backendResponse.json()
        console.log('✅ Contenido obtenido desde el backend\n')
      } else {
        console.log(`⚠️  Backend respondió con status ${backendResponse.status}`)
        const errorText = await backendResponse.text()
        console.log(`   Error: ${errorText.substring(0, 200)}\n`)
      }
    } catch (backendError) {
      console.log(`⚠️  Error conectando al backend: ${backendError.message}\n`)
    }

    // Si no se obtuvo del backend, intentar desde el frontend
    if (!content) {
      console.log('📡 Intentando obtener contenido desde el frontend...')
      try {
        // El frontend no expone directamente la API, pero podemos intentar
        // obtener el contenido desde la página
        const frontendResponse = await fetch(`${PRODUCTION_URL}/api/content`, {
          headers: {
            'Accept': 'application/json',
          },
        })

        if (frontendResponse.ok) {
          content = await frontendResponse.json()
          console.log('✅ Contenido obtenido desde el frontend\n')
        } else {
          console.log(`⚠️  Frontend respondió con status ${frontendResponse.status}\n`)
        }
      } catch (frontendError) {
        console.log(`⚠️  Error conectando al frontend: ${frontendError.message}\n`)
      }
    }

    if (!content) {
      console.error('❌ No se pudo obtener el contenido desde ninguna fuente')
      console.error('\nOpciones:')
      console.error('1. Verifica que las URLs sean correctas')
      console.error('2. Verifica que el backend esté accesible')
      console.error('3. Usa el panel de administración para guardar manualmente')
      process.exit(1)
    }

    // Validar estructura
    if (!content.widgets || !content.settings) {
      console.error('❌ El contenido obtenido no tiene la estructura correcta')
      console.error('Estructura recibida:', Object.keys(content))
      process.exit(1)
    }

    console.log(`📊 Contenido recuperado:`)
    console.log(`   - Widgets: ${content.widgets.length}`)
    console.log(`   - Settings: ${Object.keys(content.settings).length} propiedades\n`)

    // Guardar como presentación
    const presentationsDir = path.join(__dirname, '..', 'data', 'presentations')
    await fs.mkdir(presentationsDir, { recursive: true })

    // Crear ID único basado en el nombre
    const id = PRESENTATION_NAME
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
      .replace(/[^a-z0-9]+/g, '-') // Reemplazar caracteres especiales con guiones
      .replace(/^-+|-+$/g, '') // Eliminar guiones al inicio y final

    const filePath = path.join(presentationsDir, `${id}.json`)

    const presentationData = {
      id,
      name: PRESENTATION_NAME,
      timestamp: new Date().toISOString(),
      version: '1.0',
      content,
      recoveredFrom: PRODUCTION_URL,
      recoveredAt: new Date().toISOString()
    }

    await fs.writeFile(filePath, JSON.stringify(presentationData, null, 2), 'utf-8')

    console.log(`✅ Presentación guardada exitosamente:`)
    console.log(`   - Nombre: ${PRESENTATION_NAME}`)
    console.log(`   - ID: ${id}`)
    console.log(`   - Archivo: ${filePath}`)
    console.log(`   - Widgets: ${content.widgets.length}`)
    console.log(`\n📝 Para cargar esta presentación:`)
    console.log(`   1. Ve al panel de administración`)
    console.log(`   2. Haz clic en la pestaña "📚 Presentaciones"`)
    console.log(`   3. Busca "${PRESENTATION_NAME}" y haz clic en "📂 Cargar"`)

  } catch (error) {
    console.error('❌ Error fatal:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

// Ejecutar
recoverPresentation().catch(console.error)
