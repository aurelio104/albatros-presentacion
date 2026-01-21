import { NextRequest, NextResponse } from 'next/server'
import mammoth from 'mammoth'
import * as XLSX from 'xlsx'
import fs from 'fs/promises'
import path from 'path'
import { writeFile } from 'fs/promises'

interface ExtractedSection {
  title: string
  content: string
  images: string[]
  level: number // Nivel del título (1, 2, 3, etc.)
}

// Extraer contenido estructurado de Word
async function extractStructuredContentFromWord(fileBuffer: Buffer): Promise<{
  sections: ExtractedSection[]
  allImages: string[]
}> {
  try {
    // Extraer HTML para obtener estructura
    const htmlResult = await mammoth.convertToHtml({ buffer: fileBuffer })
    const html = htmlResult.value
    
    // Extraer imágenes
    const images: string[] = []
    const imageMatches = html.match(/<img[^>]+src="data:image\/([^;]+);base64,([^"]+)"/g)
    if (imageMatches) {
      for (let i = 0; i < imageMatches.length; i++) {
        const match = imageMatches[i].match(/data:image\/([^;]+);base64,([^"]+)/)
        if (match) {
          const ext = match[1] === 'jpeg' ? 'jpg' : match[1]
          const base64Data = match[2]
          const imageBuffer = Buffer.from(base64Data, 'base64')
          
          // Guardar imagen
          const imageDir = path.join(process.cwd(), 'public', 'images')
          if (!require('fs').existsSync(imageDir)) {
            require('fs').mkdirSync(imageDir, { recursive: true })
          }
          
          const imageName = `extracted-${Date.now()}-${i}.${ext}`
          const imagePath = path.join(imageDir, imageName)
          await writeFile(imagePath, imageBuffer)
          
          images.push(`/images/${imageName}`)
        }
      }
    }
    
    // Extraer texto estructurado
    const textResult = await mammoth.extractRawText({ buffer: fileBuffer })
    const fullText = textResult.value
    
    // Detectar títulos y secciones
    // Los títulos suelen estar en líneas separadas, en mayúsculas, o con números
    const lines = fullText.split(/\r?\n/).filter(l => l.trim().length > 0)
    const sections: ExtractedSection[] = []
    
    let currentSection: ExtractedSection | null = null
    let currentContent: string[] = []
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      
      // Detectar si es un título (línea corta, mayúsculas, o con números/viñetas)
      const isTitle = (
        line.length < 100 && // Título corto
        (
          /^[A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ\s]{2,}$/.test(line) || // Todo mayúsculas
          /^\d+[\.\)]\s/.test(line) || // Número seguido de punto o paréntesis
          /^[IVX]+[\.\)]\s/.test(line) || // Números romanos
          /^[•\-\*]\s/.test(line) || // Viñetas
          (line.length < 50 && i < lines.length - 1 && lines[i + 1]?.trim().length > 50) // Línea corta seguida de contenido largo
        )
      )
      
      if (isTitle && currentSection) {
        // Guardar sección anterior
        sections.push({
          ...currentSection,
          content: currentContent.join('\n').trim()
        })
        
        // Iniciar nueva sección
        currentSection = {
          title: line.replace(/^[\d•\-\*IVX\.\)\s]+/, '').trim(), // Limpiar números/viñetas
          content: '',
          images: [],
          level: 1
        }
        currentContent = []
      } else if (isTitle && !currentSection) {
        // Primera sección
        currentSection = {
          title: line.replace(/^[\d•\-\*IVX\.\)\s]+/, '').trim(),
          content: '',
          images: [],
          level: 1
        }
        currentContent = []
      } else if (currentSection) {
        // Agregar contenido a la sección actual
        currentContent.push(line)
      }
    }
    
    // Agregar última sección
    if (currentSection) {
      sections.push({
        ...currentSection,
        content: currentContent.join('\n').trim()
      })
    }
    
    // Si no se detectaron secciones, crear una con todo el contenido
    if (sections.length === 0) {
      // Dividir por párrafos largos
      const paragraphs = fullText.split(/\n\s*\n/).filter(p => p.trim().length > 50)
      sections.push(...paragraphs.map((para, idx) => ({
        title: `Sección ${idx + 1}`,
        content: para.trim(),
        images: [],
        level: 1
      })))
    }
    
    // Distribuir imágenes entre secciones
    images.forEach((img, idx) => {
      const sectionIndex = Math.floor((idx / images.length) * sections.length)
      if (sections[sectionIndex]) {
        sections[sectionIndex].images.push(img)
      }
    })
    
    return { sections, allImages: images }
  } catch (error) {
    console.error('Error extrayendo contenido estructurado:', error)
    // Fallback: extraer texto simple
    const textResult = await mammoth.extractRawText({ buffer: fileBuffer })
    return {
      sections: [{
        title: 'Contenido Extraído',
        content: textResult.value,
        images: [],
        level: 1
      }],
      allImages: []
    }
  }
}

// Extraer contenido de Excel
async function extractFromExcel(fileBuffer: Buffer): Promise<ExtractedSection[]> {
  try {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' })
    const sections: ExtractedSection[] = []
    
    workbook.SheetNames.forEach((sheetName, sheetIdx) => {
      const worksheet = workbook.Sheets[sheetName]
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' })
      
      // Primera fila como título, resto como contenido
      if (data.length > 0) {
        const title = String(data[0]?.[0] || `Hoja ${sheetIdx + 1}`).trim()
        const content = data.slice(1)
          .map(row => row.filter(cell => cell).join(' | '))
          .filter(row => row.trim().length > 0)
          .join('\n')
        
        if (content.trim().length > 0) {
          sections.push({
            title,
            content,
            images: [],
            level: 1
          })
        }
      }
    })
    
    return sections.length > 0 ? sections : [{
      title: 'Contenido de Excel',
      content: 'No se pudo extraer contenido estructurado',
      images: [],
      level: 1
    }]
  } catch (error) {
    console.error('Error extrayendo Excel:', error)
    return [{
      title: 'Error',
      content: 'No se pudo procesar el archivo Excel',
      images: [],
      level: 1
    }]
  }
}

// Categorizar contenido
async function categorizeContent(text: string): Promise<string> {
  const keywords = {
    operaciones: ['operación', 'proceso', 'producción', 'manufactura', 'logística', 'cadena', 'suministro', 'operativo'],
    economico: ['económico', 'financiero', 'costo', 'presupuesto', 'inversión', 'rentabilidad', 'ganancia', 'ahorro'],
    tecnologico: ['tecnología', 'tecnológico', 'digital', 'software', 'sistema', 'plataforma', 'innovación', 'automatización', 'IA'],
    estrategico: ['estrategia', 'plan', 'objetivo', 'meta', 'visión', 'misión', 'dirección', 'liderazgo'],
    recursos: ['recurso', 'humano', 'personal', 'talento', 'equipo', 'organización', 'capacitación'],
    calidad: ['calidad', 'estándar', 'certificación', 'mejora', 'optimización', 'eficiencia', 'excelencia']
  }

  const textLower = text.toLowerCase()
  let maxScore = 0
  let detectedCategory = 'otro'

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

  return detectedCategory
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const autoCreate = formData.get('autoCreate') === 'true' // Si debe crear widgets automáticamente

    if (!file) {
      return NextResponse.json({ error: 'No se proporcionó ningún archivo' }, { status: 400 })
    }

    const fileType = file.type
    const fileName = file.name.toLowerCase()
    const fileBuffer = Buffer.from(await file.arrayBuffer())

    let sections: ExtractedSection[] = []
    let allImages: string[] = []

    // Procesar según el tipo de archivo
    if (fileName.endsWith('.docx') || 
        fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      // Procesar Word
      const extracted = await extractStructuredContentFromWord(fileBuffer)
      sections = extracted.sections
      allImages = extracted.allImages
      
    } else if (fileName.endsWith('.xlsx') || 
               fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      // Procesar Excel
      sections = await extractFromExcel(fileBuffer)
      
    } else if (fileName.endsWith('.pptx') ||
               fileType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
      // PowerPoint - por ahora mensaje informativo
      return NextResponse.json({ 
        error: 'PowerPoint (.pptx) requiere procesamiento adicional. Por favor, exporta el contenido a Word (.docx) o Excel (.xlsx)',
        suggestion: 'Puedes guardar las diapositivas como imágenes o exportar el texto a Word'
      }, { status: 400 })
    } else {
      return NextResponse.json({ 
        error: 'Formato no soportado. Use .docx, .xlsx o .pptx' 
      }, { status: 400 })
    }

    if (sections.length === 0) {
      return NextResponse.json({ 
        error: 'No se pudo extraer contenido del documento' 
      }, { status: 400 })
    }

    // Categorizar cada sección
    const categorizedSections = await Promise.all(
      sections.map(async (section) => {
        const category = await categorizeContent(section.title + ' ' + section.content)
        return { ...section, category }
      })
    )

    // Crear widgets
    const widgets = categorizedSections.map((section, index) => {
      const preview = section.content.substring(0, 150).trim() + (section.content.length > 150 ? '...' : '')
      const description = section.content.substring(0, 1000).trim()
      const additionalInfo = section.content.length > 1000 ? section.content.substring(1000).trim() : undefined

      return {
        title: section.title || `Sección ${index + 1}`,
        preview,
        description,
        additionalInfo,
        category: section.category,
        images: section.images,
        order: index
      }
    })

    return NextResponse.json({
      success: true,
      widgets,
      totalSections: sections.length,
      totalImages: allImages.length,
      fileName: file.name
    })

  } catch (error: any) {
    console.error('Error procesando documento:', error)
    return NextResponse.json({ 
      error: 'Error al procesar el documento: ' + (error.message || 'Error desconocido'),
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}
