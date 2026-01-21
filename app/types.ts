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

export interface WidgetData {
  id: number
  title: string
  preview: string
  content: WidgetContent
  animation?: WidgetAnimation
  style?: WidgetStyle
  order?: number
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
