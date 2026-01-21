// Script para migrar contenido inicial a Vercel KV
// Ejecutar después de configurar Vercel KV

const fs = require('fs');
const path = require('path');

const CONTENT_FILE = path.join(__dirname, '..', 'data', 'content.json');

async function migrateToKV() {
  try {
    // Leer contenido del archivo
    if (!fs.existsSync(CONTENT_FILE)) {
      console.log('❌ No se encontró el archivo content.json');
      return;
    }

    const content = JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf-8'));
    console.log('✅ Contenido leído del archivo');
    console.log(`📊 Widgets: ${content.widgets?.length || 0}`);
    console.log(`⚙️  Settings: ${content.settings ? 'OK' : 'Faltante'}`);

    // Nota: La migración real se hará automáticamente cuando se configure KV
    // Este script solo verifica que el contenido esté listo
    console.log('\n✅ El contenido está listo para migrar');
    console.log('📝 Una vez configures Vercel KV, el sistema migrará automáticamente el contenido');
    console.log('💡 O puedes usar la API POST /api/content para guardar el contenido en KV');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

migrateToKV();
