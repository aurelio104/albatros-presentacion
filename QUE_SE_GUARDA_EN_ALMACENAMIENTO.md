# ✅ ¿Qué se Guarda en el Almacenamiento Persistente?

## 🎯 Respuesta: **SÍ, se guarda TODO**

El almacenamiento persistente en `/app/storage/` guarda **absolutamente todas las presentaciones con todos sus elementos**.

## 📦 Estructura Completa del Almacenamiento

### 1. **Presentaciones Completas** 
📍 `/app/storage/data/presentations/`

Cada presentación se guarda como un archivo JSON (`presentacion-1.json`, `presentacion-2.json`, etc.) que incluye:

```json
{
  "id": "presentacion-1",
  "name": "Presentación 1",
  "timestamp": "2024-01-22T03:51:00.000Z",
  "version": "1.0",
  "content": {
    "widgets": [
      {
        "id": 1234567890,
        "title": "Título del Widget",
        "preview": "Vista previa del contenido...",
        "content": {
          "title": "Título del Widget",
          "description": "Descripción completa con HTML e imágenes inline <img src='...' />",
          "images": [
            "https://backend-url/images/pptx-123-image1.jpg",
            "https://backend-url/images/pdf-456-image2.jpg"
          ],
          "additionalInfo": "Información adicional"
        },
        "category": "tecnologico",
        "animation": {
          "type": "fadeIn",
          "duration": 0.5,
          "delay": 0.1
        },
        "style": {
          "backgroundColor": "rgba(255, 0, 0, 0.1)",
          "borderColor": "rgba(255, 255, 255, 0.3)",
          "textColor": "#ffffff",
          "borderRadius": 16,
          "backgroundImage": "https://backend-url/images/pptx-bg-slide1.jpg",
          "backgroundSize": "cover",
          "backgroundPosition": "center",
          "fullPageImage": "https://backend-url/images/pptx-full-123-slide1.png"
        },
        "order": 1,
        "displayMode": "completo"
      }
      // ... más widgets
    ],
    "settings": {
      "videoBackground": "/videos/video1.MP4",
      "logo": {
        "src": "/images/logotB.png",
        "position": "top",
        "size": 320
      },
      "overlay": {
        "opacity": 0.4,
        "color": "rgba(0, 0, 0, 0.4)"
      }
    }
  }
}
```

**✅ Incluye:**
- ✅ Todos los widgets con TODOS sus campos
- ✅ Todas las imágenes (URLs)
- ✅ Imágenes de fondo (backgroundImage)
- ✅ Imágenes completas renderizadas (fullPageImage)
- ✅ Animaciones
- ✅ Estilos completos
- ✅ Categorías
- ✅ Orden de widgets
- ✅ Modo de visualización (resumen/completo)
- ✅ Todas las configuraciones globales (settings)

### 2. **Imágenes Físicas**
📍 `/app/storage/public/images/`

Todas las imágenes se guardan físicamente en el servidor:

```
/app/storage/public/images/
├── pptx-1234567890-image1.jpg      # Imágenes extraídas de PowerPoint
├── pptx-1234567890-image2.jpg
├── pptx-full-1234567890-slide1.png  # Imágenes completas renderizadas
├── pptx-full-1234567890-slide2.png
├── pdf-1234567890-image1.jpg        # Imágenes extraídas de PDF
├── word-1234567890-image1.jpg       # Imágenes extraídas de Word
├── xlsx-1234567890-image1.jpg       # Imágenes extraídas de Excel
├── 1234567890-uploaded-image.jpg    # Imágenes subidas manualmente
└── ...
```

**✅ Incluye:**
- ✅ Imágenes extraídas de documentos (Word, PDF, PowerPoint, Excel)
- ✅ Imágenes de fondo de diapositivas
- ✅ Imágenes completas renderizadas (fullPageImage)
- ✅ Imágenes subidas manualmente desde el admin

### 3. **Backups Automáticos**
📍 `/app/storage/data/backups/`

Se crean automáticamente antes de:
- Guardar nuevo contenido
- Cargar una presentación

```
/app/storage/data/backups/
├── content-backup-2024-01-22T03-51-00-000Z.json
├── content-backup-2024-01-22T04-00-00-000Z.json
└── ...
```

**✅ Incluye:**
- ✅ Contenido completo antes de cada cambio
- ✅ Permite recuperar versiones anteriores

### 4. **Contenido Actual**
📍 `/app/storage/data/content.json`

El contenido que se muestra actualmente en el frontend:

```json
{
  "widgets": [...],
  "settings": {...}
}
```

**✅ Incluye:**
- ✅ Widgets actuales
- ✅ Configuraciones actuales

## 🔄 Flujo de Guardado

### Cuando guardas una presentación:

1. **Frontend** (`PresentationsManager.tsx`):
   ```typescript
   body: JSON.stringify({
     name: "Presentación 1",
     content: currentContent  // ← Incluye widgets Y settings completos
   })
   ```

2. **Backend** (`presentations.js`):
   ```javascript
   const presentationData = {
     id: "presentacion-1",
     name: "Presentación 1",
     timestamp: new Date().toISOString(),
     version: "1.0",
     content  // ← Se guarda TODO el objeto content
   }
   await fs.writeFile(filePath, JSON.stringify(presentationData, null, 2))
   ```

3. **Almacenamiento**:
   - ✅ Presentación guardada en: `/app/storage/data/presentations/presentacion-1.json`
   - ✅ Imágenes ya están en: `/app/storage/public/images/`
   - ✅ Backup creado en: `/app/storage/data/backups/`

## ✅ Verificación

Para verificar que TODO se guarda correctamente:

```bash
# 1. Ver presentaciones guardadas
koyeb service exec 449589f6 -- ls -la /app/storage/data/presentations/

# 2. Ver contenido de una presentación
koyeb service exec 449589f6 -- cat /app/storage/data/presentations/presentacion-1.json

# 3. Ver imágenes guardadas
koyeb service exec 449589f6 -- ls -la /app/storage/public/images/ | head -20

# 4. Ver backups
koyeb service exec 449589f6 -- ls -la /app/storage/data/backups/
```

## 📝 Conclusión

**SÍ, se guarda TODO:**
- ✅ Todas las presentaciones con todos sus widgets
- ✅ Todas las imágenes (físicamente en el servidor)
- ✅ Todas las configuraciones
- ✅ Todos los estilos y animaciones
- ✅ Imágenes de fondo y renderizadas completas
- ✅ Backups automáticos

**Todo está en el volumen persistente `/app/storage/` y persiste entre despliegues.**
