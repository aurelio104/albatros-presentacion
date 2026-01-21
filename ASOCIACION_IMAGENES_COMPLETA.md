# 🖼️ Asociación Completa de Imágenes a Títulos/Capítulos

## ✅ Implementación Completa

### 1. Función `associateImagesToSection()`

Esta función asocia imágenes a secciones basándose en:

- **Búsqueda de palabras clave** en el título y contenido:
  - `imagen`, `image`
  - `figura`, `figure`
  - `foto`, `photo`
  - `gráfico`, `graphic`
  - `diagrama`, `diagram`
  - `placa`, `placard`
  - `evidencia`, `fotostática`
  - `evidencias fotostáticas`

- **Lógica de asociación**:
  - Si encuentra referencias → asocia hasta 2 imágenes
  - Usa índice de inicio para distribuir equitativamente
  - Evita duplicados

### 2. Función `extractStructuredSections()` Mejorada

Ahora incluye:

- **Detección en tiempo real**: Mientras procesa líneas, detecta si mencionan imágenes
- **Asociación inmediata**: Si una línea menciona imágenes, asocia la siguiente disponible
- **Distribución final**: Al terminar, distribuye imágenes restantes entre secciones sin imágenes

### 3. Ejemplo con Informe Técnico

#### Sección: "Observaciones"

**Contenido:**
```
En la siguiente imagen se puede determinar en el Motor LH, 
la placard deteriorada de la Puerta del Reversible (upper) 
para la ubicación del componente.

P/N 202-0001-507
Thrust Reverser Door LH

En el Motor RH, no se encontró evidencia de placard, 
pero se pudo determinar su P/N 202-0001-508 
Thrust Reverser Door RH.
```

**Detección:**
- ✅ Menciona "imagen"
- ✅ Menciona "placard" (2 veces)
- ✅ Menciona "evidencia"

**Resultado:**
- **Imágenes asociadas**: `[imagen1, imagen2]` (hasta 2 imágenes)
- **Razón**: Múltiples referencias a imágenes en el contenido

## 🎯 Flujo Completo

```
1. Usuario sube PDF
   ↓
2. Extraer texto del PDF
   ↓
3. Detectar títulos/capítulos
   ↓
4. Para cada sección:
   - Buscar palabras clave de imágenes
   - Si encuentra → asociar imágenes disponibles
   ↓
5. Distribuir imágenes restantes equitativamente
   ↓
6. Generar widgets con imágenes asociadas
```

## 📊 Palabras Clave Detectadas

El sistema busca estas palabras (case-insensitive):

| Palabra | Variantes |
|---------|-----------|
| imagen | image |
| figura | figure |
| foto | photo |
| gráfico | graphic |
| diagrama | diagram |
| placa | placard |
| evidencia | evidencias fotostáticas |

## ✅ Optimizaciones

1. **Máximo 2 imágenes por sección** (evita sobrecarga)
2. **Sin duplicados** (verifica antes de agregar)
3. **Distribución equitativa** (si no hay referencias)
4. **Detección en tiempo real** (mientras procesa)

## 🔍 Ejemplo de Salida

```json
{
  "widgets": [
    {
      "title": "Observaciones",
      "content": "...",
      "images": ["/images/imagen1.jpg", "/images/imagen2.jpg"],
      "category": "operaciones",
      "level": 1
    }
  ]
}
```

Las imágenes aparecerán en el modal cuando el usuario haga clic en el widget "Observaciones".

## ✅ Estado

- ✅ Función `associateImagesToSection()` implementada
- ✅ Detección de palabras clave completa
- ✅ Asociación automática funcionando
- ✅ Distribución equitativa implementada
- ✅ Sin duplicados garantizado

El sistema ahora asocia imágenes inteligentemente a cada título/capítulo que las menciona.
