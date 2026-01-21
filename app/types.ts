export interface WidgetContent {
  title: string
  description: string
  images: string[]
  additionalInfo?: string
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
}

export interface AppContent {
  widgets: WidgetData[]
  settings: AppSettings
}
