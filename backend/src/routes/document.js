import express from 'express'
import multer from 'multer'
import mammoth from 'mammoth'
import * as XLSX from 'xlsx'
import pdfParse from 'pdf-parse'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

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
  operaciones: ['operación', 'proceso', 'producción', 'manufactura', 'logística', 'cadena', 'suministro', 'operativo'],
  economico: ['económico', 'financiero', 'costo', 'presupuesto', 'inversión', 'rentabilidad', 'ganancia', 'ahorro'],
  tecnologico: ['tecnología', 'tecnológico', 'digital', 'software', 'sistema', 'plataforma', 'innovación', 'automatización', 'IA'],
  estrategico: ['estrategia', 'plan', 'objetivo', 'meta', 'visión', 'misión', 'dirección', 'liderazgo'],
  recursos: ['recurso', 'humano', 'personal', 'talento', 'equipo', 'organización', 'capacitación'],
  calidad: ['calidad', 'estándar', 'certificación', 'mejora', 'optimización', 'eficiencia', 'excelencia']
}

// Extraer contenido estructurado de Word
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
    
    // Detectar títulos y secciones
    const lines = fullText.split(/\r?\n/).filter(l => l.trim().length > 0)
    const sections = []
    
    let currentSection = null
    let currentContent = []
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      
      const isTitle = (
        line.length < 100 &&
        (
          /^[A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ\s]{2,}$/.test(line) ||
          /^\d+[\.\)]\s/.test(line) ||
          /^[IVX]+[\.\)]\s/.test(line) ||
          /^[•\-\*]\s/.test(line) ||
          (line.length < 50 && i < lines.length - 1 && lines[i + 1]?.trim().length > 50)
        )
      )
      
      if (isTitle && currentSection) {
        sections.push({
          ...currentSection,
          content: currentContent.join('\n').trim()
        })
        currentSection = {
          title: line.replace(/^[\d•\-\*IVX\.\)\s]+/, '').trim(),
          content: '',
          images: [],
          level: 1
        }
        currentContent = []
      } else if (isTitle && !currentSection) {
        currentSection = {
          title: line.replace(/^[\d•\-\*IVX\.\)\s]+/, '').trim(),
          content: '',
          images: [],
          level: 1
        }
        currentContent = []
      } else if (currentSection) {
        currentContent.push(line)
      }
    }
    
    if (currentSection) {
      sections.push({
        ...currentSection,
        content: currentContent.join('\n').trim()
      })
    }
    
    if (sections.length === 0) {
      const paragraphs = fullText.split(/\n\s*\n/).filter(p => p.trim().length > 50)
      sections.push(...paragraphs.map((para, idx) => ({
        title: `Sección ${idx + 1}`,
        content: para.trim(),
        images: [],
        level: 1
      })))
    }
    
    // Distribuir imágenes
    images.forEach((img, idx) => {
      const sectionIndex = Math.floor((idx / images.length) * sections.length)
      if (sections[sectionIndex]) {
        sections[sectionIndex].images.push(img)
      }
    })
    
    return { sections, allImages: images }
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

// Extraer contenido de PDF
async function extractFromPDF(fileBuffer) {
  try {
    const data = await pdfParse(fileBuffer)
    const fullText = data.text
    
    // Detectar secciones basándose en títulos en mayúsculas o con formato especial
    const lines = fullText.split(/\r?\n/).filter(l => l.trim().length > 0)
    const sections = []
    
    let currentSection = null
    let currentContent = []
    
    // Patrones para detectar títulos de secciones
    const titlePatterns = [
      /^[A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ\s]{3,}$/, // Todo mayúsculas
      /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ\s]+:$/, // Título seguido de dos puntos
      /^##?\s+/, // Markdown style
      /^\d+[\.\)]\s+[A-Z]/, // Número seguido de texto en mayúscula
    ]
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      
      // Detectar si es un título
      const isTitle = titlePatterns.some(pattern => pattern.test(line)) ||
        (line.length < 80 && 
         line.length > 5 && 
         /^[A-ZÁÉÍÓÚÑ]/.test(line) &&
         i < lines.length - 1 && 
         lines[i + 1]?.trim().length > 50)
      
      if (isTitle && currentSection) {
        // Guardar sección anterior
        sections.push({
          ...currentSection,
          content: currentContent.join('\n').trim()
        })
        
        // Iniciar nueva sección
        currentSection = {
          title: line.replace(/^##?\s+/, '').replace(/:$/, '').trim(),
          content: '',
          images: [],
          level: 1
        }
        currentContent = []
      } else if (isTitle && !currentSection) {
        // Primera sección
        currentSection = {
          title: line.replace(/^##?\s+/, '').replace(/:$/, '').trim(),
          content: '',
          images: [],
          level: 1
        }
        currentContent = []
      } else if (currentSection) {
        currentContent.push(line)
      }
    }
    
    // Añadir última sección
    if (currentSection) {
      sections.push({
        ...currentSection,
        content: currentContent.join('\n').trim()
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
    
    return sections
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

// Categorizar contenido
function categorizeContent(text) {
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
    const autoCreate = req.body.autoCreate === 'true'

    let sections = []
    let allImages = []

    // Procesar según el tipo de archivo
    if (fileName.endsWith('.docx')) {
      const extracted = await extractStructuredContentFromWord(fileBuffer)
      sections = extracted.sections
      allImages = extracted.allImages
    } else if (fileName.endsWith('.xlsx')) {
      sections = await extractFromExcel(fileBuffer)
    } else if (fileName.endsWith('.pdf') || req.file.mimetype === 'application/pdf') {
      sections = await extractFromPDF(fileBuffer)
    } else if (fileName.endsWith('.pptx')) {
      return res.status(400).json({
        error: 'PowerPoint (.pptx) requiere procesamiento adicional',
        suggestion: 'Exporta el contenido a Word (.docx) o Excel (.xlsx)'
      })
    } else {
      return res.status(400).json({
        error: 'Formato no soportado. Use .docx, .xlsx, .pdf o .pptx'
      })
    }

    if (sections.length === 0) {
      return res.status(400).json({
        error: 'No se pudo extraer contenido del documento'
      })
    }

    // Categorizar cada sección
    const categorizedSections = sections.map((section) => {
      const category = categorizeContent(section.title + ' ' + section.content)
      return { ...section, category }
    })

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

    res.json({
      success: true,
      widgets,
      totalSections: sections.length,
      totalImages: allImages.length,
      fileName: req.file.originalname
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
