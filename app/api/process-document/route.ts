import { NextRequest, NextResponse } from 'next/server'
import mammoth from 'mammoth'
import fs from 'fs/promises'
import path from 'path'

// Simulación de categorización con IA
// En producción, usarías OpenAI API o similar
async function categorizeWithAI(text: string, images: string[]): Promise<{
  category: string
  widgets: Array<{
    title: string
    preview: string
    description: string
    additionalInfo?: string
  }>
}> {
  // Análisis de palabras clave para categorización
  const keywords = {
    operaciones: ['operación', 'proceso', 'producción', 'manufactura', 'logística', 'cadena', 'suministro', 'operativo'],
    economico: ['económico', 'financiero', 'costo', 'presupuesto', 'inversión', 'rentabilidad', 'ganancia', 'ahorro', 'presupuesto'],
    tecnologico: ['tecnología', 'tecnológico', 'digital', 'software', 'sistema', 'plataforma', 'innovación', 'automatización', 'IA', 'inteligencia artificial'],
    estrategico: ['estrategia', 'plan', 'objetivo', 'meta', 'visión', 'misión', 'dirección', 'liderazgo'],
    recursos: ['recurso', 'humano', 'personal', 'talento', 'equipo', 'organización', 'capacitación'],
    calidad: ['calidad', 'estándar', 'certificación', 'mejora', 'optimización', 'eficiencia', 'excelencia']
  }

  const textLower = text.toLowerCase()
  let maxScore = 0
  let detectedCategory: string = 'otro'

  for (const [category, words] of Object.entries(keywords)) {
    const score = words.reduce((acc, word) => {
      const regex = new RegExp(word, 'gi')
      const matches = textLower.match(regex)
      return acc + (matches ? matches.length : 0)
    }, 0)
    
    if (score > maxScore) {
      maxScore = score
      detectedCategory = category
    }
  }

  // Dividir el texto en secciones para crear widgets
  const sections = text.split(/\n\s*\n|\r\n\s*\r\n/).filter(s => s.trim().length > 50)
  
  const widgets = sections.slice(0, 10).map((section, index) => {
    const lines = section.split('\n').filter(l => l.trim())
    const title = lines[0]?.trim().substring(0, 50) || `Sección ${index + 1}`
    const description = lines.slice(1).join(' ').trim().substring(0, 500) || section.substring(0, 500)
    const preview = description.substring(0, 100) + (description.length > 100 ? '...' : '')

    return {
      title,
      preview,
      description,
      additionalInfo: section.length > 500 ? section.substring(500, 1000) : undefined
    }
  })

  return {
    category: detectedCategory,
    widgets: widgets.length > 0 ? widgets : [{
      title: 'Contenido Extraído',
      preview: text.substring(0, 100),
      description: text.substring(0, 500),
      additionalInfo: text.length > 500 ? text.substring(500) : undefined
    }]
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No se proporcionó ningún archivo' }, { status: 400 })
    }

    const fileType = file.type
    const fileName = file.name
    const fileBuffer = Buffer.from(await file.arrayBuffer())

    let extractedText = ''
    let extractedImages: string[] = []

    // Procesar según el tipo de archivo
    if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
        fileName.endsWith('.docx')) {
      // Procesar Word
      const result = await mammoth.extractRawText({ buffer: fileBuffer })
      extractedText = result.value
      
      // Extraer imágenes si las hay (mammoth puede extraer imágenes con convertToHtml)
      try {
        const htmlResult = await mammoth.convertToHtml({ buffer: fileBuffer })
        // Las imágenes se extraerían del HTML, pero por ahora las dejamos vacías
        // En producción, se procesarían las imágenes base64 del HTML
        extractedImages = []
      } catch (err) {
        // Si falla la extracción de imágenes, continuamos sin ellas
        extractedImages = []
      }
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
               fileName.endsWith('.pptx')) {
      // Para PowerPoint, necesitamos una librería diferente
      // Por ahora, extraemos texto básico
      extractedText = `Presentación: ${fileName}\n\nNota: El procesamiento completo de PowerPoint requiere librerías adicionales. Por favor, exporta el contenido a Word o proporciona el texto manualmente.`
    } else {
      return NextResponse.json({ 
        error: 'Formato de archivo no soportado. Use .docx o .pptx' 
      }, { status: 400 })
    }

    if (!extractedText || extractedText.trim().length < 10) {
      return NextResponse.json({ 
        error: 'No se pudo extraer contenido del documento' 
      }, { status: 400 })
    }

    // Categorizar y organizar con IA
    const categorized = await categorizeWithAI(extractedText, extractedImages)

    return NextResponse.json({
      success: true,
      category: categorized.category,
      widgets: categorized.widgets,
      rawText: extractedText.substring(0, 1000), // Primeros 1000 caracteres para preview
      images: extractedImages
    })

  } catch (error: any) {
    console.error('Error procesando documento:', error)
    return NextResponse.json({ 
      error: 'Error al procesar el documento: ' + (error.message || 'Error desconocido') 
    }, { status: 500 })
  }
}
