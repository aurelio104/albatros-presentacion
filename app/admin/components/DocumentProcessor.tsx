'use client'

import { useState } from 'react'
import { WidgetData, WidgetCategory } from '@/app/types'
// Estilos inline para DocumentProcessor
const glassmorphismStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '16px',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  padding: '1.5rem',
}

const buttonStyle: React.CSSProperties = {
  padding: '0.75rem 1.5rem',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontSize: '1rem',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'transform 0.2s, box-shadow 0.2s, background 0.3s',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem',
  border: '2px solid rgba(255, 255, 255, 0.3)',
  background: 'rgba(255, 255, 255, 0.1)',
  color: '#ffffff',
  borderRadius: '8px',
  fontSize: '1rem',
  backdropFilter: 'blur(5px)',
  transition: 'border-color 0.3s, background 0.3s',
}

interface DocumentProcessorProps {
  onWidgetsGenerated: (widgets: WidgetData[]) => void
}

const categoryColors: Record<WidgetCategory, string> = {
  operaciones: 'rgba(59, 130, 246, 0.3)',
  economico: 'rgba(34, 197, 94, 0.3)',
  tecnologico: 'rgba(168, 85, 247, 0.3)',
  estrategico: 'rgba(251, 146, 60, 0.3)',
  recursos: 'rgba(236, 72, 153, 0.3)',
  calidad: 'rgba(14, 165, 233, 0.3)',
  otro: 'rgba(156, 163, 175, 0.3)',
}

const categoryLabels: Record<WidgetCategory, string> = {
  operaciones: 'Operaciones',
  economico: 'Económico',
  tecnologico: 'Tecnológico',
  estrategico: 'Estratégico',
  recursos: 'Recursos',
  calidad: 'Calidad',
  otro: 'Otro',
}

export default function DocumentProcessor({ onWidgetsGenerated }: DocumentProcessorProps) {
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<{
    widgets: Array<{
      title: string
      preview: string
      description: string
      additionalInfo?: string
      category: WidgetCategory
      images: string[]
      order: number
    }>
    totalSections: number
    totalImages: number
    fileName: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [autoCreate, setAutoCreate] = useState(true) // Crear widgets automáticamente por defecto

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ]
    const validExtensions = ['.docx', '.pptx', '.xlsx']

    const isValidType = validTypes.includes(file.type) || 
                       validExtensions.some(ext => file.name.toLowerCase().endsWith(ext))

    if (!isValidType) {
      setError('Por favor selecciona un archivo Word (.docx), PowerPoint (.pptx) o Excel (.xlsx)')
      return
    }

    // Validar tamaño (50MB)
    if (file.size > 50 * 1024 * 1024) {
      setError('El archivo es demasiado grande. Máximo 50MB')
      return
    }

    setUploading(true)
    setProcessing(true)
    setError(null)
    setResult(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('autoCreate', autoCreate.toString())

    try {
      const response = await fetch('/api/process-document', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok && data.widgets) {
        setResult(data)
        
        // Si autoCreate está activado, crear widgets automáticamente
        if (autoCreate && data.widgets.length > 0) {
          const newWidgets: WidgetData[] = data.widgets.map((widget: any, index: number) => ({
            id: Date.now() + index,
            title: widget.title,
            preview: widget.preview,
            category: widget.category || 'otro',
            content: {
              title: widget.title,
              description: widget.description,
              images: widget.images || [],
              additionalInfo: widget.additionalInfo,
            },
            animation: {
              type: 'fadeIn' as const,
              duration: 0.5,
              delay: index * 0.1,
            },
            style: {
              backgroundColor: categoryColors[widget.category || 'otro'],
              borderColor: 'rgba(255, 255, 255, 0.3)',
              textColor: '#ffffff',
              borderRadius: 16,
            },
            order: widget.order ?? index,
          }))
          
          onWidgetsGenerated(newWidgets)
          setResult(null) // Limpiar resultado después de crear
        }
      } else {
        setError(data.error || data.suggestion || 'Error al procesar el documento')
      }
    } catch (error: any) {
      setError('Error al procesar el documento: ' + (error.message || 'Error desconocido'))
    } finally {
      setUploading(false)
      setProcessing(false)
    }
  }

  const generateWidgets = () => {
    if (!result) return

    const newWidgets: WidgetData[] = result.widgets.map((widget, index) => ({
      id: Date.now() + index,
      title: widget.title,
      preview: widget.preview,
      category: widget.category || 'otro',
      content: {
        title: widget.title,
        description: widget.description,
        images: widget.images || [],
        additionalInfo: widget.additionalInfo,
      },
      animation: {
        type: 'fadeIn' as const,
        duration: 0.5,
        delay: index * 0.1,
      },
      style: {
        backgroundColor: categoryColors[widget.category || 'otro'],
        borderColor: 'rgba(255, 255, 255, 0.3)',
        textColor: '#ffffff',
        borderRadius: 16,
      },
      order: widget.order ?? index,
    }))

    onWidgetsGenerated(newWidgets)
    setResult(null)
    setError(null)
  }

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem', fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)', fontWeight: '600', color: '#ffffff' }}>
        🤖 Procesador Inteligente de Documentos
      </h2>
      <p style={{ marginBottom: '1rem', color: 'rgba(255, 255, 255, 0.8)', fontSize: 'clamp(0.9rem, 1.8vw, 1rem)' }}>
        Sube documentos Word, Excel o PowerPoint y la IA analizará completamente el contenido, 
        detectará títulos y secciones, extraerá imágenes, y creará automáticamente la presentación completa.
      </p>
      <p style={{ marginBottom: '2rem', color: 'rgba(255, 255, 255, 0.7)', fontSize: 'clamp(0.85rem, 1.5vw, 0.9rem)', fontStyle: 'italic' }}>
        💡 Cada título o sección se convertirá en un widget con su contenido correspondiente.
      </p>
      
      {/* Opción de creación automática */}
      <div style={{ marginBottom: '2rem', ...glassmorphismStyle, padding: '1rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', color: '#ffffff' }}>
          <input
            type="checkbox"
            checked={autoCreate}
            onChange={(e) => setAutoCreate(e.target.checked)}
            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
          />
          <span style={{ fontSize: 'clamp(0.9rem, 1.8vw, 1rem)' }}>
            ✅ Crear widgets automáticamente después del análisis
          </span>
        </label>
      </div>

      <div
        style={{
          ...glassmorphismStyle,
          border: '2px dashed rgba(255, 255, 255, 0.3)',
          padding: '3rem',
          textAlign: 'center',
          transition: 'all 0.3s',
          cursor: uploading || processing ? 'wait' : 'pointer',
          position: 'relative',
        }}
        onDragOver={(e) => {
          e.preventDefault()
          if (!uploading && !processing) {
            e.currentTarget.style.borderColor = '#667eea'
            e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)'
          }
        }}
        onDragLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
        }}
        onDrop={(e) => {
          e.preventDefault()
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
          
          const file = e.dataTransfer.files[0]
          if (file) {
            const input = document.createElement('input')
            input.type = 'file'
            input.accept = '.docx,.pptx'
            const dataTransfer = new DataTransfer()
            dataTransfer.items.add(file)
            input.files = dataTransfer.files
            handleFileSelect({ target: input } as any)
          }
        }}
      >
        <input
          type="file"
          accept=".docx,.pptx"
          onChange={handleFileSelect}
          disabled={uploading || processing}
          style={{ display: 'none' }}
          id="document-upload"
        />
        <label
          htmlFor="document-upload"
          style={{
            cursor: uploading || processing ? 'wait' : 'pointer',
            display: 'block',
          }}
        >
          {processing ? (
            <div>
              <div style={{
                width: '50px',
                height: '50px',
                border: '4px solid rgba(255,255,255,0.3)',
                borderTop: '4px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 1rem'
              }} />
              <p style={{ margin: 0, color: '#667eea', fontWeight: '600', fontSize: 'clamp(1rem, 2vw, 1.1rem)' }}>
                Procesando con IA...
              </p>
              <p style={{ margin: '0.5rem 0 0 0', color: 'rgba(255, 255, 255, 0.7)', fontSize: 'clamp(0.8rem, 1.5vw, 0.9rem)' }}>
                Extrayendo contenido y categorizando...
              </p>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
              <p style={{ margin: 0, color: '#ffffff', fontSize: 'clamp(1rem, 2vw, 1.1rem)', fontWeight: '600' }}>
                Arrastra un documento aquí o haz clic para seleccionar
              </p>
              <p style={{ margin: '0.5rem 0 0 0', color: 'rgba(255, 255, 255, 0.8)', fontSize: 'clamp(0.8rem, 1.5vw, 0.9rem)' }}>
                Formatos: Word (.docx), Excel (.xlsx), PowerPoint (.pptx) - Máximo 50MB
              </p>
            </div>
          )}
        </label>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>

      {error && (
        <div
          style={{
            marginTop: '1rem',
            padding: '1rem',
            background: 'rgba(239, 68, 68, 0.3)',
            color: '#ffdddd',
            borderRadius: '8px',
            border: '1px solid rgba(239, 68, 68, 0.5)',
            backdropFilter: 'blur(10px)',
          }}
        >
          {error}
        </div>
      )}

      {result && !autoCreate && (
        <div
          style={{
            ...glassmorphismStyle,
            marginTop: '2rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 'clamp(1.1rem, 2vw, 1.3rem)', fontWeight: '600', color: '#ffffff' }}>
                📊 Resultados del Procesamiento
              </h3>
              <p style={{ margin: '0.5rem 0 0 0', color: 'rgba(255, 255, 255, 0.8)', fontSize: 'clamp(0.9rem, 1.8vw, 1rem)' }}>
                Archivo: <strong style={{ color: '#ffffff' }}>{result.fileName}</strong>
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div
                style={{
                  padding: '0.5rem 1rem',
                  background: 'rgba(59, 130, 246, 0.3)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: '#ffffff',
                  fontWeight: '600',
                }}
              >
                {result.totalSections} secciones
              </div>
              {result.totalImages > 0 && (
                <div
                  style={{
                    padding: '0.5rem 1rem',
                    background: 'rgba(34, 197, 94, 0.3)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: '#ffffff',
                    fontWeight: '600',
                  }}
                >
                  {result.totalImages} imágenes
                </div>
              )}
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ marginBottom: '0.5rem', color: '#ffffff', fontSize: 'clamp(1rem, 2vw, 1.1rem)' }}>
              Widgets detectados ({result.widgets.length}):
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '400px', overflowY: 'auto' }}>
              {result.widgets.map((widget, index) => (
                <div
                  key={index}
                  style={{
                    padding: '1rem',
                    background: 'rgba(0, 0, 0, 0.2)',
                    borderRadius: '8px',
                    border: `1px solid ${categoryColors[widget.category || 'otro']}`,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ fontWeight: '600', color: '#ffffff', fontSize: 'clamp(1rem, 2vw, 1.1rem)' }}>
                      {widget.title}
                    </div>
                    {widget.category && (
                      <div
                        style={{
                          padding: '0.25rem 0.75rem',
                          background: categoryColors[widget.category as WidgetCategory] || categoryColors.otro,
                          borderRadius: '12px',
                          fontSize: 'clamp(0.7rem, 1.5vw, 0.8rem)',
                          color: '#ffffff',
                          fontWeight: '600',
                        }}
                      >
                        {categoryLabels[widget.category as WidgetCategory] || categoryLabels.otro}
                      </div>
                    )}
                  </div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 'clamp(0.85rem, 1.5vw, 0.9rem)', marginBottom: '0.5rem' }}>
                    {widget.preview}
                  </div>
                  {widget.images && widget.images.length > 0 && (
                    <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 'clamp(0.75rem, 1.5vw, 0.8rem)' }}>
                      📷 {widget.images.length} imagen(es)
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={generateWidgets}
            style={{
              ...buttonStyle,
              width: '100%',
              padding: '1rem',
              fontSize: 'clamp(1rem, 2vw, 1.1rem)',
            }}
          >
            ✅ Crear {result.widgets.length} Widgets
          </button>
        </div>
      )}
    </div>
  )
}
