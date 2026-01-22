#!/usr/bin/env node

/**
 * Script de prueba para verificar que la API de presentaciones funcione correctamente
 */

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001'

async function testPresentationsAPI() {
  console.log('🧪 Probando API de Presentaciones...\n')
  console.log(`Backend URL: ${BACKEND_URL}\n`)

  // Test 1: Listar presentaciones
  console.log('1️⃣  Test: Listar presentaciones')
  try {
    const response = await fetch(`${BACKEND_URL}/api/presentations`)
    const data = await response.json()
    
    if (response.ok) {
      console.log(`   ✅ OK - ${data.presentations?.length || 0} presentaciones encontradas`)
      if (data.presentations && data.presentations.length > 0) {
        console.log(`   📋 Presentaciones:`)
        data.presentations.forEach((p, i) => {
          console.log(`      ${i + 1}. ${p.name} (${p.widgetCount} widgets)`)
        })
      }
    } else {
      console.log(`   ❌ Error: ${data.error || 'Error desconocido'}`)
    }
  } catch (error) {
    console.log(`   ❌ Error de conexión: ${error.message}`)
  }
  console.log('')

  // Test 2: Verificar estructura de respuesta
  console.log('2️⃣  Test: Verificar estructura de respuesta')
  try {
    const response = await fetch(`${BACKEND_URL}/api/presentations`)
    const data = await response.json()
    
    if (response.ok && data.presentations) {
      const hasValidStructure = data.presentations.every(p => 
        p.id && p.name && typeof p.widgetCount === 'number'
      )
      
      if (hasValidStructure) {
        console.log('   ✅ Estructura válida')
      } else {
        console.log('   ⚠️  Algunas presentaciones tienen estructura inválida')
      }
      
      // Verificar fechas
      const invalidDates = data.presentations.filter(p => {
        if (!p.timestamp) return false
        const date = new Date(p.timestamp)
        return isNaN(date.getTime())
      })
      
      if (invalidDates.length === 0) {
        console.log('   ✅ Todas las fechas son válidas')
      } else {
        console.log(`   ⚠️  ${invalidDates.length} presentaciones con fechas inválidas`)
      }
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`)
  }
  console.log('')

  // Test 3: Health check
  console.log('3️⃣  Test: Health check del backend')
  try {
    const response = await fetch(`${BACKEND_URL}/health`)
    const data = await response.json()
    
    if (response.ok && data.status === 'ok') {
      console.log('   ✅ Backend está funcionando')
    } else {
      console.log('   ⚠️  Backend responde pero con estado inesperado')
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`)
  }
  console.log('')

  console.log('✅ Pruebas completadas\n')
}

testPresentationsAPI().catch(console.error)
