import express from 'express'
import multer from 'multer'
import mammoth from 'mammoth'
import * as XLSX from 'xlsx'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'
import { PDFDocument } from 'pdf-lib'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// pdf-parse es CommonJS, necesitamos usar createRequire
const require = createRequire(import.meta.url)

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// pdf-parse es CommonJS, necesitamos usar createRequire
const require = createRequire(import.meta.url)

// Importar pdf-parse de forma segura - función lazy para evitar errores al iniciar
let pdfParseCache = null

function getPdfParse() {
  if (pdfParseCache !== null) {
    return pdfParseCache
  }
  
  try {
    const pdfParseModule = require('pdf-parse')
    console.log('📦 pdf-parse cargado. Tipo:', typeof pdfParseModule)
    console.log('🔑 Claves disponibles:', Object.keys(pdfParseModule || {}))
    
    // pdf-parse puede exportarse de diferentes formas dependiendo de la versión
    let pdfParse
    
    // Verificar si es función directa (versiones antiguas)
    if (typeof pdfParseModule === 'function') {
      pdfParse = pdfParseModule
      console.log('✅ pdfParse asignado como función directa')
    } 
    // Verificar si tiene .default (ES modules)
    else if (pdfParseModule && typeof pdfParseModule.default === 'function') {
      pdfParse = pdfParseModule.default
      console.log('✅ pdfParse asignado desde .default')
    } 
    // Verificar si tiene PDFParse (clase en versiones nuevas)
    else if (pdfParseModule && pdfParseModule.PDFParse && typeof pdfParseModule.PDFParse === 'function') {
      // PDFParse es una clase, necesitamos instanciarla o usar su método estático
      // En versiones nuevas, puede tener un método estático o necesitar instanciación
      if (typeof pdfParseModule.PDFParse.parse === 'function') {
        pdfParse = pdfParseModule.PDFParse.parse.bind(pdfParseModule.PDFParse)
        console.log('✅ pdfParse asignado desde PDFParse.parse (método estático)')
      } else {
        // Intentar usar la clase directamente si tiene un método callable
        pdfParse = pdfParseModule.PDFParse
        console.log('✅ pdfParse asignado desde PDFParse (clase)')
      }
    }
    // Verificar si tiene pdfParse (camelCase)
    else if (pdfParseModule && typeof pdfParseModule.pdfParse === 'function') {
      pdfParse = pdfParseModule.pdfParse
      console.log('✅ pdfParse asignado desde .pdfParse')
    }
    // Último intento: buscar cualquier función exportada
    else {
      // Buscar cualquier función en el módulo
      const functionKeys = Object.keys(pdfParseModule || {}).filter(key => 
        typeof pdfParseModule[key] === 'function' && 
        key.toLowerCase().includes('parse')
      )
      
      if (functionKeys.length > 0) {
        pdfParse = pdfParseModule[functionKeys[0]]
        console.log(`✅ pdfParse asignado desde .${functionKeys[0]}`)
      } else {
        // Si no encontramos función, intentar usar el módulo completo
        // Algunas versiones de pdf-parse exportan el módulo completo como función
        pdfParse = pdfParseModule
        console.log('⚠️ pdfParse asignado directamente (puede no ser función)')
      }
    }
    
    console.log('📊 pdfParse final. Tipo:', typeof pdfParse)
    
    // Verificar que sea una función o una clase instanciable
    if (typeof pdfParse !== 'function') {
      console.error('❌ ERROR: pdfParse no es una función después de procesar')
      console.error('📦 pdfParseModule completo:', pdfParseModule)
      console.error('🔑 Claves de pdfParseModule:', Object.keys(pdfParseModule || {}))
      
      // Último intento: verificar todas las propiedades del módulo para encontrar la función
      console.log('🔄 Buscando función en todas las propiedades del módulo...')
      const allProps = Object.getOwnPropertyNames(pdfParseModule)
      console.log('🔍 Todas las propiedades:', allProps)
      
      // Buscar cualquier función que pueda ser la función principal
      for (const prop of allProps) {
        const value = pdfParseModule[prop]
        if (typeof value === 'function' && prop !== 'PDFParse' && !prop.startsWith('_')) {
          console.log(`🔍 Probando propiedad: ${prop}`)
          // Verificar si esta función puede ser la principal
          // La función principal de pdf-parse normalmente acepta un buffer
          try {
            pdfParse = value
            console.log(`✅ Función encontrada en propiedad: ${prop}`)
            break
          } catch (e) {
            // Continuar buscando
          }
        }
      }
      
      // Si aún no encontramos función y existe PDFParse, crear wrapper
      if (typeof pdfParse !== 'function' && pdfParseModule && pdfParseModule.PDFParse) {
        console.log('🔄 Creando wrapper para PDFParse class')
        console.log('🔍 PDFParse tipo:', typeof pdfParseModule.PDFParse)
        
        // Crear wrapper que intente usar PDFParse de diferentes formas
        pdfParse = async (buffer) => {
          try {
            // Método 1: Intentar usar PDFParse como función directa (puede ser callable)
            if (typeof pdfParseModule.PDFParse === 'function') {
              try {
                const result = await pdfParseModule.PDFParse(buffer)
                if (result && (result.text !== undefined || result.numpages !== undefined)) {
                  return result
                }
              } catch (e) {
                console.log('⚠️ PDFParse no es callable directamente, intentando otros métodos...')
              }
            }
            
            // Método 2: Intentar método estático parse
            if (typeof pdfParseModule.PDFParse.parse === 'function') {
              return await pdfParseModule.PDFParse.parse(buffer)
            }
            
            // Método 3: Instanciar la clase y llamar métodos
            const instance = new pdfParseModule.PDFParse(buffer)
            if (typeof instance.parse === 'function') {
              return await instance.parse()
            } else if (typeof instance.getText === 'function') {
              const text = await instance.getText()
              return { text, numpages: 1 }
            } else if (typeof instance === 'function') {
              return await instance()
            }
            
            throw new Error('No se pudo usar PDFParse de ninguna forma conocida')
          } catch (err) {
            console.error('❌ Error en wrapper PDFParse:', err)
            throw new Error(`Error usando PDFParse: ${err.message}`)
          }
        }
        console.log('✅ Wrapper creado para PDFParse class')
      } else if (typeof pdfParse !== 'function') {
        // Si el módulo mismo puede ser callable (aunque sea objeto)
        // Algunos módulos CommonJS tienen esta característica
        try {
          // Verificar si tiene Symbol.toPrimitive o puede ser llamado
          if (typeof pdfParseModule === 'object' && pdfParseModule !== null) {
            // Intentar acceder a la función principal que puede estar oculta
            // En algunos casos, la función está en module.exports directamente
            const moduleExports = pdfParseModule
            if (typeof moduleExports === 'function' || 
                (typeof moduleExports === 'object' && typeof moduleExports.call === 'function')) {
              pdfParse = moduleExports
              console.log('✅ Módulo es callable')
            } else {
              throw new Error(`pdf-parse no se importó como función. Tipo: ${typeof pdfParseModule}. Claves: ${Object.keys(pdfParseModule || {}).join(', ')}`)
            }
          } else {
            throw new Error(`pdf-parse no se importó como función. Tipo: ${typeof pdfParseModule}`)
          }
        } catch (err) {
          throw new Error(`pdf-parse no se importó como función. Tipo: ${typeof pdfParseModule}. Claves: ${Object.keys(pdfParseModule || {}).join(', ')}. Error: ${err.message}`)
        }
      }
    } else {
      console.log('✅ pdfParse verificado como función. Listo para usar.')
    }
    
    pdfParseCache = pdfParse
    return pdfParse
  } catch (error) {
    console.error('❌ Error cargando pdf-parse:', error)
    console.error('📚 Stack:', error.stack)
    throw new Error(`No se pudo cargar pdf-parse: ${error.message}`)
  }
}

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
    
    // Extraer texto estructurado - PRESERVAR estructura completa
    const textResult = await mammoth.extractRawText({ buffer: fileBuffer })
    const fullText = textResult.value // Texto completo preservado (espacios, saltos de línea, puntuación)
    
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

// Función para asociar imágenes a una sección basándose en el contenido
// PRESERVAR: estructura del contenido, asociar imágenes donde se mencionan
function associateImagesToSection(section, content, allImages, startIndex, imageKeywords) {
  const sectionImages = []
  // PRESERVAR: unir contenido manteniendo saltos de línea para análisis
  const fullText = `${section.title} ${content.join('\n')}`.toLowerCase()
  
  // Buscar referencias específicas a imágenes en el texto
  // Ejemplo: "Ver imagen 1", "Figura 2", "Placard 3", etc.
  const imageReferences = []
  imageKeywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\s*(?:\\d+|\\w+)?`, 'gi')
    const matches = fullText.match(regex)
    if (matches) {
      matches.forEach(match => {
        // Extraer número de imagen si existe
        const numberMatch = match.match(/\d+/)
        const imageNumber = numberMatch ? parseInt(numberMatch[0]) : null
        imageReferences.push({ keyword, imageNumber, match })
      })
    }
  })
  
  // Si el contenido menciona imágenes, asociar las disponibles
  const hasImageReference = imageReferences.length > 0 || imageKeywords.some(keyword => fullText.includes(keyword.toLowerCase()))
  
  if (hasImageReference && allImages.length > 0) {
    // Si hay referencias numeradas, intentar asociar por número
    if (imageReferences.length > 0) {
      imageReferences.forEach(ref => {
        if (ref.imageNumber !== null) {
          const imageIndex = (ref.imageNumber - 1) % allImages.length // Convertir número a índice (1-based a 0-based)
          if (imageIndex >= 0 && imageIndex < allImages.length) {
            const img = allImages[imageIndex]
            if (!sectionImages.includes(img)) {
              sectionImages.push(img)
            }
          }
        }
      })
    }
    
    // Si aún no hay imágenes asociadas o hay más referencias, asociar basándose en el índice de inicio
    if (sectionImages.length === 0) {
      const numImagesToAssociate = Math.min(2, allImages.length - startIndex) // Máximo 2 imágenes por sección
      for (let i = 0; i < numImagesToAssociate && (startIndex + i) < allImages.length; i++) {
        const img = allImages[startIndex + i]
        if (!sectionImages.includes(img)) {
          sectionImages.push(img)
        }
      }
    }
  }
  
  return sectionImages
}

// Función inteligente para extraer secciones estructuradas con imágenes asociadas
// PRESERVA: espacios, saltos de línea, puntuación, estructura completa
function extractStructuredSections(fullText, images = []) {
  // Preservar todos los saltos de línea originales
  const allLines = fullText.split(/\r?\n/)
  const sections = []
  
  let currentSection = null
  let currentContent = [] // Array de líneas originales (sin modificar)
  let currentLevel = 1
  let sectionImageIndex = 0 // Índice para distribuir imágenes
  
  // Palabras clave que indican presencia de imágenes
  const imageKeywords = ['imagen', 'image', 'figura', 'figure', 'foto', 'photo', 'gráfico', 'graphic', 'diagrama', 'diagram', 'placa', 'placard', 'evidencia', 'fotostática', 'evidencias fotostáticas']
  
  for (let i = 0; i < allLines.length; i++) {
    const originalLine = allLines[i] // Línea original sin modificar
    const line = originalLine.trim() // Solo para análisis, no para guardar
    const previousLine = i > 0 ? allLines[i - 1].trim() : ''
    const nextLine = i < allLines.length - 1 ? allLines[i + 1].trim() : ''
    
    // Detectar si es un título y su nivel (usando línea procesada para análisis)
    const titleLevel = detectTitleLevel(line, previousLine, nextLine, i, allLines)
    
    if (titleLevel !== null) {
      // Guardar sección anterior si existe
      if (currentSection && (currentContent.length > 0 || currentSection.title)) {
        // Asociar imágenes a esta sección antes de guardarla
        const sectionImages = associateImagesToSection(currentSection, currentContent, images, sectionImageIndex, imageKeywords)
        // PRESERVAR: unir líneas manteniendo saltos de línea originales, sin trim final
        const preservedContent = currentContent.join('\n')
        sections.push({
          ...currentSection,
          content: preservedContent, // Sin .trim() para preservar espacios
          images: sectionImages,
          level: currentLevel
        })
        sectionImageIndex += sectionImages.length
      }
      
      // Crear nueva sección - limpiar título pero preservar estructura
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
      currentContent = [] // Reiniciar con array vacío
    } else if (currentSection) {
      // Agregar contenido a la sección actual - PRESERVAR línea original
      currentContent.push(originalLine) // Guardar línea original completa
      
      // Detectar si esta línea menciona una imagen
      const hasImageReference = imageKeywords.some(keyword => 
        line.toLowerCase().includes(keyword.toLowerCase())
      )
      
      if (hasImageReference && images.length > 0) {
        // Asociar la siguiente imagen disponible a esta sección
        const nextImageIndex = sectionImageIndex % images.length
        if (nextImageIndex < images.length && !currentSection.images.includes(images[nextImageIndex])) {
          currentSection.images.push(images[nextImageIndex])
          sectionImageIndex++
        }
      }
    } else if (line.length > 50) {
      // Si no hay sección actual pero hay contenido, crear una
      currentSection = {
        title: 'Introducción',
        content: originalLine, // Preservar línea original
        images: [],
        level: 1
      }
      currentContent = [originalLine] // Inicializar con la línea original
    } else if (originalLine.length > 0) {
      // Líneas que no son títulos pero tienen contenido - agregar a contenido previo o crear sección
      if (currentSection) {
        currentContent.push(originalLine) // Preservar línea original
      } else {
        // Crear sección para contenido suelto
        currentSection = {
          title: 'Introducción',
          content: '',
          images: [],
          level: 1
        }
        currentContent = [originalLine] // Preservar línea original
      }
    } else {
      // Línea vacía - PRESERVAR para mantener estructura
      if (currentSection) {
        currentContent.push(originalLine) // Preservar línea vacía para mantener saltos de línea
      }
    }
  }
  
  // Agregar última sección
  if (currentSection) {
    const sectionImages = associateImagesToSection(currentSection, currentContent, images, sectionImageIndex, imageKeywords)
    // PRESERVAR: unir líneas manteniendo saltos de línea originales, sin trim final
    const preservedContent = currentContent.join('\n')
    sections.push({
      ...currentSection,
      content: preservedContent, // Sin .trim() para preservar espacios
      images: sectionImages,
      level: currentLevel
    })
  }
  
  // Si no se detectaron secciones, crear una con todo el contenido PRESERVADO
  if (sections.length === 0) {
    // Preservar párrafos completos con sus saltos de línea
    const paragraphs = fullText.split(/\n\s*\n/)
    sections.push(...paragraphs.map((para, idx) => {
      if (para.trim().length > 0) { // Solo crear sección si tiene contenido
        const paraImages = images.length > 0 ? [images[idx % images.length]] : []
        return {
          title: `Sección ${idx + 1}`,
          content: para, // PRESERVAR: sin .trim() para mantener espacios y saltos de línea
          images: paraImages,
          level: 1
        }
      }
      return null
    }).filter(Boolean))
  }
  
  // Distribuir imágenes restantes entre secciones que no tienen imágenes
  const sectionsWithoutImages = sections.filter(s => s.images.length === 0)
  if (sectionsWithoutImages.length > 0 && images.length > 0) {
    images.forEach((img, idx) => {
      // Solo agregar si la imagen no está ya asociada
      const isAlreadyAssociated = sections.some(s => s.images.includes(img))
      if (!isAlreadyAssociated) {
        const targetSection = sectionsWithoutImages[idx % sectionsWithoutImages.length]
        if (targetSection) {
          targetSection.images.push(img)
        }
      }
    })
  }
  
  return { sections, allImages: images }
}

// Extraer imágenes del PDF usando pdf-lib
async function extractImagesFromPDF(fileBuffer) {
  const extractedImages = []
  const imagesDir = path.join(__dirname, '..', '..', 'public', 'images')
  await fs.mkdir(imagesDir, { recursive: true })
  
  try {
    console.log('🖼️  Iniciando extracción de imágenes del PDF...')
    
    // Cargar el documento PDF
    const pdfDoc = await PDFDocument.load(fileBuffer)
    const pages = pdfDoc.getPages()
    
    console.log(`📄 PDF tiene ${pages.length} páginas`)
    
    // Obtener todas las imágenes embebidas en el PDF
    const imageRefs = pdfDoc.context.enumerateIndirectObjects()
    let imageIndex = 0
    
    for (const [ref, object] of imageRefs) {
      try {
        // Verificar si es un objeto de imagen (XObject con Subtype = Image)
        if (object && object.dict && object.dict.get('Subtype')?.name === 'Image') {
          const imageDict = object.dict
          const width = imageDict.get('Width')
          const height = imageDict.get('Height')
          const filter = imageDict.get('Filter')
          
          // Obtener los datos de la imagen
          const imageData = object.dict.get('stream')?.getBytes() || 
                           object.dict.get('stream')?.content || 
                           object.dict.get('stream')
          
          if (imageData && width && height) {
            // Determinar el formato basado en el filtro
            let extension = 'png'
            let mimeType = 'image/png'
            
            if (filter) {
              const filterName = Array.isArray(filter) ? filter[0]?.name : filter?.name
              if (filterName === 'DCTDecode' || filterName === 'JPXDecode') {
                extension = 'jpg'
                mimeType = 'image/jpeg'
              }
            }
            
            // Convertir a Buffer si es necesario
            let imageBuffer = imageData
            if (imageData instanceof Uint8Array) {
              imageBuffer = Buffer.from(imageData)
            } else if (typeof imageData === 'string') {
              imageBuffer = Buffer.from(imageData, 'base64')
            }
            
            // Guardar la imagen
            const timestamp = Date.now()
            imageIndex++
            const imageFilename = `pdf-${timestamp}-img${imageIndex}.${extension}`
            const imagePath = path.join(imagesDir, imageFilename)
            
            await fs.writeFile(imagePath, imageBuffer)
            
            // URL relativa para el frontend (el backend sirve en /images/)
            // En producción, usar la URL del backend de Koyeb
            const backendUrl = process.env.BACKEND_URL || process.env.KOYEB_URL || 'http://localhost:3001'
            const imageUrl = `${backendUrl}/images/${imageFilename}`
            extractedImages.push(imageUrl)
            
            console.log(`✅ Imagen extraída: ${imageFilename} (${width}x${height}, ${(imageBuffer.length / 1024).toFixed(2)} KB)`)
          }
        }
      } catch (imgError) {
        console.log(`⚠️  Error procesando objeto de imagen ${ref}:`, imgError.message)
        // Continuar con la siguiente imagen
      }
    }
    
    console.log(`✅ Total de imágenes extraídas: ${extractedImages.length}`)
    return extractedImages
  } catch (error) {
    console.error('❌ Error extrayendo imágenes del PDF:', error.message)
    console.error('📚 Stack:', error.stack)
    return []
  }
}

// Extraer contenido de PDF con detección inteligente e imágenes
async function extractFromPDF(fileBuffer) {
  try {
    // Obtener pdfParse de forma lazy
    const pdfParse = getPdfParse()
    
    // Verificar que pdfParse sea una función antes de usarla
    if (typeof pdfParse !== 'function') {
      console.error('❌ pdfParse no es una función. Tipo:', typeof pdfParse)
      console.error('📦 pdfParse value:', pdfParse)
      throw new Error('pdf-parse no está disponible correctamente. Tipo: ' + typeof pdfParse)
    }
    
    console.log('📄 Llamando a pdfParse con buffer de tamaño:', fileBuffer.length)
    console.log('🔍 Tipo de pdfParse:', typeof pdfParse)
    
    // Extraer texto
    const data = await pdfParse(fileBuffer)
    const fullText = data.text
    const numPages = data.numpages || 1
    
    console.log(`✅ PDF procesado: ${numPages} páginas, ${fullText.length} caracteres`)
    
    // Extraer imágenes del PDF
    const extractedImages = await extractImagesFromPDF(fileBuffer)
    
    // Extraer secciones con asociación inteligente de imágenes
    const result = extractStructuredSections(fullText, extractedImages)
    
    // Asegurar que las imágenes extraídas estén en allImages
    result.allImages = extractedImages
    
    return result
  } catch (error) {
    console.error('❌ Error extrayendo PDF:', error)
    console.error('📚 Stack:', error.stack)
    console.error('🔍 Tipo de pdfParse:', typeof pdfParse)
    
    // Intentar extraer solo texto como fallback
    try {
      const pdfParse = getPdfParse()
      if (typeof pdfParse === 'function') {
        console.log('🔄 Intentando fallback con pdfParse...')
        const data = await pdfParse(fileBuffer)
        const fullText = data.text
        const sections = extractStructuredSections(fullText, [])
        return { sections, allImages: [] }
      } else {
        throw new Error('pdfParse no es una función en el fallback')
      }
    } catch (fallbackError) {
      console.error('❌ Error en fallback:', fallbackError)
      return {
        sections: [{
          title: 'Error',
          content: `No se pudo procesar el archivo PDF: ${error.message || 'Error desconocido'}`,
          images: [],
          level: 1
        }],
        allImages: []
      }
    }
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
        console.log('Iniciando procesamiento de PDF...')
        const extracted = await extractFromPDF(fileBuffer)
        console.log('PDF procesado, estructura:', extracted)
        
        // Asegurar que extracted tiene la estructura correcta
        if (Array.isArray(extracted)) {
          sections = extracted
          allImages = []
        } else if (extracted && extracted.sections) {
          sections = extracted.sections
          allImages = extracted.allImages || []
        } else if (extracted && extracted.title) {
          // Es una sección única
          sections = [extracted]
          allImages = []
        } else {
          console.error('Estructura inesperada del PDF:', extracted)
          sections = []
          allImages = []
        }
        
        console.log(`Secciones extraídas: ${sections.length}, Imágenes: ${allImages.length}`)
      } catch (pdfError) {
        console.error('Error específico procesando PDF:', pdfError)
        console.error('Stack:', pdfError.stack)
        return res.status(400).json({
          error: 'Error al procesar el archivo PDF',
          details: pdfError.message || 'Error desconocido',
          hint: 'Asegúrate de que el PDF contenga texto (no sea solo imágenes escaneadas)',
          fileName: req.file.originalname
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

    // Crear widgets con información de nivel jerárquico e imágenes asociadas
    // PRESERVAR: estructura completa del contenido (espacios, puntuación, saltos de línea)
    const widgets = categorizedSections.map((section, index) => {
      // PRESERVAR: contenido completo sin cortar ni modificar
      const fullContent = section.content || ''
      
      // Preview: primeros 150 caracteres SIN modificar (preservar espacios, puntuación)
      const preview = fullContent.length > 150 
        ? fullContent.substring(0, 150) + '...' 
        : fullContent
      
      // Description: contenido completo preservado (sin límite artificial)
      const description = fullContent
      
      // AdditionalInfo: undefined (todo el contenido va en description para preservar estructura)
      const additionalInfo = undefined

      // Asegurar que las imágenes estén correctamente asociadas
      const sectionImages = Array.isArray(section.images) ? section.images : []
      
      // Si la sección menciona imágenes pero no tiene asociadas, intentar asociar alguna
      const contentLower = `${section.title} ${section.content}`.toLowerCase()
      const imageKeywords = ['imagen', 'image', 'figura', 'figure', 'foto', 'photo', 'gráfico', 'graphic', 'diagrama', 'diagram', 'placa', 'placard', 'evidencia', 'fotostática']
      const mentionsImages = imageKeywords.some(keyword => contentLower.includes(keyword))
      
      // Si menciona imágenes pero no tiene, asociar una de las disponibles
      if (mentionsImages && sectionImages.length === 0 && allImages.length > 0) {
        const imageIndex = index % allImages.length
        sectionImages.push(allImages[imageIndex])
      }

      return {
        title: section.title || `Sección ${index + 1}`,
        preview, // Preview preservado
        description, // Descripción completa preservada (espacios, saltos de línea, puntuación)
        additionalInfo, // Sin información adicional (todo en description)
        category: section.category,
        images: sectionImages, // Imágenes específicas de esta sección, correctamente asociadas
        order: index,
        level: section.level || 1, // Nivel jerárquico (1=título, 2=subtítulo, 3=sub-subtítulo)
        displayMode: 'resumen' // Por defecto mostrar resumen, el admin puede cambiarlo a 'completo'
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
