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
    category: WidgetCategory
    widgets: Array<{
      title: string
      preview: string
      description: string
      additionalInfo?: string
    }>
    rawText: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ]
    const validExtensions = ['.docx', '.pptx']

    const isValidType = validTypes.includes(file.type) || 
                       validExtensions.some(ext => file.name.toLowerCase().endsWith(ext))

    if (!isValidType) {
      setError('Por favor selecciona un archivo Word (.docx) o PowerPoint (.pptx)')
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

    try {
      const response = await fetch('/api/process-document', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
      } else {
        setError(data.error || 'Error al procesar el documento')
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
      category: result.category,
      content: {
        title: widget.title,
        description: widget.description,
        images: [],
        additionalInfo: widget.additionalInfo,
      },
      animation: {
        type: 'fadeIn' as const,
        duration: 0.5,
        delay: index * 0.1,
      },
      style: {
        backgroundColor: categoryColors[result.category],
        borderColor: 'rgba(255, 255, 255, 0.3)',
        textColor: '#ffffff',
        borderRadius: 16,
      },
      order: index,
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
      <p style={{ marginBottom: '2rem', color: 'rgba(255, 255, 255, 0.8)', fontSize: 'clamp(0.9rem, 1.8vw, 1rem)' }}>
        Sube documentos Word o PowerPoint y la IA extraerá automáticamente el contenido, 
        lo categorizará (operaciones, económico, tecnológico, etc.) y creará widgets organizados.
      </p>

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
                Formatos soportados: Word (.docx) y PowerPoint (.pptx) - Máximo 50MB
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

      {result && (
        <div
          style={{
            ...glassmorphismStyle,
            marginTop: '2rem',
            border: `2px solid ${categoryColors[result.category]}`,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 'clamp(1.1rem, 2vw, 1.3rem)', fontWeight: '600', color: '#ffffff' }}>
                📊 Resultados del Procesamiento
              </h3>
              <p style={{ margin: '0.5rem 0 0 0', color: 'rgba(255, 255, 255, 0.8)', fontSize: 'clamp(0.9rem, 1.8vw, 1rem)' }}>
                Categoría detectada: <strong style={{ color: '#ffffff' }}>{categoryLabels[result.category]}</strong>
              </p>
            </div>
            <div
              style={{
                padding: '0.5rem 1rem',
                background: categoryColors[result.category],
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: '#ffffff',
                fontWeight: '600',
              }}
            >
              {result.widgets.length} widgets
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ marginBottom: '0.5rem', color: '#ffffff', fontSize: 'clamp(1rem, 2vw, 1.1rem)' }}>
              Vista previa del contenido:
            </h4>
            <div
              style={{
                padding: '1rem',
                background: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '8px',
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: 'clamp(0.85rem, 1.5vw, 0.95rem)',
                maxHeight: '200px',
                overflowY: 'auto',
                lineHeight: '1.6',
              }}
            >
              {result.rawText}...
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ marginBottom: '0.5rem', color: '#ffffff', fontSize: 'clamp(1rem, 2vw, 1.1rem)' }}>
              Widgets generados:
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {result.widgets.map((widget, index) => (
                <div
                  key={index}
                  style={{
                    padding: '1rem',
                    background: 'rgba(0, 0, 0, 0.2)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <div style={{ fontWeight: '600', color: '#ffffff', marginBottom: '0.25rem' }}>
                    {widget.title}
                  </div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 'clamp(0.85rem, 1.5vw, 0.9rem)' }}>
                    {widget.preview}
                  </div>
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
