# 🎛️ Guía del Panel de Administración

## Acceso al Panel

1. Ve a: `https://tu-dominio.com/admin`
2. Ingresa la contraseña: `albatros2024` (cambiar en producción)

## Funcionalidades

### 📝 Gestión de Widgets

#### Crear Widget
1. Ve a la pestaña "Widgets"
2. Haz clic en "+ Nuevo"
3. Se creará un widget con valores por defecto
4. Selecciónalo para editarlo

#### Editar Widget
- **Información Básica**: Título y vista previa
- **Contenido Completo**: Título, descripción e información adicional
- **Imágenes**: Sube múltiples imágenes arrastrando o seleccionando
- **Animación**: 
  - Tipo: fadeIn, slideUp, slideDown, slideLeft, slideRight, scale, rotate, none
  - Duración: 0-5 segundos
  - Delay: 0-5 segundos
- **Estilos**: Color de fondo, borde y texto

#### Eliminar Widget
- Haz clic en "×" en la lista de widgets
- Confirma la eliminación

### 🖼️ Gestión de Imágenes

1. Ve a la pestaña "Imágenes"
2. Arrastra imágenes o haz clic para seleccionar
3. Formatos soportados: JPG, PNG, WEBP, GIF
4. Tamaño máximo: 10MB
5. Las imágenes se guardan en `/public/images/`

### ⚙️ Configuración General

#### Video de Fondo
- Especifica la ruta del video (ej: `/videos/video1.MP4`)
- Coloca el video en `/public/videos/`

#### Logo
- Ruta del logo (ej: `/images/logotB.png`)
- Posición: Arriba, Centro, Abajo
- Tamaño: 100-500px

#### Overlay del Video
- Opacidad: 0-1
- Color: Selector de color

### 💾 Guardar Cambios

1. Haz todos los cambios necesarios
2. Haz clic en "💾 Guardar Cambios" (botón flotante abajo a la derecha)
3. Los cambios se aplicarán inmediatamente

## Optimizaciones Implementadas

### Rendimiento
- ✅ Lazy loading de imágenes
- ✅ Preload del video de fondo
- ✅ Animaciones con Intersection Observer
- ✅ Código optimizado y minificado

### SEO
- ✅ Meta tags dinámicos
- ✅ Contenido estructurado
- ✅ Imágenes con alt text

### UX
- ✅ Animaciones suaves
- ✅ Transiciones fluidas
- ✅ Diseño responsive
- ✅ Feedback visual inmediato

## Seguridad

⚠️ **IMPORTANTE**: Cambiar la contraseña en producción

Edita `app/admin/page.tsx`:
```typescript
const ADMIN_PASSWORD = 'tu-contraseña-segura'
```

O mejor aún, implementa autenticación real con:
- NextAuth.js
- Vercel Auth
- OAuth providers

## Estructura de Datos

El contenido se guarda en `data/content.json`:

```json
{
  "widgets": [
    {
      "id": 1,
      "title": "Título",
      "preview": "Vista previa",
      "content": {
        "title": "Título completo",
        "description": "Descripción",
        "images": ["/images/img1.jpg"],
        "additionalInfo": "Info adicional"
      },
      "animation": {
        "type": "fadeIn",
        "duration": 0.5,
        "delay": 0
      },
      "style": {
        "backgroundColor": "rgba(255, 255, 255, 0.1)",
        "borderColor": "rgba(255, 255, 255, 0.2)"
      },
      "order": 0
    }
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
```

## Tips

1. **Orden de Widgets**: Usa el campo `order` para controlar el orden
2. **Animaciones**: Usa delays diferentes para efectos escalonados
3. **Imágenes**: Optimiza las imágenes antes de subirlas (recomendado: WebP)
4. **Video**: Comprime el video para mejor rendimiento
5. **Preview**: Usa el botón "Ver Sitio" para ver cambios en tiempo real

## Solución de Problemas

### No se guardan los cambios
- Verifica que el archivo `data/content.json` tenga permisos de escritura
- Revisa la consola del navegador para errores

### Las imágenes no se muestran
- Verifica que las imágenes estén en `/public/images/`
- Asegúrate de usar rutas relativas (ej: `/images/logo.png`)

### El video no carga
- Verifica la ruta del video
- Asegúrate de que el formato sea MP4
- Verifica permisos del archivo

## Soporte

Para más ayuda, consulta:
- Documentación de Next.js
- Repositorio en GitHub
- Panel de Vercel para logs
