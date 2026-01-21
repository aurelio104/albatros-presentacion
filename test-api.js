// Script de prueba para las APIs
const fs = require('fs');
const path = require('path');

console.log('🧪 Iniciando pruebas de APIs...\n');

// Test 1: Verificar que el archivo content.json existe
console.log('1. Verificando archivo content.json...');
const contentFile = path.join(__dirname, 'data', 'content.json');
if (fs.existsSync(contentFile)) {
  try {
    const content = JSON.parse(fs.readFileSync(contentFile, 'utf-8'));
    console.log('   ✅ Archivo existe y es válido');
    console.log(`   📊 Widgets: ${content.widgets?.length || 0}`);
    console.log(`   ⚙️  Settings: ${content.settings ? 'OK' : 'Faltante'}`);
  } catch (error) {
    console.log('   ❌ Error al leer el archivo:', error.message);
  }
} else {
  console.log('   ⚠️  Archivo no existe, se creará automáticamente');
}

// Test 2: Verificar directorio de imágenes
console.log('\n2. Verificando directorio de imágenes...');
const imagesDir = path.join(__dirname, 'public', 'images');
if (fs.existsSync(imagesDir)) {
  const files = fs.readdirSync(imagesDir);
  console.log(`   ✅ Directorio existe con ${files.length} archivos`);
} else {
  console.log('   ⚠️  Directorio no existe, se creará automáticamente');
}

// Test 3: Verificar estructura de directorios
console.log('\n3. Verificando estructura de directorios...');
const dirs = [
  { path: 'data', name: 'Data' },
  { path: 'public/images', name: 'Public Images' },
  { path: 'public/videos', name: 'Public Videos' },
];

dirs.forEach(dir => {
  const fullPath = path.join(__dirname, dir.path);
  if (fs.existsSync(fullPath)) {
    console.log(`   ✅ ${dir.name}: OK`);
  } else {
    console.log(`   ⚠️  ${dir.name}: No existe (se creará automáticamente)`);
  }
});

console.log('\n✅ Pruebas completadas\n');
