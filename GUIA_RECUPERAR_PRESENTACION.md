# Guía para Recuperar Presentación desde Producción

## Método 1: Usando el Script Automático (Recomendado)

### Desde el servidor backend (Koyeb):
```bash
cd backend
node scripts/recover-production-presentation.js "Presentación 1"
```

### Desde tu máquina local:
```bash
cd backend
BACKEND_URL=https://albatros-backend-aurelio104-5f63c813.koyeb.app node scripts/recover-production-presentation.js "Presentación 1"
```

## Método 2: Desde el Panel de Administración

1. **Abre el panel de administración en producción:**
   - Ve a: `https://albatros-presentacion.vercel.app/admin`
   - Inicia sesión

2. **Abre la consola del navegador (F12)**

3. **Ejecuta este código en la consola:**
```javascript
// Obtener contenido actual
fetch('https://albatros-backend-aurelio104-5f63c813.koyeb.app/api/content')
  .then(r => r.json())
  .then(data => {
    console.log('Contenido obtenido:', data);
    console.log('Widgets:', data.widgets?.length || 0);
    
    // Copiar al portapapeles
    const jsonString = JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(jsonString).then(() => {
      console.log('✅ Contenido copiado al portapapeles');
      console.log('Ahora ve a la pestaña "Presentaciones" y guárdalo manualmente');
    });
  })
  .catch(err => console.error('Error:', err));
```

4. **Guarda la presentación:**
   - Ve a la pestaña "📚 Presentaciones"
   - Haz clic en "💾 Guardar Presentación Actual"
   - El contenido ya está cargado, solo dale un nombre y guarda

## Método 3: Usando curl (Línea de comandos)

```bash
# Obtener contenido
curl -s "https://albatros-backend-aurelio104-5f63c813.koyeb.app/api/content" > contenido-actual.json

# Verificar que tiene widgets
cat contenido-actual.json | grep -o '"widgets":\[' | wc -l

# Ver cantidad de widgets
cat contenido-actual.json | grep -o '"id":' | wc -l
```

Luego puedes usar el panel de administración para cargar este archivo.

## Método 4: Desde el Backend Directamente

Si tienes acceso SSH al servidor Koyeb:

```bash
# Conectarse al servidor
# (usando Koyeb CLI o SSH)

# Ver contenido actual
cat /app/data/content.json

# Crear presentación manualmente
cd /app
node -e "
const fs = require('fs');
const content = JSON.parse(fs.readFileSync('data/content.json', 'utf-8'));
const presentation = {
  id: 'presentacion-1',
  name: 'Presentación 1',
  timestamp: new Date().toISOString(),
  version: '1.0',
  content: content
};
fs.mkdirSync('data/presentations', { recursive: true });
fs.writeFileSync('data/presentations/presentacion-1.json', JSON.stringify(presentation, null, 2));
console.log('✅ Presentación guardada');
"
```

## Verificar que se Recuperó Correctamente

1. Ve al panel de administración
2. Haz clic en "📚 Presentaciones"
3. Deberías ver "Presentación 1" en la lista
4. Haz clic en "📂 Cargar" para verificar que funciona

## Notas Importantes

- El script guarda la presentación en: `backend/data/presentations/`
- Si hay 0 widgets, significa que la presentación en producción está vacía
- Siempre se crea un backup automático antes de cargar una presentación
- Puedes tener múltiples presentaciones guardadas
