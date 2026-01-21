import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { writeFile } from 'fs/promises'
import path from 'path'
import { existsSync, mkdirSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      )
    }

    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de archivo no válido. Solo se permiten imágenes.' },
        { status: 400 }
      )
    }

    // Validar tamaño (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'El archivo es demasiado grande. Máximo 10MB.' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generar nombre único
    const timestamp = Date.now()
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `${timestamp}-${originalName}`

    let fileUrl = ''

    // Intentar usar Vercel Blob Storage primero (producción)
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const blob = await put(fileName, buffer, {
          access: 'public',
          contentType: file.type,
        })
        fileUrl = blob.url
      } catch (blobError: any) {
        console.error('Error subiendo a Blob Storage:', blobError)
        // Continuar con método alternativo
      }
    }

    // Si Blob Storage no está disponible, intentar guardar localmente (solo desarrollo)
    if (!fileUrl && process.env.NODE_ENV === 'development' && !process.env.VERCEL) {
      try {
        const uploadDir = path.join(process.cwd(), 'public', 'images')
        if (!existsSync(uploadDir)) {
          mkdirSync(uploadDir, { recursive: true })
        }

        const filePath = path.join(uploadDir, fileName)
        await writeFile(filePath, buffer)

        fileUrl = `/images/${fileName}`
      } catch (fileError: any) {
        console.error('Error guardando archivo localmente:', fileError)
        // Si falla, retornar error
        if (fileError.code === 'EROFS') {
          return NextResponse.json(
            { 
              error: 'No se puede guardar archivos en el sistema de archivos',
              details: 'El sistema de archivos es de solo lectura en producción',
              solution: 'Configura Vercel Blob Storage. Ve a Vercel Dashboard > Storage > Create Database > Blob',
              hint: 'O configura las variables de entorno BLOB_READ_WRITE_TOKEN'
            },
            { status: 500 }
          )
        }
        throw fileError
      }
    }

    // Si no se pudo guardar en ningún lado
    if (!fileUrl) {
      return NextResponse.json(
        { 
          error: 'No se pudo guardar la imagen',
          details: 'Necesitas configurar Vercel Blob Storage para subir imágenes en producción',
          solution: 'Ve a Vercel Dashboard > Storage > Create Database > Blob',
          hint: 'Consulta la documentación de Vercel Blob Storage'
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      url: fileUrl,
      fileName: fileName,
      size: file.size,
      type: file.type
    })
  } catch (error: any) {
    console.error('Error al subir archivo:', error)
    return NextResponse.json(
      { 
        error: 'Error al subir el archivo',
        details: error?.message || 'Error desconocido',
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    )
  }
}
