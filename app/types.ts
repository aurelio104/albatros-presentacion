export interface FileAttachment {
  id: string
  url: string
  previewUrl?: string // URL de vista previa (imagen para PDF, thumbnail para otros)
  filename: string
  type: 'word' | 'excel' | 'pdf' | 'image'
  size?: number
  uploadedAt?: string
}

export interface WidgetContent {
  title: string
  description: string
  images: string[]
  additionalInfo?: string
  attachments?: FileAttachment[] // Archivos adjuntos (Word, Excel, PDF, imágenes)
}

export interface WidgetAnimation {
  type: 'fadeIn' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scale' | 'rotate' | 'none'
  duration: number
  delay: number
}

export interface WidgetStyle {
  backgroundColor?: string
  borderColor?: string
  textColor?: string
  borderRadius?: number
  backgroundImage?: string // URL de imagen de fondo (para PowerPoint)
  backgroundSize?: 'cover' | 'contain' | 'auto' // Tamaño del fondo
  backgroundPosition?: string // Posición del fondo
  fullPageImage?: string // URL de imagen completa de la página/diapositiva (renderizada exactamente igual al original)
}

export type WidgetCategory = 
  | 'operaciones' 
  | 'economico' 
  | 'tecnologico' 
  | 'estrategico' 
  | 'recursos' 
  | 'calidad' 
  | 'otro'

export type WidgetDisplayMode = 'completo' | 'resumen'

export interface WidgetData {
  id: number
  title: string
  preview: string
  content: WidgetContent
  category?: WidgetCategory
  animation?: WidgetAnimation
  style?: WidgetStyle
  order?: number
  displayMode?: WidgetDisplayMode // 'completo' muestra todo, 'resumen' muestra solo preview
}

export interface AppSettings {
  videoBackground: string
  logo: {
    src: string
    position: 'top' | 'center' | 'bottom'
    size: number
  }
  overlay: {
    opacity: number
    color: string
  }
  isVisible?: boolean // Control de visibilidad del proyecto (true = visible, false = oculto)
}

export interface AppContent {
  widgets: WidgetData[]
  settings: AppSettings
}
