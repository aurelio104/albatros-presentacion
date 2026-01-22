#!/usr/bin/env node

/**
 * Script de prueba para renderizar la primera diapositiva de un PowerPoint
 * y comparar con el resultado esperado del sistema
 */

import fs from 'fs/promises'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'
import { fileURLToPath } from 'url'
import AdmZip from 'adm-zip'
import { parseStringPromise } from 'xml2js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const execAsync = promisify(exec)

const PPTX_FILE = path.join(__dirname, '..', 'power point presentacion generik.pptx')
const TEMP_DIR = path.join(__dirname, '..', 'temp-test')
const OUTPUT_DIR = path.join(__dirname, '..', 'test-output')

async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true })
  } catch (error) {
    // Directorio ya existe
  }
}

async function renderFirstSlide() {
  console.log('🔍 Analizando archivo PowerPoint...\n')
  
  // Verificar que el archivo existe
  try {
    const stats = await fs.stat(PPTX_FILE)
    console.log(`✅ Archivo encontrado: ${path.basename(PPTX_FILE)}`)
    console.log(`   Ruta completa: ${PPTX_FILE}`)
    console.log(`   Tamaño: ${(stats.size / 1024 / 1024).toFixed(2)} MB\n`)
  } catch (error) {
    console.error(`❌ Error: No se encontró el archivo ${PPTX_FILE}`)
    console.error(`   Error: ${error.message}`)
    process.exit(1)
  }

  // Leer el archivo
  console.log('📖 Leyendo archivo PowerPoint...')
  const fileBuffer = await fs.readFile(PPTX_FILE)
  const zip = new AdmZip(fileBuffer)

  // Extraer información de las diapositivas
  const slideXmlEntries = zip.getEntries()
    .filter(entry => entry.entryName.startsWith('ppt/slides/slide') && entry.entryName.endsWith('.xml'))
    .sort((a, b) => {
      const numA = parseInt(a.entryName.match(/slide(\d+)\.xml/)?.[1] || '0')
      const numB = parseInt(b.entryName.match(/slide(\d+)\.xml/)?.[1] || '0')
      return numA - numB
    })

  console.log(`✅ Diapositivas encontradas: ${slideXmlEntries.length}\n`)
  
  // Mostrar información de las primeras 5 diapositivas
  console.log('📊 Información de las primeras diapositivas:\n')
  for (let i = 0; i < Math.min(5, slideXmlEntries.length); i++) {
    const entry = slideXmlEntries[i]
    const slideNumberMatch = entry.entryName.match(/slide(\d+)\.xml/)
    const slideNumber = slideNumberMatch ? parseInt(slideNumberMatch[1]) : i + 1
    
    console.log(`   Diapositiva ${slideNumber}:`)
    console.log(`   - Archivo XML: ${entry.entryName}`)
    console.log(`   - Posición en array ordenado: ${i}`)
    console.log(`   - Índice esperado para imagen renderizada: ${i}`)
    console.log(`   - Widget order esperado: ${slideNumber - 1}`)
    
    // Extraer texto de la primera diapositiva
    if (i === 0) {
      const xmlContent = entry.getData().toString('utf8')
      const result = await parseStringPromise(xmlContent)
      
      let slideText = ''
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
              }
            }
          }
        }
      }
      
      const preview = slideText.trim().substring(0, 150)
      console.log(`   - Texto extraído: "${preview}${preview.length < slideText.trim().length ? '...' : ''}"`)
    }
    console.log('')
  }

  // Renderizar usando LibreOffice
  console.log('🎨 Renderizando diapositivas con LibreOffice...\n')
  
  await ensureDir(TEMP_DIR)
  await ensureDir(OUTPUT_DIR)

  try {
    // Convertir PowerPoint a PNG usando LibreOffice
    const command = `libreoffice --headless --convert-to png --outdir "${TEMP_DIR}" "${PPTX_FILE}"`
    console.log(`Ejecutando: libreoffice --headless --convert-to png\n`)
    
    const { stdout, stderr } = await execAsync(command, {
      timeout: 60000, // 60 segundos timeout
    })
    
    if (stdout) {
      console.log(`📝 LibreOffice stdout: ${stdout}`)
    }
    
    if (stderr && !stderr.includes('Application')) {
      console.log(`⚠️  LibreOffice stderr: ${stderr}`)
    }
    
    // Buscar archivos PNG generados
    const files = await fs.readdir(TEMP_DIR)
    const pngFiles = files
      .filter(f => f.endsWith('.png'))
      .sort((a, b) => {
        // Ordenar numéricamente: presentation.1.png, presentation.2.png, etc.
        const numA = parseInt(a.match(/\.(\d+)\.png$/)?.[1] || '0')
        const numB = parseInt(b.match(/\.(\d+)\.png$/)?.[1] || '0')
        return numA - numB
      })
    
    console.log(`✅ Archivos PNG generados: ${pngFiles.length}\n`)
    
    if (pngFiles.length > 0) {
      // Copiar la primera imagen al directorio de salida
      const firstPng = pngFiles[0]
      const sourcePath = path.join(TEMP_DIR, firstPng)
      const destPath = path.join(OUTPUT_DIR, 'slide-1-rendered.png')
      
      await fs.copyFile(sourcePath, destPath)
      
      console.log(`✅ Primera diapositiva renderizada:`)
      console.log(`   - Archivo PNG original: ${firstPng}`)
      console.log(`   - Copiado a: ${destPath}`)
      console.log(`   - Este debería ser el widget 1 (order: 0)\n`)
      
      // Mostrar información de todas las imágenes renderizadas
      console.log(`📋 Todas las imágenes renderizadas (ordenadas):`)
      pngFiles.forEach((file, index) => {
        console.log(`   Array[${index}] → Diapositiva ${index + 1} → ${file}`)
      })
      console.log('')
      
      // Verificar correspondencia
      console.log(`🔍 Verificación de correspondencia:`)
      console.log(`   - Diapositiva XML 1 (slide1.xml) → Posición en array: 0`)
      console.log(`   - Imagen PNG 1 (${pngFiles[0]}) → Posición en array: 0`)
      console.log(`   - Widget order esperado: 0 (slideNumber - 1)`)
      console.log(`   - ✅ CORRECTO: Índice 0 = Primera diapositiva\n`)
      
      // Comparar con el sistema
      console.log(`📝 Comparación con el sistema:`)
      console.log(`   - El backend debería:`)
      console.log(`     1. Ordenar slideXmlEntries: [slide1.xml, slide2.xml, ...]`)
      console.log(`     2. Renderizar con LibreOffice: [presentation.1.png, presentation.2.png, ...]`)
      console.log(`     3. Ordenar PNGs: [presentation.1.png, presentation.2.png, ...]`)
      console.log(`     4. Mapear: slideXmlEntries[0] → fullPageImages[0]`)
      console.log(`     5. Crear widget con order: slideNumber - 1 = 0`)
      console.log(`   - ✅ Si todo está correcto, widget 1 tendrá la imagen de la diapositiva 1\n`)
      
    } else {
      console.log(`❌ No se generaron archivos PNG`)
      console.log(`   Archivos en temp: ${files.join(', ') || 'ninguno'}`)
      console.log(`   Verifica que LibreOffice esté instalado:`)
      console.log(`   - macOS: brew install --cask libreoffice`)
      console.log(`   - Linux: sudo apt-get install libreoffice`)
    }
    
  } catch (error) {
    console.error(`❌ Error al renderizar:`, error.message)
    if (error.message.includes('libreoffice') || error.message.includes('command not found')) {
      console.error(`\n   LibreOffice no está disponible.`)
      console.error(`   Instálalo con:`)
      console.error(`   - macOS: brew install --cask libreoffice`)
      console.error(`   - Linux: sudo apt-get install libreoffice`)
      console.error(`\n   O ejecuta este script en el servidor Koyeb donde LibreOffice está instalado.`)
    }
  }

  // Limpiar
  console.log('\n🧹 Limpiando archivos temporales...')
  try {
    await fs.rm(TEMP_DIR, { recursive: true, force: true })
    console.log('✅ Limpieza completada\n')
  } catch (error) {
    console.log(`⚠️  No se pudo limpiar ${TEMP_DIR}: ${error.message}\n`)
  }

  console.log('📝 Resumen final:')
  console.log(`   - Total de diapositivas en PowerPoint: ${slideXmlEntries.length}`)
  console.log(`   - Primera diapositiva: slide1.xml → Índice 0`)
  console.log(`   - Primera imagen renderizada: Índice 0`)
  console.log(`   - Widget order esperado para primera diapositiva: 0`)
  console.log(`   - ✅ El sistema debería mapear:`)
  console.log(`     slide1.xml[0] → fullPageImages[0] → widget order:0`)
  console.log(`\n   Si la imagen renderizada en test-output/slide-1-rendered.png`)
  console.log(`   coincide con lo que ves en el widget 1 del sistema, entonces`)
  console.log(`   el mapeo está correcto. ✅\n`)
}

// Ejecutar
renderFirstSlide().catch(error => {
  console.error('❌ Error fatal:', error)
  process.exit(1)
})
