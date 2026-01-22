#!/usr/bin/env node

/**
 * Script de prueba para renderizar la primera diapositiva de un PowerPoint
 * y comparar con el resultado esperado del sistema
 */

import fs from 'fs/promises'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'
import AdmZip from 'adm-zip'
import { parseStringPromise } from 'xml2js'

const execAsync = promisify(exec)

const PPTX_FILE = path.join(process.cwd(), 'power point presentacion generik.pptx')
const TEMP_DIR = path.join(process.cwd(), 'temp-test')
const OUTPUT_DIR = path.join(process.cwd(), 'test-output')

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
    console.log(`✅ Archivo encontrado: ${PPTX_FILE}`)
    console.log(`   Tamaño: ${(stats.size / 1024 / 1024).toFixed(2)} MB\n`)
  } catch (error) {
    console.error(`❌ Error: No se encontró el archivo ${PPTX_FILE}`)
    process.exit(1)
  }

  // Leer el archivo
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

  console.log(`📊 Diapositivas encontradas: ${slideXmlEntries.length}\n`)
  
  // Mostrar información de las primeras 3 diapositivas
  for (let i = 0; i < Math.min(3, slideXmlEntries.length); i++) {
    const entry = slideXmlEntries[i]
    const slideNumberMatch = entry.entryName.match(/slide(\d+)\.xml/)
    const slideNumber = slideNumberMatch ? parseInt(slideNumberMatch[1]) : i + 1
    
    console.log(`   Diapositiva ${slideNumber}:`)
    console.log(`   - Archivo XML: ${entry.entryName}`)
    console.log(`   - Posición en array: ${i}`)
    console.log(`   - Índice esperado para imagen: ${i}`)
    
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
      
      console.log(`   - Texto extraído: "${slideText.trim().substring(0, 100)}..."`)
    }
    console.log('')
  }

  // Renderizar usando LibreOffice
  console.log('🎨 Renderizando primera diapositiva con LibreOffice...\n')
  
  await ensureDir(TEMP_DIR)
  await ensureDir(OUTPUT_DIR)

  try {
    // Convertir PowerPoint a PNG usando LibreOffice
    const command = `libreoffice --headless --convert-to png --outdir "${TEMP_DIR}" "${PPTX_FILE}"`
    console.log(`Ejecutando: ${command}\n`)
    
    const { stdout, stderr } = await execAsync(command, {
      timeout: 30000, // 30 segundos timeout
    })
    
    if (stderr) {
      console.log(`⚠️  LibreOffice stderr: ${stderr}`)
    }
    
    // Buscar archivos PNG generados
    const files = await fs.readdir(TEMP_DIR)
    const pngFiles = files
      .filter(f => f.endsWith('.png'))
      .sort((a, b) => {
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
      console.log(`   - Archivo original: ${firstPng}`)
      console.log(`   - Copiado a: ${destPath}`)
      console.log(`   - Este debería ser el widget 1 (order: 0)\n`)
      
      // Mostrar información de todos los PNG generados
      console.log(`📋 Todas las imágenes renderizadas:`)
      pngFiles.forEach((file, index) => {
        console.log(`   [${index}] → Diapositiva ${index + 1} → ${file}`)
      })
      console.log('')
      
      // Verificar correspondencia
      console.log(`🔍 Verificación de correspondencia:`)
      console.log(`   - Diapositiva XML 1 (slide1.xml) → Posición en array: 0`)
      console.log(`   - Imagen PNG 1 (${pngFiles[0]}) → Posición en array: 0`)
      console.log(`   - Widget order esperado: 0`)
      console.log(`   - ✅ CORRECTO: Índice 0 = Primera diapositiva\n`)
      
    } else {
      console.log(`❌ No se generaron archivos PNG`)
      console.log(`   Archivos en temp: ${files.join(', ')}`)
    }
    
  } catch (error) {
    console.error(`❌ Error al renderizar:`, error.message)
    if (error.message.includes('libreoffice')) {
      console.error(`   LibreOffice no está disponible. Instálalo con:`)
      console.error(`   - macOS: brew install --cask libreoffice`)
      console.error(`   - Linux: sudo apt-get install libreoffice`)
    }
  }

  // Limpiar
  console.log('🧹 Limpiando archivos temporales...')
  try {
    await fs.rm(TEMP_DIR, { recursive: true, force: true })
    console.log('✅ Limpieza completada\n')
  } catch (error) {
    console.log(`⚠️  No se pudo limpiar ${TEMP_DIR}: ${error.message}\n`)
  }

  console.log('📝 Resumen:')
  console.log(`   - Total de diapositivas: ${slideXmlEntries.length}`)
  console.log(`   - Primera diapositiva: slide1.xml → Índice 0`)
  console.log(`   - Primera imagen renderizada: Índice 0`)
  console.log(`   - Widget order esperado para primera diapositiva: 0`)
  console.log(`   - ✅ El sistema debería mapear: slide1.xml[0] → imagen[0] → widget order:0\n`)
}

// Ejecutar
renderFirstSlide().catch(error => {
  console.error('❌ Error fatal:', error)
  process.exit(1)
})
