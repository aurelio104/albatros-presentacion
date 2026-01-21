import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const CONTENT_FILE = path.join(process.cwd(), 'data', 'content.json')

// GET - Obtener contenido
export async function GET() {
  try {
    const fileContent = fs.readFileSync(CONTENT_FILE, 'utf-8')
    const content = JSON.parse(fileContent)
    return NextResponse.json(content)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al leer el contenido' },
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
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al guardar el contenido' },
      { status: 500 }
    )
  }
}
