# Albatros Presentación

Presentación interactiva con video de fondo y widgets informativos.

## Características

- 🎥 Video de fondo con overlay
- 🎯 Widgets interactivos con efectos hover
- 📱 Modales con información completa
- 🖼️ Soporte para múltiples imágenes
- 🎨 Diseño moderno y responsive
- ⚡ Optimizado para rendimiento

## Estructura del Proyecto

```
albatros-presentacion/
├── app/
│   ├── components/
│   │   ├── VideoBackground.tsx    # Componente del video de fondo
│   │   ├── WidgetGrid.tsx         # Grid de widgets interactivos
│   │   └── InfoModal.tsx          # Modal con información completa
│   ├── page.tsx                   # Página principal
│   ├── layout.tsx                 # Layout de la aplicación
│   ├── globals.css                # Estilos globales
│   └── types.ts                   # Tipos TypeScript
├── public/
│   ├── videos/                    # Coloca tu video aquí (background.mp4)
│   └── images/                    # Coloca tus imágenes aquí
└── package.json
```

## Desarrollo Local

### Instalación

```bash
npm install
```

### Ejecutar en Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### Build para Producción

```bash
npm run build
npm start
```

## Configuración

### Agregar Video de Fondo

1. Coloca tu video en `public/videos/background.mp4`
2. El video debe estar en formato MP4
3. Recomendado: optimizar el video para web (comprimir)

### Agregar Contenido a los Widgets

Edita el archivo `app/page.tsx` y modifica el array `widgets`:

```typescript
const widgets: WidgetData[] = [
  {
    id: 1,
    title: 'Tu Título',
    preview: 'Texto de vista previa',
    content: {
      title: 'Título Completo',
      description: 'Descripción detallada...',
      images: [
        '/images/imagen1.jpg',
        '/images/imagen2.jpg',
      ],
      additionalInfo: 'Información adicional...'
    }
  },
  // ... más widgets
]
```

## Despliegue

### Frontend (Vercel)

1. Crea un repositorio en GitHub
2. Conecta el repositorio a Vercel
3. Vercel detectará automáticamente Next.js
4. Los cambios se desplegarán automáticamente en cada push
5. Configura la variable de entorno `NEXT_PUBLIC_BACKEND_URL` con la URL de tu backend

### Backend (Koyeb)

Consulta `KOYEB_DEPLOY.md` para instrucciones detalladas de despliegue del backend en Koyeb.

## Personalización

### Colores y Estilos

Los estilos están en los componentes. Puedes modificar:
- Colores de fondo en `WidgetGrid.tsx`
- Estilos del modal en `InfoModal.tsx`
- Overlay del video en `VideoBackground.tsx`

### Agregar Más Widgets

Simplemente agrega más objetos al array `widgets` en `app/page.tsx`.

## Tecnologías Utilizadas

- **Next.js 14** - Framework React
- **TypeScript** - Tipado estático
- **React 18** - Biblioteca UI
- **CSS Modules** - Estilos (inline styles para simplicidad)

## Notas

- El video se reproduce en loop automáticamente
- Los widgets son completamente responsive
- El modal se cierra con ESC o click fuera
- Optimiza las imágenes antes de subirlas para mejor rendimiento
