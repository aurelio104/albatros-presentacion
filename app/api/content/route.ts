import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const CONTENT_FILE = path.join(process.cwd(), 'data', 'content.json')
const KV_KEY = 'albatros:content'

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

// Función para leer desde KV (producción)
async function readFromKV() {
  try {
    // Solo intentar usar KV si las variables de entorno están configuradas
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      const { kv } = await import('@vercel/kv')
      const content = await kv.get(KV_KEY)
      if (content) {
        return content
      }
    }
  } catch (error) {
    console.error('Error leyendo desde KV:', error)
  }
  return null
}

// Función para escribir en KV (producción)
async function writeToKV(content: any) {
  try {
    // Solo intentar usar KV si las variables de entorno están configuradas
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      const { kv } = await import('@vercel/kv')
      await kv.set(KV_KEY, content)
      return true
    }
  } catch (error) {
    console.error('Error escribiendo en KV:', error)
  }
  return false
}

// Función para leer desde archivo (solo desarrollo/local)
async function readFromFile() {
  try {
    if (fs.existsSync(CONTENT_FILE)) {
      const fileContent = fs.readFileSync(CONTENT_FILE, 'utf-8')
      return JSON.parse(fileContent)
    }
  } catch (error) {
    console.error('Error leyendo archivo:', error)
  }
  return null
}

// GET - Obtener contenido
export async function GET() {
  try {
    let content = null

    // Intentar leer desde KV primero (producción)
    content = await readFromKV()

    // Si no está en KV, intentar leer desde archivo (desarrollo)
    if (!content) {
      content = await readFromFile()
    }

    // Si no existe, usar contenido por defecto
    if (!content) {
      content = getDefaultContent()
      // Guardar contenido por defecto en KV si está disponible
      await writeToKV(content)
    }

    return NextResponse.json(content)
  } catch (error: any) {
    console.error('Error al leer el contenido:', error)
    // En caso de error, retornar contenido por defecto
    return NextResponse.json(getDefaultContent())
  }
}

// POST - Guardar contenido
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar estructura básica
    if (!body.widgets || !body.settings) {
      return NextResponse.json(
        { error: 'Estructura de contenido inválida' },
        { status: 400 }
      )
    }

    let saved = false

    // Intentar guardar en KV primero (producción)
    saved = await writeToKV(body)

    // Si KV no está disponible, intentar guardar en archivo (solo desarrollo)
    if (!saved && process.env.NODE_ENV === 'development') {
      try {
        const dataDir = path.dirname(CONTENT_FILE)
        if (!fs.existsSync(dataDir)) {
          fs.mkdirSync(dataDir, { recursive: true })
        }
        fs.writeFileSync(CONTENT_FILE, JSON.stringify(body, null, 2), 'utf-8')
        saved = true
      } catch (fileError: any) {
        console.error('Error guardando en archivo:', fileError)
      }
    }

    if (!saved) {
      // Si no se pudo guardar, verificar si es porque KV no está configurado
      const kvNotConfigured = !process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN
      
      if (kvNotConfigured) {
        return NextResponse.json(
          { 
            error: 'Vercel KV no está configurado',
            details: 'El sistema de archivos es de solo lectura en producción de Vercel',
            solution: 'Configura Vercel KV para guardar contenido',
            instructions: [
              '1. Ve a https://vercel.com/dashboard',
              '2. Selecciona tu proyecto "albatros-presentacion"',
              '3. Ve a la pestaña "Storage"',
              '4. Haz clic en "Create Database"',
              '5. Selecciona "KV" (Redis)',
              '6. Elige un nombre y región',
              '7. Haz clic en "Create"',
              '8. Vercel redesplegará automáticamente'
            ],
            hint: 'Consulta VERCEL_KV_SETUP.md para instrucciones detalladas con imágenes'
          },
          { status: 500 }
        )
      }
      
      // Si KV está configurado pero falló, error diferente
      return NextResponse.json(
        { 
          error: 'Error al guardar en Vercel KV',
          details: 'Verifica la configuración de KV y los logs de Vercel',
          solution: 'Revisa los logs en Vercel Dashboard > Deployments > Logs'
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true, message: 'Contenido guardado exitosamente' })
  } catch (error: any) {
    console.error('Error al guardar el contenido:', error)
    return NextResponse.json(
      { 
        error: 'Error al guardar el contenido',
        details: error?.message || 'Error desconocido',
        solution: process.env.NODE_ENV === 'production' 
          ? 'Configura Vercel KV en tu proyecto (ver VERCEL_KV_SETUP.md)'
          : 'Verifica los permisos del archivo en desarrollo'
      },
      { status: 500 }
    )
  }
}
