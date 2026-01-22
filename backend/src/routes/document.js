import express from 'express'
import multer from 'multer'
import mammoth from 'mammoth'
import * as XLSX from 'xlsx'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'
import { PDFDocument } from 'pdf-lib'
import AdmZip from 'adm-zip'
import { parseStringPromise } from 'xml2js'
import logger from '../utils/logger.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// pdf-parse es CommonJS, necesitamos usar createRequire
const require = createRequire(import.meta.url)

// Función helper para obtener la URL del backend
function getBackendUrl(req) {
  // Prioridad 1: Variables de entorno explícitas
  if (process.env.BACKEND_URL) {
    return process.env.BACKEND_URL
  }
  if (process.env.KOYEB_URL) {
    return process.env.KOYEB_URL
  }
  
  // Prioridad 2: Detectar protocolo desde headers de proxy (Koyeb, Vercel, etc.)
  if (req) {
    // Detectar HTTPS desde headers de proxy
    const protocol = req.get('X-Forwarded-Proto') || 
                     (req.secure ? 'https' : 'http') ||
                     req.protocol
    
    // En producción, forzar HTTPS si no está explícitamente configurado
    const isProduction = process.env.NODE_ENV === 'production'
    const finalProtocol = (isProduction && protocol === 'http') ? 'https' : protocol
    
    const host = req.get('host') || req.get('X-Forwarded-Host')
    
    if (host) {
      return `${finalProtocol}://${host}`
    }
  }
  
  // Fallback: desarrollo local
  return 'http://localhost:3001'
}

// Importar pdf-parse de forma segura - función lazy para evitar errores al iniciar
let pdfParseCache = null

function getPdfParse() {
  if (pdfParseCache !== null) {
    return pdfParseCache
  }
  
  try {
    const pdfParseModule = require('pdf-parse')
    logger.debug('📦 pdf-parse cargado. Tipo:', typeof pdfParseModule)
    logger.debug('🔑 Claves disponibles:', Object.keys(pdfParseModule || {}))
    
    // pdf-parse puede exportarse de diferentes formas dependiendo de la versión
    let pdfParse
    
    // Verificar si es función directa (versiones antiguas)
    if (typeof pdfParseModule === 'function') {
      pdfParse = pdfParseModule
      logger.debug('✅ pdfParse asignado como función directa')
    } 
    // Verificar si tiene .default (ES modules)
    else if (pdfParseModule && typeof pdfParseModule.default === 'function') {
      pdfParse = pdfParseModule.default
      logger.debug('✅ pdfParse asignado desde .default')
    } 
    // Verificar si tiene PDFParse (clase en versiones nuevas)
    else if (pdfParseModule && pdfParseModule.PDFParse && typeof pdfParseModule.PDFParse === 'function') {
      // PDFParse es una clase, necesitamos instanciarla o usar su método estático
      // En versiones nuevas, puede tener un método estático o necesitar instanciación
      if (typeof pdfParseModule.PDFParse.parse === 'function') {
        pdfParse = pdfParseModule.PDFParse.parse.bind(pdfParseModule.PDFParse)
        logger.debug('✅ pdfParse asignado desde PDFParse.parse (método estático)')
      } else {
        // Intentar usar la clase directamente si tiene un método callable
        pdfParse = pdfParseModule.PDFParse
        logger.debug('✅ pdfParse asignado desde PDFParse (clase)')
      }
    }
    // Verificar si tiene pdfParse (camelCase)
    else if (pdfParseModule && typeof pdfParseModule.pdfParse === 'function') {
      pdfParse = pdfParseModule.pdfParse
      logger.debug('✅ pdfParse asignado desde .pdfParse')
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
        logger.debug(`✅ pdfParse asignado desde .${functionKeys[0]}`)
      } else {
        // Si no encontramos función, intentar usar el módulo completo
        // Algunas versiones de pdf-parse exportan el módulo completo como función
        pdfParse = pdfParseModule
        logger.debug('⚠️ pdfParse asignado directamente (puede no ser función)')
      }
    }
    
    logger.debug('📊 pdfParse final. Tipo:', typeof pdfParse)
    
    // Verificar que sea una función o una clase instanciable
    if (typeof pdfParse !== 'function') {
      logger.error('❌ ERROR: pdfParse no es una función después de procesar')
      logger.error('📦 pdfParseModule completo:', pdfParseModule)
      logger.error('🔑 Claves de pdfParseModule:', Object.keys(pdfParseModule || {}))
      
      // Último intento: verificar todas las propiedades del módulo para encontrar la función
      logger.debug('🔄 Buscando función en todas las propiedades del módulo...')
      const allProps = Object.getOwnPropertyNames(pdfParseModule)
      logger.debug('🔍 Todas las propiedades:', allProps)
      
      // Buscar cualquier función que pueda ser la función principal
      for (const prop of allProps) {
        const value = pdfParseModule[prop]
        if (typeof value === 'function' && prop !== 'PDFParse' && !prop.startsWith('_')) {
          logger.debug(`🔍 Probando propiedad: ${prop}`)
          // Verificar si esta función puede ser la principal
          // La función principal de pdf-parse normalmente acepta un buffer
          try {
            pdfParse = value
            logger.debug(`✅ Función encontrada en propiedad: ${prop}`)
            break
          } catch (e) {
            // Continuar buscando
          }
        }
      }
      
      // Si aún no encontramos función y existe PDFParse, crear wrapper
      if (typeof pdfParse !== 'function' && pdfParseModule && pdfParseModule.PDFParse) {
        logger.debug('🔄 Creando wrapper para PDFParse class')
        logger.debug('🔍 PDFParse tipo:', typeof pdfParseModule.PDFParse)
        
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
                logger.debug('⚠️ PDFParse no es callable directamente, intentando otros métodos...')
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
            logger.error('❌ Error en wrapper PDFParse:', err)
            throw new Error(`Error usando PDFParse: ${err.message}`)
          }
        }
        logger.debug('✅ Wrapper creado para PDFParse class')
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
              logger.debug('✅ Módulo es callable')
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
      logger.debug('✅ pdfParse verificado como función. Listo para usar.')
    }
    
    pdfParseCache = pdfParse
    return pdfParse
  } catch (error) {
    logger.error('❌ Error cargando pdf-parse:', error)
    logger.error('📚 Stack:', error.stack)
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
  
  // Patrones específicos para títulos de documentos técnicos
  // Nivel 1: Títulos principales (Capítulo, Anexo, Introducción, etc.)
  const isLevel1 = (
    // "Capítulo X. Título" o "Anexo X. Título"
    /^(CAPÍTULO|CAPITULO|ANEXO|ANEXO)\s+\d+[\.\)]\s+[A-ZÁÉÍÓÚÑ]/.test(trimmed) ||
    // "Capítulo X" seguido de título en la misma línea
    /^(CAPÍTULO|CAPITULO|ANEXO)\s+\d+/.test(trimmed) ||
    // Todo mayúsculas y corto
    (/^[A-ZÁÉÍÓÚÑ\s]{3,50}$/.test(trimmed) && trimmed.length < 50) ||
    // Título seguido de dos puntos al final
    (trimmed.endsWith(':') && length < 60 && /^[A-ZÁÉÍÓÚÑ]/.test(trimmed)) ||
    // Títulos comunes de documentos técnicos
    /^(INFORME|ANÁLISIS|CONCLUSIÓN|RECOMENDACIÓN|OBSERVACIONES|INTRODUCCIÓN|RESUMEN|OBJETIVO|METODOLOGÍA|RESULTADOS|DISCUSIÓN|DECLARACIÓN|REGISTRO)$/i.test(trimmed) ||
    // Números romanos seguidos de título
    /^[IVX]+[\.\)]\s+[A-ZÁÉÍÓÚÑ]/.test(trimmed)
  )
  
  // Nivel 2: Subtítulos (medianos, pueden tener números como "1.1", "2.3", etc.)
  // IMPORTANTE: NO crear widgets separados para estos, son parte del contenido del capítulo
  const isLevel2 = (
    // Número.Número seguido de punto y texto (ej: "1.1 Prioridad", "2.3 Procesos")
    /^\d+\.\d+\s+[A-ZÁÉÍÓÚÑ]/.test(trimmed) ||
    // Número seguido de punto y texto (pero NO si es "Capítulo X" o "Anexo X")
    (/^\d+[\.\)]\s+[A-ZÁÉÍÓÚÑ]/.test(trimmed) && !/^(CAPÍTULO|CAPITULO|ANEXO)\s+\d+/i.test(trimmed)) ||
    // Letra seguida de punto y texto
    /^[a-z][\.\)]\s+[A-ZÁÉÍÓÚÑ]/.test(trimmed) ||
    // Título en mayúsculas pero más largo
    (/^[A-ZÁÉÍÓÚÑ]/.test(trimmed) && length > 20 && length < 80 && !trimmed.includes('.'))
  )
  
  // Nivel 3: Sub-subtítulos (viñetas, guiones, letras minúsculas)
  const isLevel3 = (
    /^[•\-\*]\s+[A-ZÁÉÍÓÚÑ]/.test(trimmed) ||
    /^[a-z]\)\s+[A-ZÁÉÍÓÚÑ]/.test(trimmed) ||
    // Número.Número.Número (ej: "1.1.1")
    /^\d+\.\d+\.\d+\s+[A-ZÁÉÍÓÚÑ]/.test(trimmed)
  )
  
  // Contexto adicional: verificar si la línea siguiente es contenido
  const hasContentAfter = nextLine && nextLine.trim().length > 20
  const hasTitleBefore = previousLine && (
    /^[A-ZÁÉÍÓÚÑ]/.test(previousLine.trim()) ||
    previousLine.trim().length < 30
  )
  
  // Si detecta "Capítulo" o "Anexo", siempre es nivel 1 (crea widget separado)
  if (/^(CAPÍTULO|CAPITULO|ANEXO)\s+\d+/i.test(trimmed)) {
    return 1
  }
  
  // Títulos principales (nivel 1) crean widgets separados
  if (isLevel1 && hasContentAfter) return 1
  
  // Subtítulos (nivel 2 y 3) NO crean widgets separados, son parte del contenido
  // Retornar null para que se agreguen al contenido de la sección actual
  if (isLevel2 && hasContentAfter) return null // NO crear widget, agregar al contenido
  if (isLevel3 && hasContentAfter) return null // NO crear widget, agregar al contenido
  
  // Si no cumple criterios estrictos pero parece título por contexto
  if (length < 100 && length > 5 && /^[A-ZÁÉÍÓÚÑ]/.test(trimmed) && hasContentAfter && !hasTitleBefore) {
    return 2 // Asumir nivel 2 por defecto
  }
  
  return null // No es un título
}

// Extraer contenido estructurado de Word con detección inteligente e imágenes
async function extractStructuredContentFromWord(fileBuffer, req = null) {
  try {
    logger.debug('📄 Procesando archivo Word...')
    
    // Extraer imágenes del archivo Word (método 1: desde HTML de mammoth)
    const htmlResult = await mammoth.convertToHtml({ buffer: fileBuffer })
    const html = htmlResult.value
    
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
          
          const imageName = `word-${Date.now()}-${i}.${ext}`
          const imagePath = path.join(imagesDir, imageName)
          await fs.writeFile(imagePath, imageBuffer)
          
          const backendUrl = getBackendUrl(req)
          images.push(`${backendUrl}/images/${imageName}`)
        }
      }
    }
    
    // Método 2: Extraer imágenes directamente del ZIP (más confiable)
    const zipImages = await extractImagesFromDocx(fileBuffer, req)
    // Combinar ambas listas, eliminando duplicados
    const allImages = [...new Set([...images, ...zipImages])]
    
    // Extraer texto estructurado - PRESERVAR estructura completa
    const textResult = await mammoth.extractRawText({ buffer: fileBuffer })
    const fullText = textResult.value // Texto completo preservado (espacios, saltos de línea, puntuación)
    
    logger.debug(`✅ Word procesado: ${fullText.length} caracteres, ${allImages.length} imágenes`)
    logger.debug(`🖼️  Imágenes extraídas en orden: ${allImages.map((img, idx) => `Imagen ${idx + 1}`).join(', ')}`)
    
    // Extraer secciones con imágenes insertadas inline donde se mencionen
    const result = extractStructuredSections(fullText, allImages)
    
    // Agregar número de sección a cada sección para mantener orden (Word)
    result.sections = result.sections.map((section, index) => ({
      ...section,
      sectionNumber: index + 1 // Número de sección (1-based) para mantener orden
    }))
    
    logger.debug(`📊 Secciones extraídas: ${result.sections.length}, Imágenes totales: ${allImages.length}`)
    
    return result
  } catch (error) {
    logger.error('Error extrayendo contenido Word:', error)
    try {
      const textResult = await mammoth.extractRawText({ buffer: fileBuffer })
      // Intentar extraer imágenes del ZIP como fallback
      const zipImages = await extractImagesFromDocx(fileBuffer, req)
      return {
        sections: [{
          title: 'Contenido Extraído',
          content: textResult.value, // PRESERVAR estructura
          images: zipImages,
          level: 1
        }],
        allImages: zipImages
      }
    } catch (fallbackError) {
      return {
        sections: [{
          title: 'Error',
          content: `No se pudo procesar el archivo Word: ${error.message}`,
          images: [],
          level: 1
        }],
        allImages: []
      }
    }
  }
}

// Función para asociar imágenes a una sección basándose en el contenido
// PRESERVAR: estructura del contenido, asociar imágenes donde se mencionan
function associateImagesToSection(section, content, allImages, startIndex, imageKeywords, usedImages = new Set()) {
  const sectionImages = []
  // PRESERVAR: unir contenido manteniendo saltos de línea para análisis
  const fullText = `${section.title} ${content.join('\n')}`.toLowerCase()
  
  // Buscar referencias específicas a imágenes en el texto
  // Ejemplo: "Ver imagen 1", "Figura 2", "Placard 3", "imagen siguiente", etc.
  const imageReferences = []
  imageKeywords.forEach(keyword => {
    // Patrones más específicos: "imagen 1", "figura 2", "placard 3", "imagen siguiente", etc.
    const patterns = [
      new RegExp(`\\b${keyword}\\s+(?:número|num|#|nro\\.?)?\\s*(\\d+)`, 'gi'), // "imagen número 1", "figura #2"
      new RegExp(`\\b${keyword}\\s+(\\d+)`, 'gi'), // "imagen 1", "figura 2"
      new RegExp(`(?:ver|ver\\s+la|ver\\s+el|ver\\s+en)\\s+${keyword}\\s+(?:número|num|#|nro\\.?)?\\s*(\\d+)`, 'gi'), // "ver imagen 1"
      new RegExp(`\\b${keyword}\\s+(?:siguiente|anterior|mostrada|adjunta|incluida)`, 'gi'), // "imagen siguiente"
    ]
    
    patterns.forEach((regex, patternIndex) => {
      const matches = fullText.matchAll(regex)
      for (const match of matches) {
        const imageNumber = match[1] ? parseInt(match[1]) : null
        const position = match.index || 0
        imageReferences.push({ 
          keyword, 
          imageNumber, 
          match: match[0],
          position,
          patternIndex // Prioridad: patrones más específicos primero
        })
      }
    })
  })
  
  // Ordenar referencias por posición en el texto (primero las que aparecen antes)
  imageReferences.sort((a, b) => a.position - b.position)
  
  // Si el contenido menciona imágenes, asociar las disponibles
  const hasImageReference = imageReferences.length > 0 || imageKeywords.some(keyword => fullText.includes(keyword.toLowerCase()))
  
  if (hasImageReference && allImages.length > 0) {
    // Si hay referencias numeradas, intentar asociar por número (más preciso)
    if (imageReferences.length > 0) {
      imageReferences.forEach(ref => {
        if (ref.imageNumber !== null) {
          // Usar el número exacto si está disponible
          const imageIndex = ref.imageNumber - 1 // Convertir número a índice (1-based a 0-based)
          if (imageIndex >= 0 && imageIndex < allImages.length) {
            const img = allImages[imageIndex]
            // Solo agregar si no está ya usada y no está ya en la sección
            if (!usedImages.has(img) && !sectionImages.includes(img)) {
              sectionImages.push(img)
              usedImages.add(img)
            }
          }
        } else if (ref.match.toLowerCase().includes('siguiente') || ref.match.toLowerCase().includes('adjunta')) {
          // Para "imagen siguiente" o "imagen adjunta", usar la siguiente disponible
          const nextAvailableIndex = allImages.findIndex(img => !usedImages.has(img) && !sectionImages.includes(img))
          if (nextAvailableIndex >= 0) {
            const img = allImages[nextAvailableIndex]
            sectionImages.push(img)
            usedImages.add(img)
          }
        }
      })
    }
    
    // Si aún no hay imágenes asociadas, usar el índice de inicio (distribución secuencial)
    if (sectionImages.length === 0 && allImages.length > 0) {
      // Buscar la primera imagen disponible desde startIndex
      let found = 0
      const maxImages = Math.min(2, allImages.length) // Máximo 2 imágenes por sección
      
      for (let i = startIndex; i < allImages.length && found < maxImages; i++) {
        const img = allImages[i]
        if (!usedImages.has(img) && !sectionImages.includes(img)) {
          sectionImages.push(img)
          usedImages.add(img)
          found++
        }
      }
      
      // Si no encontramos desde startIndex, buscar desde el inicio
      if (found === 0) {
        for (let i = 0; i < allImages.length && found < maxImages; i++) {
          const img = allImages[i]
          if (!usedImages.has(img) && !sectionImages.includes(img)) {
            sectionImages.push(img)
            usedImages.add(img)
            found++
          }
        }
      }
    }
  }
  
  return { images: sectionImages, usedImages }
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
  const usedImages = new Set() // Rastrear imágenes ya usadas para evitar duplicados
  
  // Palabras clave que indican presencia de imágenes
  const imageKeywords = ['imagen', 'image', 'figura', 'figure', 'foto', 'photo', 'gráfico', 'graphic', 'diagrama', 'diagram', 'placa', 'placard', 'evidencia', 'fotostática', 'evidencias fotostáticas', 'fotografía', 'photography', 'ilustración', 'illustration']
  
  for (let i = 0; i < allLines.length; i++) {
    const originalLine = allLines[i] // Línea original sin modificar
    const line = originalLine.trim() // Solo para análisis, no para guardar
    const previousLine = i > 0 ? allLines[i - 1].trim() : ''
    const nextLine = i < allLines.length - 1 ? allLines[i + 1].trim() : ''
    
    // Detectar si es un título y su nivel (usando línea procesada para análisis)
    const titleLevel = detectTitleLevel(line, previousLine, nextLine, i, allLines)
    
    // Si es un título principal (nivel 1), crear nueva sección
    // Si es subtítulo (nivel 2 o 3), agregarlo al contenido de la sección actual
    if (titleLevel === 1) {
      // Guardar sección anterior si existe y tiene contenido o título válido
      if (currentSection) {
        // PRESERVAR: unir líneas manteniendo saltos de línea originales
        const preservedContent = currentContent.join('\n').trim()
        
        // Solo guardar sección si tiene contenido o si es la primera sección (para no perder títulos importantes)
        if (preservedContent.length > 0 || sections.length === 0 || currentSection.title) {
          sections.push({
            ...currentSection,
            content: preservedContent || currentSection.title, // Si no hay contenido, usar al menos el título
            images: currentSection.images, // Mantener referencia a imágenes para compatibilidad
            level: currentLevel
          })
          sectionImageIndex += currentSection.images.length
        }
      }
      
      // Crear nueva sección - limpiar título pero preservar estructura importante
      let cleanTitle = line.trim()
      
      // Si es "Capítulo X" o "Anexo X", mantenerlo completo
      if (/^(CAPÍTULO|CAPITULO|ANEXO)\s+\d+/i.test(cleanTitle)) {
        // Mantener "Capítulo X. Título" completo, solo quitar dos puntos finales si existen
        cleanTitle = cleanTitle.replace(/:$/, '').trim()
      } else {
        // Para otros títulos, limpiar formato pero mantener contenido
        cleanTitle = cleanTitle
          .replace(/^##?\s+/, '') // Markdown
          .replace(/^[\d•\-\*IVX\.\)\s]+/, '') // Números/viñetas al inicio (pero no "Capítulo X")
          .replace(/:$/, '') // Dos puntos finales
          .trim()
      }
      
      currentSection = {
        title: cleanTitle || `Sección ${sections.length + 1}`,
        content: '',
        images: [],
        level: titleLevel
      }
      currentLevel = titleLevel
      currentContent = [] // Reiniciar con array vacío
    } else if (titleLevel === 2 || titleLevel === 3) {
      // Subtítulos (nivel 2 o 3): agregar al contenido de la sección actual como parte del texto
      // Preservar formato del subtítulo en el contenido
      if (currentSection) {
        currentContent.push(originalLine) // Agregar el subtítulo como parte del contenido
      }
    } else if (currentSection) {
      // Agregar contenido a la sección actual - PRESERVAR línea original
      // IMPORTANTE: Agregar TODAS las líneas que no son títulos al contenido
      currentContent.push(originalLine) // Siempre agregar la línea (incluso si está vacía)
      
      // Detectar referencias precisas a imágenes en esta línea (solo si la línea tiene contenido)
      const lineLower = line.toLowerCase()
      const imageReferences = []
      
      // Buscar referencias numeradas específicas: "imagen 1", "figura 2", "placard 3", etc.
      imageKeywords.forEach(keyword => {
        // Patrón 1: "imagen 1", "figura 2", "placard 3"
        const numberPattern = new RegExp(`\\b${keyword}\\s+(\\d+)`, 'gi')
        const numberMatches = [...lineLower.matchAll(numberPattern)]
        numberMatches.forEach(match => {
          const imageNumber = parseInt(match[1])
          const position = match.index || 0
          imageReferences.push({
            type: 'numbered',
            number: imageNumber,
            position: position + currentContent.length, // Posición en el contenido completo
            keyword: match[0]
          })
        })
        
        // Patrón 2: Referencias contextuales más complejas
        const contextualPatterns = [
          new RegExp(`(?:en|de)\\s+la\\s+${keyword}\\s+(?:siguiente|adjunta|mostrada|incluida)`, 'gi'), // "en la imagen siguiente"
          new RegExp(`${keyword}\\s+(?:siguiente|adjunta|mostrada|incluida|arriba|abajo)`, 'gi'), // "imagen siguiente"
          new RegExp(`(?:ver|ver\\s+la|ver\\s+el|ver\\s+en)\\s+${keyword}`, 'gi'), // "ver imagen"
          new RegExp(`(?:se\\s+puede\\s+ver|se\\s+muestra|se\\s+observa|se\\s+determina)\\s+(?:en|en\\s+la)\\s+${keyword}`, 'gi'), // "se puede ver en la imagen"
          new RegExp(`${keyword}\\s+(?:se\\s+muestra|se\\s+observa|se\\s+puede\\s+ver)`, 'gi'), // "imagen se muestra"
        ]
        
        contextualPatterns.forEach((pattern, patternIdx) => {
          const contextualMatches = [...lineLower.matchAll(pattern)]
          contextualMatches.forEach(match => {
            imageReferences.push({
              type: 'contextual',
              position: match.index || 0,
              keyword: match[0],
              patternPriority: patternIdx // Prioridad del patrón (más específico primero)
            })
          })
        })
      })
      
      // Si hay referencias, insertar imágenes en el orden correcto y posición exacta
      if (imageReferences.length > 0 && images.length > 0) {
        // Ordenar referencias: primero por posición, luego por prioridad del patrón
        imageReferences.sort((a, b) => {
          if (a.position !== b.position) {
            return a.position - b.position // Primero por posición
          }
          return (a.patternPriority || 999) - (b.patternPriority || 999) // Luego por prioridad
        })
        
        // Procesar referencias en orden inverso para insertar desde el final hacia el inicio
        // Esto evita problemas con índices al modificar la línea
        const sortedRefs = [...imageReferences].reverse()
        
        let modifiedLine = originalLine
        
        sortedRefs.forEach(ref => {
          let imageToInsert = null
          
          if (ref.type === 'numbered' && ref.number) {
            // Referencia numerada: usar el número exacto (1-based a 0-based)
            const imageIndex = ref.number - 1
            if (imageIndex >= 0 && imageIndex < images.length) {
              imageToInsert = images[imageIndex]
              logger.debug(`📍 Referencia numerada: "${ref.keyword}" → Imagen ${ref.number} (índice ${imageIndex})`)
            }
          } else if (ref.type === 'contextual') {
            // Referencia contextual: usar la siguiente imagen disponible en orden secuencial
            // Buscar desde el índice actual de la sección para mantener orden
            let searchIndex = sectionImageIndex
            let found = false
            
            // Buscar desde índice actual
            while (searchIndex < images.length && !found) {
              if (!usedImages.has(images[searchIndex]) && !currentSection.images.includes(images[searchIndex])) {
                imageToInsert = images[searchIndex]
                found = true
                logger.debug(`📍 Referencia contextual: "${ref.keyword}" → Imagen siguiente (índice ${searchIndex})`)
              }
              searchIndex++
            }
            
            // Si no se encontró, buscar desde el inicio
            if (!found) {
              for (let i = 0; i < images.length && !found; i++) {
                if (!usedImages.has(images[i]) && !currentSection.images.includes(images[i])) {
                  imageToInsert = images[i]
                  found = true
                  logger.debug(`📍 Referencia contextual: "${ref.keyword}" → Imagen siguiente (índice ${i}, desde inicio)`)
                }
              }
            }
          }
          
          // Insertar imagen si se encontró una y no está ya usada
          if (imageToInsert && !usedImages.has(imageToInsert)) {
            // Buscar la referencia en la línea modificada (puede haber cambiado por referencias anteriores)
            const lineLower = modifiedLine.toLowerCase()
            const refPosition = lineLower.indexOf(ref.keyword.toLowerCase())
            
            if (refPosition !== -1) {
              // Insertar imagen justo después de la referencia en la línea
              const beforeRef = modifiedLine.substring(0, refPosition + ref.keyword.length)
              const afterRef = modifiedLine.substring(refPosition + ref.keyword.length)
              
              // Insertar imagen después de la referencia, con espacios apropiados
              modifiedLine = beforeRef + '\n\n<img src="' + imageToInsert + '" alt="Imagen" style="max-width: 100%; height: auto; margin: 1rem 0; border-radius: 8px; display: block;" />\n\n' + afterRef
            } else {
              // Si no se encuentra la referencia exacta, insertar al final de la línea
              modifiedLine = modifiedLine + '\n\n<img src="' + imageToInsert + '" alt="Imagen" style="max-width: 100%; height: auto; margin: 1rem 0; border-radius: 8px; display: block;" />\n\n'
            }
            
            currentSection.images.push(imageToInsert)
            usedImages.add(imageToInsert)
            sectionImageIndex++
            logger.debug(`✅ Imagen insertada inline después de: "${ref.keyword}"`)
          }
        })
        
        // Actualizar la última línea del contenido con las imágenes insertadas
        if (modifiedLine !== originalLine) {
          currentContent[currentContent.length - 1] = modifiedLine
        }
      }
    } else {
      // Si no hay sección actual, crear una para contenido suelto
      if (!currentSection) {
        currentSection = {
          title: 'Introducción',
          content: '',
          images: [],
          level: 1
        }
        currentContent = []
      }
      // Agregar línea al contenido (incluso si está vacía para preservar estructura)
      currentContent.push(originalLine)
    }
  }
  
  // Agregar última sección
  if (currentSection) {
    // PRESERVAR: unir líneas manteniendo saltos de línea originales
    let preservedContent = currentContent.join('\n').trim()
    
    // Si hay imágenes asociadas a esta sección que no están insertadas inline, agregarlas al final
    if (currentSection.images.length > 0) {
      const imagesInContent = (preservedContent.match(/<img\s+src=/gi) || []).length
      const imagesToAdd = currentSection.images.slice(imagesInContent)
      
      if (imagesToAdd.length > 0) {
        const imagesHTML = imagesToAdd.map(img => 
          `\n\n<img src="${img}" alt="Imagen" style="max-width: 100%; height: auto; margin: 1rem 0; border-radius: 8px; display: block;" />\n\n`
        ).join('')
        preservedContent = preservedContent + imagesHTML
      }
    }
    
    // Solo guardar si tiene contenido o título válido
    if (preservedContent.length > 0 || currentSection.title) {
      sections.push({
        ...currentSection,
        content: preservedContent || currentSection.title, // Si no hay contenido, usar al menos el título
        images: currentSection.images, // Mantener referencia a imágenes para compatibilidad
        level: currentLevel
      })
    }
  }
  
  // Si no se detectaron secciones, crear una con todo el contenido PRESERVADO
  if (sections.length === 0) {
    // Preservar párrafos completos con sus saltos de línea
    const paragraphs = fullText.split(/\n\s*\n/)
    sections.push(...paragraphs.map((para, idx) => {
      if (para.trim().length > 0) { // Solo crear sección si tiene contenido
        const paraImages = images.length > 0 ? [images[idx % images.length]] : []
        let paraContent = para
        // Agregar imágenes al final del párrafo
        if (paraImages.length > 0) {
          const imagesHTML = paraImages.map(img => 
            `\n\n<img src="${img}" alt="Imagen" style="max-width: 100%; height: auto; margin: 1rem 0; border-radius: 8px; display: block;" />\n\n`
          ).join('')
          paraContent = paraContent + imagesHTML
        }
        return {
          title: `Sección ${idx + 1}`,
          content: paraContent, // PRESERVAR: sin .trim() para mantener espacios y saltos de línea
          images: paraImages,
          level: 1
        }
      }
      return null
    }).filter(Boolean))
  }
  
  // Distribuir imágenes restantes entre secciones que no tienen imágenes
  // Y agregarlas al final del contenido si no están ya insertadas
  const sectionsWithoutImages = sections.filter(s => s.images.length === 0)
  if (sectionsWithoutImages.length > 0 && images.length > 0) {
    images.forEach((img, idx) => {
      // Solo agregar si la imagen no está ya asociada
      const isAlreadyAssociated = sections.some(s => s.images.includes(img))
      if (!isAlreadyAssociated) {
        const targetSection = sectionsWithoutImages[idx % sectionsWithoutImages.length]
        if (targetSection) {
          targetSection.images.push(img)
          // Agregar imagen al final del contenido si no está ya insertada
          const imagesInContent = (targetSection.content.match(/<img\s+src=/gi) || []).length
          if (imagesInContent === 0) {
            const imageHTML = `\n\n<img src="${img}" alt="Imagen" style="max-width: 100%; height: auto; margin: 1rem 0; border-radius: 8px; display: block;" />\n\n`
            targetSection.content = targetSection.content + imageHTML
          }
        }
      }
    })
  }
  
  // Para todas las secciones, asegurar que las imágenes del array estén en el contenido
  sections.forEach(section => {
    if (section.images && section.images.length > 0) {
      const imagesInContent = (section.content.match(/<img\s+src=/gi) || []).length
      const imagesToAdd = section.images.slice(imagesInContent)
      
      if (imagesToAdd.length > 0) {
        const imagesHTML = imagesToAdd.map(img => 
          `\n\n<img src="${img}" alt="Imagen" style="max-width: 100%; height: auto; margin: 1rem 0; border-radius: 8px; display: block;" />\n\n`
        ).join('')
        section.content = section.content + imagesHTML
      }
    }
  })
  
  return { sections, allImages: images }
}

// Extraer imágenes del PDF usando análisis directo del buffer
// pdf-lib no expone fácilmente las imágenes, así que usamos un enfoque de parsing directo
async function extractImagesFromPDF(fileBuffer, req = null) {
  const extractedImages = []
  const imagesDir = path.join(__dirname, '..', '..', 'public', 'images')
  await fs.mkdir(imagesDir, { recursive: true })
  
  try {
    logger.debug('🖼️  Iniciando extracción de imágenes del PDF...')
    
    // Buscar streams de imágenes en el PDF usando expresiones regulares
    // Los PDFs almacenan imágenes como objetos con /Type /XObject /Subtype /Image
    const pdfString = fileBuffer.toString('binary')
    
    // Buscar patrones de objetos de imagen
    // Formato: /Type /XObject /Subtype /Image ... stream ... endstream
    const imageStreamRegex = /\/Type\s*\/XObject[\s\S]*?\/Subtype\s*\/Image[\s\S]*?stream\s*([\s\S]*?)\s*endstream/gi
    let match
    let imageIndex = 0
    
    while ((match = imageStreamRegex.exec(pdfString)) !== null) {
      try {
        const streamData = match[1]
        
        // Limpiar el stream (puede tener filtros de compresión)
        // Intentar extraer datos binarios
        let imageData = streamData
        
        // Si el stream está en formato hexadecimal, convertir
        if (/^[\s0-9a-fA-F]+$/.test(streamData.trim())) {
          const hexString = streamData.replace(/\s/g, '')
          imageData = Buffer.from(hexString, 'hex')
        } else {
          // Intentar como binario directo
          imageData = Buffer.from(streamData, 'binary')
        }
        
        // Verificar que sea una imagen válida (JPEG o PNG)
        const isJPEG = imageData[0] === 0xFF && imageData[1] === 0xD8
        const isPNG = imageData[0] === 0x89 && imageData[1] === 0x50 && imageData[2] === 0x4E && imageData[3] === 0x47
        
        if (isJPEG || isPNG) {
          const extension = isJPEG ? 'jpg' : 'png'
          const timestamp = Date.now()
          imageIndex++
          const imageFilename = `pdf-${timestamp}-img${imageIndex}.${extension}`
          const imagePath = path.join(imagesDir, imageFilename)
          
          await fs.writeFile(imagePath, imageData)
          
          // URL para el frontend - usar req para obtener la URL correcta
          const backendUrl = getBackendUrl(req)
          const imageUrl = `${backendUrl}/images/${imageFilename}`
          extractedImages.push(imageUrl)
          
          logger.debug(`✅ Imagen extraída: ${imageFilename} (${(imageData.length / 1024).toFixed(2)} KB)`)
        }
      } catch (imgError) {
        logger.debug(`⚠️  Error procesando imagen ${imageIndex + 1}:`, imgError.message)
        // Continuar con la siguiente imagen
      }
    }
    
    // Si no encontramos imágenes con el método anterior, intentar con pdf-lib
    if (extractedImages.length === 0) {
      logger.debug('🔄 Intentando extracción alternativa con pdf-lib...')
      try {
        const pdfDoc = await PDFDocument.load(fileBuffer)
        // pdf-lib no expone fácilmente las imágenes, pero podemos intentar acceder al contexto interno
        // Por ahora, retornamos vacío y confiamos en la asociación por referencias en el texto
        logger.debug('⚠️  pdf-lib no puede extraer imágenes directamente. Las imágenes se asociarán por referencias en el texto.')
      } catch (pdfLibError) {
        logger.debug('⚠️  Error con pdf-lib:', pdfLibError.message)
      }
    }
    
    logger.debug(`✅ Total de imágenes extraídas: ${extractedImages.length}`)
    return extractedImages
  } catch (error) {
    logger.error('❌ Error extrayendo imágenes del PDF:', error.message)
    logger.error('📚 Stack:', error.stack)
    return []
  }
}

// Extraer contenido de PDF con detección inteligente e imágenes
async function extractFromPDF(fileBuffer, req = null) {
  try {
    // Obtener pdfParse de forma lazy
    const pdfParse = getPdfParse()
    
    // Verificar que pdfParse sea una función antes de usarla
    if (typeof pdfParse !== 'function') {
      logger.error('❌ pdfParse no es una función. Tipo:', typeof pdfParse)
      logger.error('📦 pdfParse value:', pdfParse)
      throw new Error('pdf-parse no está disponible correctamente. Tipo: ' + typeof pdfParse)
    }
    
    logger.debug('📄 Llamando a pdfParse con buffer de tamaño:', fileBuffer.length)
    logger.debug('🔍 Tipo de pdfParse:', typeof pdfParse)
    
    // Extraer texto
    const data = await pdfParse(fileBuffer)
    const fullText = data.text
    const numPages = data.numpages || 1
    
    logger.debug(`✅ PDF procesado: ${numPages} páginas, ${fullText.length} caracteres`)
    
    // Extraer imágenes del PDF
    const extractedImages = await extractImagesFromPDF(fileBuffer, req)
    
    // Extraer secciones con asociación inteligente de imágenes
    const result = extractStructuredSections(fullText, extractedImages)
    
    // Agregar número de página a cada sección para mantener orden (PDF)
    // Las secciones se crean en el orden en que aparecen en el documento
    result.sections = result.sections.map((section, index) => ({
      ...section,
      pageNumber: index + 1 // Número de sección/página (1-based) para mantener orden
    }))
    
    // Asegurar que las imágenes extraídas estén en allImages
    result.allImages = extractedImages
    
    return result
  } catch (error) {
    logger.error('❌ Error extrayendo PDF:', error)
    logger.error('📚 Stack:', error.stack)
    logger.error('🔍 Tipo de pdfParse:', typeof pdfParse)
    
    // Intentar extraer solo texto como fallback
    try {
      const pdfParse = getPdfParse()
      if (typeof pdfParse === 'function') {
        logger.debug('🔄 Intentando fallback con pdfParse...')
        const data = await pdfParse(fileBuffer)
        const fullText = data.text
        const sections = extractStructuredSections(fullText, [])
        return { sections, allImages: [] }
      } else {
        throw new Error('pdfParse no es una función en el fallback')
      }
    } catch (fallbackError) {
      logger.error('❌ Error en fallback:', fallbackError)
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

// Extraer imágenes de DOCX
async function extractImagesFromDocx(fileBuffer, req = null) {
  const images = []
  const imagesDir = path.join(__dirname, '..', '..', 'public', 'images')
  await fs.mkdir(imagesDir, { recursive: true })

  try {
    const zip = new AdmZip(fileBuffer)
    const zipEntries = zip.getEntries()

    for (const entry of zipEntries) {
      if (entry.entryName.startsWith('word/media/') && !entry.isDirectory) {
        const buffer = entry.getData()
        const ext = path.extname(entry.entryName).toLowerCase()
        const imageName = `docx-${Date.now()}-${path.basename(entry.entryName)}`
        const imagePath = path.join(imagesDir, imageName)
        await fs.writeFile(imagePath, buffer)
        const backendUrl = getBackendUrl(req)
        images.push(`${backendUrl}/images/${imageName}`)
        logger.debug(`✅ Imagen DOCX extraída: ${imageName}`)
      }
    }
  } catch (error) {
    logger.error('❌ Error extrayendo imágenes de DOCX:', error.message)
  }
  return images
}

// Extraer imágenes de PPTX
async function extractImagesFromPptx(fileBuffer, req = null) {
  const images = []
  const imagesDir = path.join(__dirname, '..', '..', 'public', 'images')
  await fs.mkdir(imagesDir, { recursive: true })

  try {
    const zip = new AdmZip(fileBuffer)
    const zipEntries = zip.getEntries()

    for (const entry of zipEntries) {
      if (entry.entryName.startsWith('ppt/media/') && !entry.isDirectory) {
        const buffer = entry.getData()
        const ext = path.extname(entry.entryName).toLowerCase()
        const imageName = `pptx-${Date.now()}-${path.basename(entry.entryName)}`
        const imagePath = path.join(imagesDir, imageName)
        await fs.writeFile(imagePath, buffer)
        const backendUrl = getBackendUrl(req)
        images.push(`${backendUrl}/images/${imageName}`)
        logger.debug(`✅ Imagen PPTX extraída: ${imageName}`)
      }
    }
  } catch (error) {
    logger.error('❌ Error extrayendo imágenes de PPTX:', error.message)
  }
  return images
}

// Extraer fondo de una diapositiva específica
async function extractSlideBackground(zip, slideIndex, slideXml, req = null) {
  try {
    const imagesDir = path.join(__dirname, '..', '..', 'public', 'images')
    await fs.mkdir(imagesDir, { recursive: true })
    
    // Buscar fondo en el XML de la diapositiva
    // El fondo puede estar en: p:cSld/p:bg/p:bgPr/a:blip/@r:embed
    if (slideXml['p:sld'] && slideXml['p:sld']['p:cSld'] && slideXml['p:sld']['p:cSld'][0]['p:bg']) {
      const bg = slideXml['p:sld']['p:cSld'][0]['p:bg'][0]
      if (bg['p:bgPr'] && bg['p:bgPr'][0]) {
        const bgPr = bg['p:bgPr'][0]
        
        // Buscar imagen de fondo (a:blip)
        if (bgPr['a:blip'] && bgPr['a:blip'][0] && bgPr['a:blip'][0]['$'] && bgPr['a:blip'][0]['$']['r:embed']) {
          const embedId = bgPr['a:blip'][0]['$']['r:embed']
          
          // Buscar la relación en el archivo .rels de la diapositiva
          // El número de diapositiva puede no ser secuencial, extraer del nombre del archivo
          const slideNumber = slideIndex + 1 // Por defecto usar índice + 1
          const slideRelName = `ppt/slides/_rels/slide${slideNumber}.xml.rels`
          const slideRelEntry = zip.getEntry(slideRelName)
          
          if (slideRelEntry) {
            const relContent = slideRelEntry.getData().toString('utf8')
            const relResult = await parseStringPromise(relContent)
            
            // Buscar la relación con el embedId
            if (relResult['Relationships'] && relResult['Relationships']['Relationship']) {
              const relationships = Array.isArray(relResult['Relationships']['Relationship']) 
                ? relResult['Relationships']['Relationship'] 
                : [relResult['Relationships']['Relationship']]
              
              for (const rel of relationships) {
                if (rel['$'] && rel['$']['Id'] === embedId) {
                  const target = rel['$']['Target']
                  // La imagen está en ppt/media/ o en la ruta relativa
                  const imagePath = target.startsWith('../') ? target.replace('../', 'ppt/') : `ppt/${target}`
                  const imageEntry = zip.getEntry(imagePath)
                  
                  if (imageEntry) {
                    const imageBuffer = imageEntry.getData()
                    const ext = path.extname(target).toLowerCase() || '.png'
                    const imageName = `pptx-bg-${Date.now()}-slide${slideIndex + 1}${ext}`
                    const fullImagePath = path.join(imagesDir, imageName)
                    await fs.writeFile(fullImagePath, imageBuffer)
                    
                    const backendUrl = getBackendUrl(req)
                    logger.debug(`✅ Fondo de diapositiva ${slideIndex + 1} extraído: ${imageName}`)
                    return `${backendUrl}/images/${imageName}`
                  }
                }
              }
            }
          }
        }
      }
    }
  } catch (error) {
    logger.error(`Error extrayendo fondo de diapositiva ${slideIndex + 1}:`, error.message)
  }
  return null
}

// Renderizar todas las diapositivas de PowerPoint como imágenes usando LibreOffice
// Esta función se llama una vez para todo el archivo y genera todas las imágenes
async function renderAllSlidesAsImages(fileBuffer, req = null) {
  const { exec } = await import('child_process')
  const { promisify } = await import('util')
  const execAsync = promisify(exec)
  const fs = await import('fs/promises')
  const os = await import('os')
  const path = await import('path')
  
  const imagesDir = path.join(__dirname, '..', '..', 'public', 'images')
  await fs.mkdir(imagesDir, { recursive: true })
  
  const slideImages = []
  
  try {
    // Crear archivo temporal
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'pptx-'))
    const tempPptxPath = path.join(tempDir, 'presentation.pptx')
    const tempOutputDir = path.join(tempDir, 'output')
    await fs.mkdir(tempOutputDir, { recursive: true })
    
    // Guardar el buffer del PPTX en archivo temporal
    await fs.writeFile(tempPptxPath, fileBuffer)
    
    try {
      // LibreOffice convierte cada diapositiva a un archivo PNG separado
      // Comando: libreoffice --headless --convert-to png --outdir <output> <input>
      // Genera: presentation.1.png, presentation.2.png, etc.
      await execAsync(`libreoffice --headless --convert-to png --outdir "${tempOutputDir}" "${tempPptxPath}" 2>&1 || true`)
      
      // Buscar todas las imágenes generadas y ORDENARLAS numéricamente
      // LibreOffice genera: presentation.1.png, presentation.2.png, etc.
      const files = await fs.readdir(tempOutputDir)
      const pngFiles = files
        .filter(f => f.endsWith('.png'))
        .sort((a, b) => {
          // Ordenar numéricamente: presentation.1.png, presentation.2.png, etc.
          const numA = parseInt(a.match(/\.(\d+)\.png$/)?.[1] || '0')
          const numB = parseInt(b.match(/\.(\d+)\.png$/)?.[1] || '0')
          return numA - numB // Orden ascendente
        })
      
      const backendUrl = getBackendUrl(req)
      
      // Usar un objeto para mapear número de diapositiva a URL de imagen
      // Esto asegura que diapositiva 1 → imagen 1, diapositiva 2 → imagen 2, etc.
      const slideImagesMap = {}
      
      for (const pngFile of pngFiles) {
        const sourcePath = path.join(tempOutputDir, pngFile)
        
        // Extraer número de diapositiva del nombre del archivo
        // LibreOffice genera: presentation.1.png, presentation.2.png, etc.
        const slideNumberMatch = pngFile.match(/\.(\d+)\.png$/)
        if (!slideNumberMatch) {
          logger.warn(`⚠️  No se pudo extraer número de diapositiva del archivo: ${pngFile}`)
          continue
        }
        
        const slideNumber = parseInt(slideNumberMatch[1])
        const imageName = `pptx-full-${Date.now()}-slide${slideNumber}.png`
        const finalImagePath = path.join(imagesDir, imageName)
        
        try {
          await fs.copyFile(sourcePath, finalImagePath)
          const imageUrl = `${backendUrl}/images/${imageName}`
          slideImagesMap[slideNumber] = imageUrl // Mapear número de diapositiva a URL
          logger.debug(`✅ Diapositiva ${slideNumber} renderizada como imagen: ${imageName}`)
        } catch (copyError) {
          logger.debug(`⚠️  Error copiando imagen de diapositiva ${slideNumber}:`, copyError.message)
        }
      }
      
      // Convertir el mapa a un array ordenado (índice 0 = diapositiva 1, índice 1 = diapositiva 2, etc.)
      const maxSlideNumber = Math.max(...Object.keys(slideImagesMap).map(Number), 0)
      for (let i = 1; i <= maxSlideNumber; i++) {
        if (slideImagesMap[i]) {
          slideImages.push(slideImagesMap[i])
        } else {
          // Si falta una diapositiva, agregar null para mantener el orden
          slideImages.push(null)
          logger.warn(`⚠️  Falta imagen para diapositiva ${i}`)
        }
      }
      
    } catch (libreOfficeError) {
      // LibreOffice no está disponible o falló, continuar sin renderizado completo
      logger.debug(`⚠️  LibreOffice no disponible para renderizado: ${libreOfficeError.message}`)
    }
    
    // Limpiar archivos temporales
    await fs.rm(tempDir, { recursive: true, force: true })
    
  } catch (error) {
    logger.error('Error renderizando diapositivas:', error.message)
  }
  
  return slideImages
}

// Extraer contenido de PowerPoint
async function extractFromPptx(fileBuffer, req = null) {
  const sections = []
  const allImages = await extractImagesFromPptx(fileBuffer, req) // Extraer imágenes primero
  
  // Renderizar todas las diapositivas como imágenes completas (copia exacta del original)
  const fullPageImages = await renderAllSlidesAsImages(fileBuffer, req)

  try {
    const zip = new AdmZip(fileBuffer)
    // Filtrar y ORDENAR las diapositivas por número para garantizar orden correcto
    const slideXmlEntries = zip.getEntries()
      .filter(entry => entry.entryName.startsWith('ppt/slides/slide') && entry.entryName.endsWith('.xml'))
      .sort((a, b) => {
        // Extraer números de diapositiva para ordenar numéricamente
        const numA = parseInt(a.entryName.match(/slide(\d+)\.xml/)?.[1] || '0')
        const numB = parseInt(b.entryName.match(/slide(\d+)\.xml/)?.[1] || '0')
        return numA - numB // Orden ascendente: slide1, slide2, slide3...
      })

    for (let i = 0; i < slideXmlEntries.length; i++) {
      const entry = slideXmlEntries[i]
      const xmlContent = entry.getData().toString('utf8')
      
      // Extraer número de diapositiva del nombre del archivo (ej: "ppt/slides/slide1.xml" -> 1)
      const slideNumberMatch = entry.entryName.match(/slide(\d+)\.xml/)
      const slideNumber = slideNumberMatch ? parseInt(slideNumberMatch[1]) : i + 1
      
      // Verificar que el índice corresponde al número de diapositiva
      if (slideNumber !== i + 1) {
        logger.warn(`⚠️  Advertencia: Diapositiva ${slideNumber} en posición ${i + 1}. Ajustando orden.`)
      }

      const result = await parseStringPromise(xmlContent)

      let slideText = ''
      // Buscar texto en diferentes elementos XML de PowerPoint
      if (result['p:sld'] && result['p:sld']['p:cSld'] && result['p:sld']['p:cSld'][0]['p:spTree'] && result['p:sld']['p:cSld'][0]['p:spTree'][0]['p:sp']) {
        for (const sp of result['p:sld']['p:cSld'][0]['p:spTree'][0]['p:sp']) {
          if (sp['p:txBody'] && sp['p:txBody'][0]['a:p']) {
            for (const p of sp['p:txBody'][0]['a:p']) {
              if (p['a:r']) {
                for (const r of p['a:r']) {
                  if (r['a:t']) {
                    slideText += r['a:t'][0] + ' '
                  }
                }
              } else if (p['a:fld']) { // Handle fields like slide numbers
                for (const fld of p['a:fld']) {
                  if (fld['a:t']) {
                    slideText += fld['a:t'][0] + ' '
                  }
                }
              }
            }
          }
        }
      }

      const titleMatch = slideText.match(/^(.*?)\n/) // Intentar obtener el primer párrafo como título
      const title = titleMatch ? titleMatch[1].trim() : `Diapositiva ${i + 1}`
      const content = slideText.trim()

      // Extraer fondo de la diapositiva
      const backgroundImage = await extractSlideBackground(zip, slideNumber - 1, result, req)

      // Obtener la imagen completa renderizada de esta diapositiva (copia exacta del original)
      // IMPORTANTE: Usar slideNumber - 1 porque las imágenes están indexadas desde 0
      // pero slideNumber es 1-based (slide1 = índice 0, slide2 = índice 1, etc.)
      const imageIndex = slideNumber - 1
      const fullPageImage = (imageIndex >= 0 && imageIndex < fullPageImages.length) 
        ? fullPageImages[imageIndex] 
        : null
      
      if (!fullPageImage) {
        if (fullPageImages.length > 0) {
          logger.warn(`⚠️  No se encontró imagen renderizada para diapositiva ${slideNumber} (índice ${imageIndex}). Total de imágenes: ${fullPageImages.length}`)
        } else {
          logger.debug(`ℹ️  No hay imágenes renderizadas disponibles (LibreOffice puede no estar disponible)`)
        }
      } else {
        logger.debug(`✅ Imagen encontrada para diapositiva ${slideNumber} (índice ${imageIndex}): ${fullPageImage.substring(fullPageImage.lastIndexOf('/') + 1)}`)
      }

      // Asociar imágenes a la diapositiva (distribución equitativa si no hay referencias explícitas)
      const slideImages = []
      const imagesPerSlide = Math.ceil(allImages.length / slideXmlEntries.length)
      const startIndex = i * imagesPerSlide
      for (let j = 0; j < imagesPerSlide && (startIndex + j) < allImages.length; j++) {
        slideImages.push(allImages[startIndex + j])
      }
      
      sections.push({
        title,
        content,
        images: slideImages,
        backgroundImage, // Imagen de fondo de la diapositiva
        fullPageImage: fullPageImage || backgroundImage || null, // Imagen completa renderizada (copia exacta) o fondo como fallback
        level: 1, // Todas las diapositivas son nivel 1 por defecto
        slideNumber: slideNumber // Número de diapositiva para referencia y ordenamiento
      })
    }
  } catch (error) {
    logger.error('Error extrayendo PowerPoint:', error)
    return {
      sections: [{
        title: 'Error',
        content: 'No se pudo procesar el archivo PowerPoint',
        images: [],
        level: 1
      }],
      allImages: []
    }
  }
  return { sections, allImages }
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
            level: 1,
            sheetNumber: sheetIdx + 1 // Número de hoja (1-based) para mantener orden
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
    logger.error('Error extrayendo Excel:', error)
    return [{
      title: 'Error',
      content: 'No se pudo procesar el archivo Excel',
      images: [],
      level: 1
    }]
  }
}

// Generar resumen inteligente del contenido
function generateIntelligentSummary(content, maxLength = 250) {
  if (!content || content.length <= maxLength) {
    return content
  }
  
  // Remover HTML tags para análisis
  const textOnly = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  
  if (textOnly.length <= maxLength) {
    return content.substring(0, content.indexOf(textOnly) + textOnly.length)
  }
  
  // Dividir en párrafos
  const paragraphs = textOnly.split(/\n\s*\n/).filter(p => p.trim().length > 0)
  
  if (paragraphs.length === 0) {
    return content.substring(0, maxLength) + '...'
  }
  
  // Tomar los primeros párrafos hasta alcanzar el límite
  let summary = ''
  let totalLength = 0
  
  for (const para of paragraphs) {
    const paraLength = para.length
    if (totalLength + paraLength <= maxLength - 50) { // Dejar margen para "..."
      summary += (summary ? '\n\n' : '') + para
      totalLength += paraLength + (summary ? 2 : 0)
    } else {
      // Si el párrafo es muy largo, tomar solo las primeras oraciones
      const sentences = para.split(/[.!?]+\s+/).filter(s => s.trim().length > 0)
      let paraSummary = ''
      for (const sentence of sentences) {
        if (totalLength + sentence.length <= maxLength - 50) {
          paraSummary += (paraSummary ? '. ' : '') + sentence
          totalLength += sentence.length + (paraSummary ? 2 : 0)
        } else {
          break
        }
      }
      if (paraSummary) {
        summary += (summary ? '\n\n' : '') + paraSummary + '.'
      }
      break
    }
  }
  
  // Si el resumen está vacío, tomar las primeras oraciones del primer párrafo
  if (!summary && paragraphs.length > 0) {
    const firstPara = paragraphs[0]
    const sentences = firstPara.split(/[.!?]+\s+/).filter(s => s.trim().length > 0)
    summary = sentences.slice(0, 2).join('. ') + (sentences.length > 2 ? '...' : '.')
  }
  
  // Si el contenido original tenía HTML, intentar preservar la estructura
  if (content.includes('<img')) {
    // Si hay imágenes, mantener al menos una referencia
    const imgMatch = content.match(/<img[^>]*>/)
    if (imgMatch && summary.length < maxLength - 20) {
      summary += ' [Imagen]'
    }
  }
  
  return summary || content.substring(0, maxLength) + '...'
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
      logger.debug('Procesando PDF:', fileName, fileMimeType)
      try {
        logger.debug('Iniciando procesamiento de PDF...')
        const extracted = await extractFromPDF(fileBuffer, req)
        logger.debug('PDF procesado, estructura:', extracted)
        
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
          logger.error('Estructura inesperada del PDF:', extracted)
          sections = []
          allImages = []
        }
        
        logger.debug(`Secciones extraídas: ${sections.length}, Imágenes: ${allImages.length}`)
      } catch (pdfError) {
        logger.error('Error específico procesando PDF:', pdfError)
        logger.error('Stack:', pdfError.stack)
        return res.status(400).json({
          error: 'Error al procesar el archivo PDF',
          details: pdfError.message || 'Error desconocido',
          hint: 'Asegúrate de que el PDF contenga texto (no sea solo imágenes escaneadas)',
          fileName: req.file.originalname
        })
      }
    } else if (fileName.endsWith('.docx') || 
               fileMimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const extracted = await extractStructuredContentFromWord(fileBuffer, req)
      sections = extracted.sections
      allImages = extracted.allImages
    } else if (fileName.endsWith('.xlsx') || 
               fileMimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      logger.debug('Procesando Excel:', fileName, fileMimeType)
      const extracted = await extractFromExcel(fileBuffer)
      sections = extracted.sections
      allImages = extracted.allImages || []
    } else if (fileName.endsWith('.pptx') || 
               fileMimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
      logger.debug('Procesando PowerPoint:', fileName, fileMimeType)
      const extracted = await extractFromPptx(fileBuffer, req)
      sections = extracted.sections
      allImages = extracted.allImages || []
    } else {
      logger.error('Formato no reconocido:', {
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
      
      // Preview: resumen inteligente del contenido (no solo truncar)
      const preview = generateIntelligentSummary(fullContent, 200)
      
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

      // Asegurar que description no esté vacío - usar content si description está vacío
      const finalDescription = description || section.content || preview || ''
      
      // Construir estilo del widget (incluir fondo si existe, especialmente para PowerPoint)
      // Si hay fullPageImage (imagen completa renderizada), usarla como fondo principal
      // Si no, usar backgroundImage (solo el fondo)
      const widgetStyle = {
        backgroundColor: undefined, // Se puede sobrescribir
        borderColor: undefined,
        textColor: undefined,
        borderRadius: undefined,
        backgroundImage: section.fullPageImage || section.backgroundImage || undefined, // Imagen completa o fondo
        backgroundSize: (section.fullPageImage || section.backgroundImage) ? 'cover' : undefined,
        backgroundPosition: (section.fullPageImage || section.backgroundImage) ? 'center' : undefined,
        fullPageImage: section.fullPageImage || undefined, // Imagen completa de la página/diapositiva (exactamente igual al original)
      }

      // Para todos los tipos de archivo: usar número de sección/página/hoja/diapositiva para ordenamiento preciso
      // Esto garantiza que el orden se mantenga exactamente como en el documento original
      let widgetOrder = index // Fallback por defecto
      
      if (section.slideNumber !== undefined) {
        // PowerPoint: usar slideNumber
        widgetOrder = section.slideNumber - 1
      } else if (section.pageNumber !== undefined) {
        // PDF: usar pageNumber
        widgetOrder = section.pageNumber - 1
      } else if (section.sectionNumber !== undefined) {
        // Word: usar sectionNumber
        widgetOrder = section.sectionNumber - 1
      } else if (section.sheetNumber !== undefined) {
        // Excel: usar sheetNumber
        widgetOrder = section.sheetNumber - 1
      }
      
      // Log para verificar ordenamiento
      if (section.slideNumber || section.pageNumber || section.sectionNumber || section.sheetNumber) {
        logger.debug(`📋 Widget orden: ${widgetOrder} para "${section.title}" (${section.slideNumber ? 'slide' : section.pageNumber ? 'page' : section.sectionNumber ? 'section' : 'sheet'}: ${section.slideNumber || section.pageNumber || section.sectionNumber || section.sheetNumber})`)
      }

      return {
        title: section.title || `Sección ${index + 1}`,
        preview: preview || (finalDescription.length > 150 ? finalDescription.substring(0, 150) + '...' : finalDescription), // Preview preservado
        description: finalDescription, // Descripción completa preservada (espacios, saltos de línea, puntuación)
        additionalInfo, // Sin información adicional (todo en description)
        category: section.category,
        images: sectionImages, // Imágenes específicas de esta sección, correctamente asociadas
        style: widgetStyle, // Estilo con fondo si existe
        order: widgetOrder, // Orden basado en número de diapositiva para PowerPoint, índice para otros
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
    logger.error('Error procesando documento:', error)
    res.status(500).json({
      error: 'Error al procesar el documento',
      details: error.message || 'Error desconocido'
    })
  }
})

export default router
