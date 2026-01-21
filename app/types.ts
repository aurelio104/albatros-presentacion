export interface WidgetContent {
  title: string
  description: string
  images: string[]
  additionalInfo?: string
}

export interface WidgetData {
  id: number
  title: string
  preview: string
  content: WidgetContent
}
