# Cómo Agregar PDFs y Excel con Vista Previa

## 🎯 Objetivo

Permitir agregar archivos PDF y Excel a los widgets, mostrando solo una **vista previa** del contenido, no el archivo completo.

## 📋 Funcionalidad Propuesta

### Para PDFs:
- **Subir PDF** → Se guarda en el servidor
- **Generar vista previa** → Primera página del PDF como imagen
- **Mostrar en widget** → Vista previa clickeable que abre el PDF completo

### Para Excel:
- **Subir Excel** → Se guarda en el servidor
- **Generar vista previa** → Primera hoja como imagen o tabla HTML
- **Mostrar en widget** → Vista previa clickeable que abre el Excel completo

## 🔧 Implementación Propuesta

### 1. Extender Tipos TypeScript

```typescript
// app/types.ts
export interface WidgetContent {
  title: string
  description: string
  images: string[]  // Imágenes normales
  attachments?: {   // NUEVO: Archivos adjuntos
    pdfs?: Array<{
      url: string           // URL del PDF completo
      previewUrl: string    // URL de la imagen de vista previa (primera página)
      filename: string
    }>
    excels?: Array<{
      url: string           // URL del Excel completo
      previewUrl: string    // URL de la imagen/tabla de vista previa (primera hoja)
      filename: string
    }>
  }
  additionalInfo?: string
}
```

### 2. Componente para Subir PDFs/Excel

**Nuevo componente: `FileAttachmentUploader.tsx`**
- Similar a `ImageUploader.tsx`
- Acepta PDFs y Excel
- Genera vista previa automáticamente
- Muestra preview antes de subir

### 3. Backend: Generar Vista Previa

**Ruta nueva: `/api/generate-preview`**
- Recibe PDF o Excel
- Para PDF: Usa `pdf-lib` o `pdf2pic` para convertir primera página a imagen
- Para Excel: Usa `xlsx` para leer primera hoja y generar imagen o HTML

### 4. Mostrar en Widget

**En `WidgetGrid.tsx` y `InfoModal.tsx`:**
- Mostrar vista previa del PDF/Excel
- Al hacer clic, abrir el archivo completo en nueva pestaña
- Icono indicando el tipo de archivo

## 🎨 Interfaz de Usuario

### En el Editor de Widget:
```
┌─────────────────────────────────────┐
│ 📎 Archivos Adjuntos                │
├─────────────────────────────────────┤
│ [Subir PDF] [Subir Excel]          │
│                                     │
│ 📄 documento.pdf                    │
│ [Vista Previa] [Eliminar]           │
│                                     │
│ 📊 datos.xlsx                       │
│ [Vista Previa] [Eliminar]          │
└─────────────────────────────────────┘
```

### En el Widget (Frontend):
```
┌─────────────────────────────────────┐
│ Título del Widget                   │
│                                     │
│ Contenido del widget...             │
│                                     │
│ 📄 Ver Documento PDF                │
│ [Vista Previa]                      │
│                                     │
│ 📊 Ver Hoja de Cálculo              │
│ [Vista Previa]                      │
└─────────────────────────────────────┘
```

## 🔄 Flujo Completo

### Para PDF:
1. Usuario sube PDF → `FileAttachmentUploader`
2. Backend recibe PDF → Guarda en `public/files/`
3. Backend genera preview → Convierte primera página a PNG
4. Guarda preview en `public/images/previews/`
5. Retorna: `{ url: '/files/documento.pdf', previewUrl: '/images/previews/documento-preview.png' }`
6. Widget muestra preview → Al hacer clic, abre PDF completo

### Para Excel:
1. Usuario sube Excel → `FileAttachmentUploader`
2. Backend recibe Excel → Guarda en `public/files/`
3. Backend genera preview → Lee primera hoja, genera imagen o HTML
4. Guarda preview en `public/images/previews/`
5. Retorna: `{ url: '/files/datos.xlsx', previewUrl: '/images/previews/datos-preview.png' }`
6. Widget muestra preview → Al hacer clic, descarga Excel completo

## 📦 Dependencias Necesarias

### Backend:
```json
{
  "pdf2pic": "^2.1.4",      // Para convertir PDF a imagen
  "canvas": "^2.11.2",       // Para renderizar Excel a imagen
  "xlsx": "^0.18.5"          // Ya existe, para leer Excel
}
```

### Frontend:
```json
{
  "react-pdf": "^7.5.1"      // Para mostrar PDFs en el navegador (opcional)
}
```

## ✅ Ventajas de esta Implementación

1. **Ligero**: Solo se muestra vista previa, no el archivo completo
2. **Rápido**: Carga más rápido que mostrar el archivo completo
3. **Funcional**: Usuario puede ver preview y descargar/abrir completo si necesita
4. **Consistente**: Mismo patrón que las imágenes actuales

## 🚀 Próximos Pasos

1. ✅ Crear sistema de backup
2. ⏳ Implementar `FileAttachmentUploader` component
3. ⏳ Crear ruta backend `/api/generate-preview`
4. ⏳ Actualizar tipos TypeScript
5. ⏳ Actualizar `WidgetGrid` y `InfoModal` para mostrar attachments
6. ⏳ Probar con archivos reales
