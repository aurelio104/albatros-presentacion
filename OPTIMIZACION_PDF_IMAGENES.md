# 🎯 Optimización: Asociación de Imágenes a Títulos/Capítulos

## ✅ Mejoras Implementadas

### 1. Asociación Inteligente de Imágenes

Las imágenes ahora se asocian automáticamente a cada título/capítulo basándose en:

#### **Detección por Referencias en el Texto**
- Busca palabras clave: `imagen`, `figura`, `foto`, `gráfico`, `diagrama`, `placa`, `placard`
- Si una sección menciona imágenes, se asocian automáticamente

#### **Distribución Equitativa**
- Si hay imágenes disponibles, se distribuyen entre las secciones
- Cada sección puede tener hasta 2 imágenes asociadas
- Las secciones sin imágenes mencionadas también reciben imágenes si están disponibles

### 2. Mejora en la Detección de Estructura

#### **Detección de Títulos Mejorada**
- Reconoce títulos en mayúsculas
- Detecta títulos seguidos de dos puntos (`:`)
- Identifica títulos comunes: `INFORME`, `ANÁLISIS`, `CONCLUSIÓN`, etc.
- Detecta números romanos y numeración

#### **Análisis Contextual**
- Analiza líneas anteriores y siguientes
- Verifica longitud del texto
- Confirma que hay contenido después del título

### 3. Manejo de Errores Mejorado

#### **Errores Específicos para PDFs**
- Si el PDF no se puede procesar, muestra un error claro
- Sugiere que el PDF debe contener texto (no solo imágenes escaneadas)
- Incluye detalles del error para debugging

#### **Fallback Inteligente**
- Si falla la extracción completa, intenta extraer solo texto
- Crea secciones básicas si no se detecta estructura
- Nunca falla completamente, siempre retorna algo útil

## 📊 Ejemplo con Informe Técnico

### Estructura Detectada:

```
Nivel 1: "Informe Técnico de Reversibles de Motores C560"
  └─ Imágenes: [] (no menciona imágenes explícitamente)
  └─ Contenido: Datos de aeronave, grietas detectadas

Nivel 1: "Análisis de Falla"
  └─ Imágenes: [] (no menciona imágenes)
  └─ Contenido: Explicación de fatiga del material

Nivel 1: "Acciones Preventivas / Correctivas"
  └─ Imágenes: [] (no menciona imágenes)
  └─ Contenido: Inspecciones, NDT, manuales

Nivel 1: "Conclusión"
  └─ Imágenes: [] (no menciona imágenes)
  └─ Contenido: No es viable la reparación

Nivel 1: "Recomendación"
  └─ Imágenes: [] (no menciona imágenes)
  └─ Contenido: Adquisición de componentes

Nivel 1: "Observaciones"
  └─ Imágenes: [imagen1, imagen2] (menciona "imagen" y "placard")
  └─ Contenido: P/N y placards, referencia a imagen
```

### Lógica de Asociación:

1. **Búsqueda de Referencias**: El sistema busca palabras como "imagen", "figura", "placard" en el contenido
2. **Asociación Automática**: Si encuentra referencias, asocia imágenes disponibles
3. **Distribución Equitativa**: Si hay imágenes sin asociar, las distribuye entre secciones

## 🔧 Optimizaciones:

### 1. Extracción de Texto Optimizada
- Usa `pdf-parse` con opciones optimizadas
- Extrae todas las páginas
- Maneja errores gracefully

### 2. Detección de Estructura Mejorada
- Función `detectTitleLevel()` mejorada
- Análisis contextual más preciso
- Mejor limpieza de títulos

### 3. Asociación de Imágenes
- Función `associateImagesToSection()` nueva
- Busca referencias en el texto
- Distribuye imágenes equitativamente

## 📝 Notas Técnicas

### Limitaciones Actuales

**Extracción de Imágenes de PDFs:**
- `pdf-parse` no extrae imágenes directamente del PDF
- Las imágenes deben estar disponibles por separado o mencionadas en el texto
- Para extraer imágenes reales del PDF, se necesitaría `pdf-lib` o `pdfjs-dist`

### Soluciones Futuras

1. **Usar pdf-lib para extraer imágenes**:
   ```javascript
   import { PDFDocument } from 'pdf-lib'
   const pdfDoc = await PDFDocument.load(fileBuffer)
   const pages = pdfDoc.getPages()
   // Extraer imágenes de cada página
   ```

2. **Usar pdfjs-dist**:
   ```javascript
   import * as pdfjsLib from 'pdfjs-dist'
   // Extraer imágenes y texto con posicionamiento
   ```

## ✅ Estado Actual

- ✅ Asociación inteligente de imágenes a secciones
- ✅ Detección mejorada de estructura
- ✅ Manejo de errores robusto
- ✅ Distribución equitativa de imágenes
- ⚠️ Extracción de imágenes del PDF requiere librería adicional (futuro)

## 🚀 Próximos Pasos

1. **Agregar pdf-lib** para extraer imágenes reales del PDF
2. **Mejorar asociación** basándose en posición en el documento
3. **Optimizar rendimiento** para PDFs grandes
