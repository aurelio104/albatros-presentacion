# 🔍 Cómo Verificar el Almacenamiento en Koyeb

## ✅ Verificación desde el Admin Panel

1. **Ve al panel de administración**
2. **Haz clic en la pestaña "📚 Presentaciones"**
3. **Desplázate hacia abajo** hasta ver la sección "🔍 Verificación de Almacenamiento"
4. **Haz clic en "🔍 Verificar Almacenamiento"**

El sistema verificará:
- ✅ Disponibilidad del almacenamiento
- ✅ Directorios (data, presentations, backups, images, files)
- ✅ Presentaciones guardadas (nombre, widgets, tamaño, fecha)
- ✅ Imágenes almacenadas
- ✅ Backups creados
- ✅ Contenido actual

## 📊 Información que Verás

### Estado del Almacenamiento
- **Base**: Ruta del almacenamiento (`/app/storage` en Koyeb)
- **Modo**: Koyeb (Volumen persistente) o Local/Desarrollo

### Presentaciones
Para cada presentación verás:
- 📄 Nombre
- ID
- Número de widgets
- Tamaño del archivo
- Versión
- Fecha de creación

### Ejemplo de Resultado

```
✅ Almacenamiento Disponible
📍 Base: /app/storage
🔧 Modo: Koyeb (Volumen persistente)

📁 Directorios
✅ data
✅ presentations
✅ backups
✅ images
✅ files

📚 Presentaciones (1)
📄 Presentacion 1
   ID: presentacion-1
   Widgets: 18
   Tamaño: 245.67 KB
   Versión: 1.0
   Fecha: 22/01/2026, 00:00

🖼️ Imágenes (45)
💾 Backups (3)
📄 Contenido Actual: ✅ Existe (123.45 KB)
```

## 🔧 Verificación desde la API

También puedes verificar directamente desde la API:

```bash
# Verificar todo el almacenamiento
curl https://albatros-backend-aurelio104-5f63c813.koyeb.app/api/verify

# Verificar una presentación específica
curl https://albatros-backend-aurelio104-5f63c813.koyeb.app/api/verify/presentation/presentacion-1
```

## ✅ Confirmación de Guardado

Si la presentación "Presentacion 1" se guardó correctamente, deberías ver:

1. **En el Admin Panel:**
   - Presentación listada en "📚 Gestión de Presentaciones"
   - Nombre: "Presentacion 1"
   - 18 widgets
   - Fecha: 22 de enero de 2026, 00:00

2. **En la Verificación:**
   - ✅ Almacenamiento disponible
   - ✅ Directorio `presentations` existe
   - ✅ Archivo `presentacion-1.json` existe
   - ✅ 18 widgets en la presentación
   - ✅ Tamaño del archivo > 0 KB

## 🚨 Si Algo No Funciona

1. **Verifica que el volumen esté montado:**
   ```bash
   koyeb volume get present
   ```
   Debe mostrar: `attached` al servicio `449589f6`

2. **Verifica la variable de entorno:**
   ```bash
   koyeb service get 449589f6
   ```
   Debe tener: `STORAGE_PATH=/app/storage`

3. **Revisa los logs del servicio:**
   ```bash
   koyeb service logs 449589f6
   ```
   Busca: `✅ Almacenamiento inicializado en: /app/storage`

4. **Vuelve a guardar la presentación** desde el admin panel
