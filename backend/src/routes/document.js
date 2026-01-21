import express from 'express'
import multer from 'multer'
import mammoth from 'mammoth'
import * as XLSX from 'xlsx'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const pdfParse = require('pdf-parse')

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

// Configurar multer para documentos
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  }
})

// Interfaces
const keywords = {
  operaciones: ['operación', 'proceso', 'producción', 'manufactura', 'logística', 'cadena', 'suministro', 'operativo', 'motor', 'aeronave', 'componente', 'reversible'],
  economico: ['económico', 'financiero', 'costo', 'presupuesto', 'inversión', 'rentabilidad', 'ganancia', 'ahorro', 'adquisición', 'compra'],
  tecnologico: ['tecnología', 'tecnológico', 'digital', 'software', 'sistema', 'plataforma', 'innovación', 'automatización', 'IA', 'material', 'fatiga', 'térmica', 'temperatura'],
  estrategico: ['estrategia', 'plan', 'objetivo', 'meta', 'visión', 'misión', 'dirección', 'liderazgo'],
  recursos: ['recurso', 'humano', 'personal', 'talento', 'equipo', 'organización', 'capacitación'],
  calidad: ['calidad', 'estándar', 'certificación', 'mejora', 'optimización', 'eficiencia', 'excelencia', 'inspección', 'mantenimiento', 'grieta', 'falla', 'análisis', 'preventivo', 'correctivo']
}

// Función inteligente para detectar nivel jerárquico de un título
function detectTitleLevel(line, previousLine, nextLine, lineIndex, allLines) {
  const trimmed = line.trim()
  const length = trimmed.length
  
  // Nivel 1: Títulos principales (muy cortos, mayúsculas, o con formato especial)
  const isLevel1 = (
    // Todo mayúsculas y corto
    (/^[A-ZÁÉÍÓÚÑ\s]{3,50}$/.test(trimmed) && trimmed.length < 50) ||
    // Título seguido de dos puntos al final
    (trimmed.endsWith(':') && length < 60 && /^[A-ZÁÉÍÓÚÑ]/.test(trimmed)) ||
    // Títulos comunes de documentos técnicos
    /^(INFORME|ANÁLISIS|CONCLUSIÓN|RECOMENDACIÓN|OBSERVACIONES|INTRODUCCIÓN|RESUMEN|OBJETIVO|METODOLOGÍA|RESULTADOS|DISCUSIÓN)$/i.test(trimmed) ||
    // Números romanos seguidos de título
    /^[IVX]+[\.\)]\s+[A-ZÁÉÍÓÚÑ]/.test(trimmed)
  )
  
  // Nivel 2: Subtítulos (medianos, pueden tener números)
  const isLevel2 = (
    // Número seguido de punto y texto
    /^\d+[\.\)]\s+[A-ZÁÉÍÓÚÑ]/.test(trimmed) ||
    // Letra seguida de punto y texto
    /^[a-z][\.\)]\s+[A-ZÁÉÍÓÚÑ]/.test(trimmed) ||
    // Título en mayúsculas pero más largo
    (/^[A-ZÁÉÍÓÚÑ]/.test(trimmed) && length > 20 && length < 80 && !trimmed.includes('.'))
  )
  
  // Nivel 3: Sub-subtítulos (viñetas, guiones)
  const isLevel3 = (
    /^[•\-\*]\s+[A-ZÁÉÍÓÚÑ]/.test(trimmed) ||
    /^[a-z]\)\s+[A-ZÁÉÍÓÚÑ]/.test(trimmed)
  )
  
  // Contexto adicional: verificar si la línea siguiente es contenido
  const hasContentAfter = nextLine && nextLine.trim().length > 50
  const hasTitleBefore = previousLine && (
    /^[A-ZÁÉÍÓÚÑ]/.test(previousLine.trim()) ||
    previousLine.trim().length < 30
  )
  
  if (isLevel1 && hasContentAfter) return 1
  if (isLevel2 && hasContentAfter) return 2
  if (isLevel3 && hasContentAfter) return 3
  
  // Si no cumple criterios estrictos pero parece título por contexto
  if (length < 80 && length > 5 && /^[A-ZÁÉÍÓÚÑ]/.test(trimmed) && hasContentAfter && !hasTitleBefore) {
    return 2 // Asumir nivel 2 por defecto
  }
  
  return null // No es un título
}

// Extraer contenido estructurado de Word con detección inteligente
async function extractStructuredContentFromWord(fileBuffer) {
  try {
    const htmlResult = await mammoth.convertToHtml({ buffer: fileBuffer })
    const html = htmlResult.value
    
    // Extraer imágenes
    const images = []
    const imageMatches = html.match(/<img[^>]+src="data:image\/([^;]+);base64,([^"]+)"/g)
    if (imageMatches) {
      const imagesDir = path.join(__dirname, '..', '..', 'public', 'images')
      await fs.mkdir(imagesDir, { recursive: true })
      
      for (let i = 0; i < imageMatches.length; i++) {
        const match = imageMatches[i].match(/data:image\/([^;]+);base64,([^"]+)/)
        if (match) {
          const ext = match[1] === 'jpeg' ? 'jpg' : match[1]
          const base64Data = match[2]
          const imageBuffer = Buffer.from(base64Data, 'base64')
          
          const imageName = `extracted-${Date.now()}-${i}.${ext}`
          const imagePath = path.join(imagesDir, imageName)
          await fs.writeFile(imagePath, imageBuffer)
          
          const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001'
          images.push(`${backendUrl}/images/${imageName}`)
        }
      }
    }
    
    // Extraer texto estructurado
    const textResult = await mammoth.extractRawText({ buffer: fileBuffer })
    const fullText = textResult.value
    
    return extractStructuredSections(fullText, images)
  } catch (error) {
    console.error('Error extrayendo contenido:', error)
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

// Función inteligente para extraer secciones estructuradas
function extractStructuredSections(fullText, images = []) {
  const lines = fullText.split(/\r?\n/).filter(l => l.trim().length > 0)
  const sections = []
  
  let currentSection = null
  let currentContent = []
  let currentLevel = 1
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    const previousLine = i > 0 ? lines[i - 1].trim() : ''
    const nextLine = i < lines.length - 1 ? lines[i + 1].trim() : ''
    
    // Detectar si es un título y su nivel
    const titleLevel = detectTitleLevel(line, previousLine, nextLine, i, lines)
    
    if (titleLevel !== null) {
      // Guardar sección anterior si existe
      if (currentSection && (currentContent.length > 0 || currentSection.title)) {
        sections.push({
          ...currentSection,
          content: currentContent.join('\n').trim(),
          level: currentLevel
        })
      }
      
      // Crear nueva sección
      const cleanTitle = line
        .replace(/^##?\s+/, '') // Markdown
        .replace(/^[\d•\-\*IVX\.\)\s]+/, '') // Números/viñetas
        .replace(/:$/, '') // Dos puntos finales
        .trim()
      
      currentSection = {
        title: cleanTitle || `Sección ${sections.length + 1}`,
        content: '',
        images: [],
        level: titleLevel
      }
      currentLevel = titleLevel
      currentContent = []
    } else if (currentSection) {
      // Agregar contenido a la sección actual
      currentContent.push(line)
    } else if (line.length > 50) {
      // Si no hay sección actual pero hay contenido, crear una
      currentSection = {
        title: 'Introducción',
        content: line,
        images: [],
        level: 1
      }
      currentContent = []
    }
  }
  
  // Agregar última sección
  if (currentSection) {
    sections.push({
      ...currentSection,
      content: currentContent.join('\n').trim(),
      level: currentLevel
    })
  }
  
  // Si no se detectaron secciones, crear una con todo el contenido
  if (sections.length === 0) {
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
}

// Extraer contenido de PDF con detección inteligente
async function extractFromPDF(fileBuffer) {
  try {
    const pdfParser = await loadPdfParse()
    const data = await pdfParser(fileBuffer)
    const fullText = data.text
    
    return extractStructuredSections(fullText, [])
  } catch (error) {
    console.error('Error extrayendo PDF:', error)
    return [{
      title: 'Error',
      content: 'No se pudo procesar el archivo PDF',
      images: [],
      level: 1
    }]
  }
}

// Extraer de Excel
async function extractFromExcel(fileBuffer) {
  try {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' })
    const sections = []
    
    workbook.SheetNames.forEach((sheetName, sheetIdx) => {
      const worksheet = workbook.Sheets[sheetName]
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' })
      
      if (data.length > 0 && Array.isArray(data[0])) {
        const firstRow = data[0]
        const title = String(firstRow[0] || `Hoja ${sheetIdx + 1}`).trim()
        const content = data.slice(1)
          .map((row) => Array.isArray(row) ? row.filter((cell) => cell).join(' | ') : '')
          .filter((row) => row.trim().length > 0)
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

// Categorizar contenido de forma inteligente
function categorizeContent(text) {
  const textLower = text.toLowerCase()
  let maxScore = 0
  let detectedCategory = 'otro'
  
  // Contar ocurrencias de palabras clave con pesos
  for (const [category, words] of Object.entries(keywords)) {
    let score = 0
    
    for (const word of words) {
      const regex = new RegExp(`\\b${word}\\b`, 'gi')
      const matches = textLower.match(regex)
      if (matches) {
        // Palabras más específicas tienen mayor peso
        const weight = word.length > 8 ? 3 : word.length > 5 ? 2 : 1
        score += matches.length * weight
      }
    }
    
    if (score > maxScore) {
      maxScore = score
      detectedCategory = category
    }
  }
  
  return detectedCategory
}

// POST - Procesar documento
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No se proporcionó ningún archivo'
      })
    }

    const fileName = req.file.originalname.toLowerCase()
    const fileBuffer = req.file.buffer
    const fileMimeType = req.file.mimetype || ''
    const autoCreate = req.body.autoCreate === 'true'

    let sections = []
    let allImages = []

    // Procesar según el tipo de archivo
    // Verificar PDF primero (puede tener diferentes extensiones o MIME types)
    if (fileName.endsWith('.pdf') || 
        fileMimeType === 'application/pdf' ||
        fileMimeType.includes('pdf')) {
      console.log('Procesando PDF:', fileName, fileMimeType)
      try {
        const extracted = await extractFromPDF(fileBuffer)
        // Asegurar que extracted tiene la estructura correcta
        if (Array.isArray(extracted)) {
          sections = extracted
          allImages = []
        } else if (extracted.sections) {
          sections = extracted.sections
          allImages = extracted.allImages || []
        } else {
          sections = [extracted]
          allImages = []
        }
      } catch (pdfError) {
        console.error('Error específico procesando PDF:', pdfError)
        return res.status(400).json({
          error: 'Error al procesar el archivo PDF',
          details: pdfError.message || 'Error desconocido',
          hint: 'Asegúrate de que el PDF contenga texto (no sea solo imágenes escaneadas)'
        })
      }
    } else if (fileName.endsWith('.docx') || 
               fileMimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const extracted = await extractStructuredContentFromWord(fileBuffer)
      sections = extracted.sections
      allImages = extracted.allImages
    } else if (fileName.endsWith('.xlsx') || 
               fileMimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      sections = await extractFromExcel(fileBuffer)
    } else if (fileName.endsWith('.pptx') || 
               fileMimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
      return res.status(400).json({
        error: 'PowerPoint (.pptx) requiere procesamiento adicional',
        suggestion: 'Exporta el contenido a Word (.docx) o Excel (.xlsx)'
      })
    } else {
      console.error('Formato no reconocido:', {
        fileName,
        mimeType: fileMimeType,
        originalName: req.file.originalname
      })
      return res.status(400).json({
        error: 'Formato no soportado. Use .docx, .xlsx, .pdf o .pptx',
        received: `Archivo: ${req.file.originalname}, Tipo MIME: ${fileMimeType || 'desconocido'}`,
        hint: 'Asegúrate de que el archivo tenga la extensión correcta (.pdf)'
      })
    }

    if (sections.length === 0) {
      return res.status(400).json({
        error: 'No se pudo extraer contenido del documento'
      })
    }

    // Categorizar cada sección de forma inteligente
    const categorizedSections = sections.map((section) => {
      const fullText = `${section.title} ${section.content}`.toLowerCase()
      const category = categorizeContent(fullText)
      return { ...section, category }
    })

    // Crear widgets con información de nivel jerárquico
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
        images: section.images || [],
        order: index,
        level: section.level || 1 // Nivel jerárquico (1=título, 2=subtítulo, 3=sub-subtítulo)
      }
    })

    res.json({
      success: true,
      widgets,
      totalSections: sections.length,
      totalImages: allImages.length,
      fileName: req.file.originalname,
      structure: {
        levels: {
          titles: widgets.filter(w => w.level === 1).length,
          subtitles: widgets.filter(w => w.level === 2).length,
          subSubtitles: widgets.filter(w => w.level === 3).length
        }
      }
    })
  } catch (error) {
    console.error('Error procesando documento:', error)
    res.status(500).json({
      error: 'Error al procesar el documento',
      details: error.message || 'Error desconocido'
    })
  }
})

export default router
