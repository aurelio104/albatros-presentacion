import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const CONTENT_FILE = path.join(process.cwd(), 'data', 'content.json')

// GET - Obtener contenido
export async function GET() {
  try {
    // Verificar que el archivo existe
    if (!fs.existsSync(CONTENT_FILE)) {
      console.error(`Archivo no encontrado: ${CONTENT_FILE}`)
      // Crear contenido por defecto si no existe
      const defaultContent = {
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
      
      // Asegurar que el directorio existe
      const dataDir = path.dirname(CONTENT_FILE)
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true })
      }
      
      // Crear archivo con contenido por defecto
      fs.writeFileSync(CONTENT_FILE, JSON.stringify(defaultContent, null, 2), 'utf-8')
      return NextResponse.json(defaultContent)
    }

    const fileContent = fs.readFileSync(CONTENT_FILE, 'utf-8')
    const content = JSON.parse(fileContent)
    return NextResponse.json(content)
  } catch (error: any) {
    console.error('Error al leer el contenido:', error)
    return NextResponse.json(
      { 
        error: 'Error al leer el contenido',
        details: error?.message || 'Error desconocido',
        path: CONTENT_FILE,
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    )
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

    // Asegurar que el directorio existe
    const dataDir = path.dirname(CONTENT_FILE)
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    // Guardar contenido
    fs.writeFileSync(CONTENT_FILE, JSON.stringify(body, null, 2), 'utf-8')
    
    return NextResponse.json({ success: true, message: 'Contenido guardado exitosamente' })
  } catch (error: any) {
    console.error('Error al guardar el contenido:', error)
    return NextResponse.json(
      { 
        error: 'Error al guardar el contenido',
        details: error?.message || 'Error desconocido',
        path: CONTENT_FILE,
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    )
  }
}
