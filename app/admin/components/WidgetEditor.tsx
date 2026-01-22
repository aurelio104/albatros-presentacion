'use client'

import { useState, useEffect } from 'react'
import { WidgetData, WidgetCategory } from '@/app/types'
import ImageUploader from './ImageUploader'

const inputStyle = {
  width: '100%',
  padding: '0.75rem',
  border: '2px solid rgba(255, 255, 255, 0.3)',
  background: 'rgba(255, 255, 255, 0.1)',
  color: '#ffffff',
  borderRadius: '8px',
  fontSize: '1rem',
  backdropFilter: 'blur(5px)',
} as React.CSSProperties

const labelStyle = {
  display: 'block',
  marginBottom: '0.5rem',
  fontWeight: '500',
  color: '#ffffff',
} as React.CSSProperties

const headingStyle = {
  color: '#ffffff',
  fontWeight: '600',
} as React.CSSProperties

interface WidgetEditorProps {
  widget: WidgetData
  onUpdate: (widget: WidgetData) => void
}

export default function WidgetEditor({ widget, onUpdate }: WidgetEditorProps) {
  const [editedWidget, setEditedWidget] = useState<WidgetData>(widget)

  useEffect(() => {
    setEditedWidget(widget)
  }, [widget])

  const handleChange = (field: string, value: any) => {
    const updated = { ...editedWidget }
    
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      if (parent === 'content') {
        updated.content = { ...updated.content, [child]: value }
      } else if (parent === 'animation') {
        updated.animation = { 
          ...updated.animation, 
          [child]: value,
          type: updated.animation?.type || 'fadeIn',
          duration: updated.animation?.duration || 0.5,
          delay: updated.animation?.delay || 0,
        } as WidgetData['animation']
      } else if (parent === 'style') {
        updated.style = { ...updated.style, [child]: value }
      }
    } else {
      (updated as any)[field] = value
    }
    
    setEditedWidget(updated)
    onUpdate(updated)
  }

  const addImage = (imageUrl: string) => {
    const updated = {
      ...editedWidget,
      content: {
        ...editedWidget.content,
        images: [...editedWidget.content.images, imageUrl],
      },
    }
    setEditedWidget(updated)
    onUpdate(updated)
  }

  const removeImage = (index: number) => {
    const updated = {
      ...editedWidget,
      content: {
        ...editedWidget.content,
        images: editedWidget.content.images.filter((_, i) => i !== index),
      },
    }
    setEditedWidget(updated)
    onUpdate(updated)
  }

  const [uploadingAttachment, setUploadingAttachment] = useState(false)

  const handleAttachmentUpload = async (file: File) => {
    setUploadingAttachment(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
      const response = await fetch(`${backendUrl}/api/attachments/upload`, {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        throw new Error('Error al subir archivo')
      }
      
      const data = await response.json()
      if (data.success && data.attachment) {
        const attachments = editedWidget.content.attachments || []
        const updated = {
          ...editedWidget,
          content: {
            ...editedWidget.content,
            attachments: [...attachments, data.attachment],
          },
        }
        setEditedWidget(updated)
        onUpdate(updated)
        alert('Archivo adjuntado exitosamente')
      }
    } catch (error) {
      console.error('Error subiendo adjunto:', error)
      alert('Error al subir el archivo. Por favor, intenta de nuevo.')
    } finally {
      setUploadingAttachment(false)
    }
  }

  const removeAttachment = (index: number) => {
    const attachments = editedWidget.content.attachments || []
    const updated = {
      ...editedWidget,
      content: {
        ...editedWidget.content,
        attachments: attachments.filter((_, i) => i !== index),
      },
    }
    setEditedWidget(updated)
    onUpdate(updated)
  }

  const animationTypes = [
    { value: 'none', label: 'Sin animación' },
    { value: 'fadeIn', label: 'Fade In' },
    { value: 'slideUp', label: 'Slide Up' },
    { value: 'slideDown', label: 'Slide Down' },
    { value: 'slideLeft', label: 'Slide Left' },
    { value: 'slideRight', label: 'Slide Right' },
    { value: 'scale', label: 'Scale' },
    { value: 'rotate', label: 'Rotate' },
  ]

  return (
    <div>
      <h2 style={{ marginBottom: '2rem', fontSize: '1.5rem', fontWeight: '600', color: '#ffffff' }}>
        Editor de Widget
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Información Básica */}
        <div>
          <h3 style={{ ...headingStyle, marginBottom: '1rem', fontSize: '1.1rem' }}>
            Información Básica
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>
                Categoría
              </label>
              <select
                value={editedWidget.category || 'otro'}
                onChange={(e) => handleChange('category', e.target.value as WidgetCategory)}
                style={inputStyle}
              >
                <option value="operaciones">Operaciones</option>
                <option value="economico">Económico</option>
                <option value="tecnologico">Tecnológico</option>
                <option value="estrategico">Estratégico</option>
                <option value="recursos">Recursos</option>
                <option value="calidad">Calidad</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>
                Título del Widget
              </label>
              <input
                type="text"
                value={editedWidget.title}
                onChange={(e) => handleChange('title', e.target.value)}
                style={inputStyle}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)'
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                }}
              />
            </div>

            <div>
              <label style={labelStyle}>Modo de Visualización</label>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem',
                marginTop: '0.5rem',
                padding: '1rem',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem',
                  cursor: 'pointer',
                  color: '#ffffff',
                  fontSize: '1rem',
                  fontWeight: '500'
                }}>
                  <input
                    type="checkbox"
                    checked={(editedWidget.displayMode || 'resumen') === 'resumen'}
                    onChange={(e) => {
                      handleChange('displayMode', e.target.checked ? 'resumen' : 'completo')
                    }}
                    style={{
                      width: '24px',
                      height: '24px',
                      cursor: 'pointer',
                      accentColor: 'rgba(59, 130, 246, 0.8)',
                    }}
                  />
                  <span>📄 Resumen</span>
                </label>
                <p style={{ 
                  fontSize: '0.85rem', 
                  color: 'rgba(255, 255, 255, 0.7)',
                  margin: 0,
                  flex: 1
                }}>
                  {(editedWidget.displayMode || 'resumen') === 'resumen' 
                    ? '✅ Mostrando resumen inteligente del contenido (ideal para archivos extensos)'
                    : '✅ Mostrando contenido completo en la tarjeta'}
                </p>
              </div>
            </div>

            <div>
                <label style={labelStyle}>
                  Resumen Inteligente (se genera automáticamente para archivos extensos)
                </label>
              <textarea
                value={editedWidget.preview}
                onChange={(e) => handleChange('preview', e.target.value)}
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)'
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                }}
                placeholder="Texto corto que se mostrará cuando el modo sea 'Resumen'"
              />
            </div>
          </div>
        </div>

        {/* Contenido Completo */}
        <div>
          <h3 style={{ ...headingStyle, marginBottom: '1rem', fontSize: '1.1rem' }}>
            Contenido Completo
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>
                Título
              </label>
              <input
                type="text"
                value={editedWidget.content.title}
                onChange={(e) => handleChange('content.title', e.target.value)}
                style={inputStyle}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)'
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                }}
              />
            </div>

            <div>
              <label style={labelStyle}>
                Descripción Completa
                {editedWidget.displayMode === 'completo' && (
                  <span style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)', marginLeft: '0.5rem' }}>
                    (se mostrará en el widget si el modo es "Completo")
                  </span>
                )}
              </label>
              <textarea
                value={editedWidget.content.description}
                onChange={(e) => handleChange('content.description', e.target.value)}
                rows={6}
                style={{ ...inputStyle, resize: 'vertical' }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)'
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                }}
                placeholder="Descripción completa que se mostrará cuando el modo sea 'Completo'"
              />
            </div>

            <div>
              <label style={labelStyle}>
                Información Adicional
              </label>
              <textarea
                value={editedWidget.content.additionalInfo || ''}
                onChange={(e) => handleChange('content.additionalInfo', e.target.value)}
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)'
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                }}
              />
            </div>
          </div>
        </div>

        {/* Imágenes */}
        <div>
          <h3 style={{ ...headingStyle, marginBottom: '1rem', fontSize: '1.1rem' }}>
            Imágenes
          </h3>
          <ImageUploader onUpload={addImage} />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: '1rem',
              marginTop: '1rem',
            }}
          >
            {editedWidget.content.images.map((img, index) => (
              <div
                key={index}
                style={{
                  position: 'relative',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                }}
              >
                <img
                  src={img}
                  alt={`Imagen ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '150px',
                    objectFit: 'cover',
                  }}
                />
                <button
                  onClick={() => removeImage(index)}
                  style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    background: 'rgba(239, 68, 68, 0.8)',
                    color: 'white',
                    border: '1px solid rgba(239, 68, 68, 1)',
                    borderRadius: '50%',
                    width: '30px',
                    height: '30px',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    backdropFilter: 'blur(5px)',
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Animación */}
        <div>
          <h3 style={{ ...headingStyle, marginBottom: '1rem', fontSize: '1.1rem' }}>
            Animación
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>
                Tipo de Animación
              </label>
              <select
                value={editedWidget.animation?.type || 'none'}
                onChange={(e) =>
                  handleChange('animation.type', e.target.value)
                }
                style={{
                  ...inputStyle,
                  cursor: 'pointer',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)'
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                }}
              >
                {animationTypes.map((type) => (
                  <option key={type.value} value={type.value} style={{ background: '#1a1a1a', color: '#ffffff' }}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>
                  Duración (segundos)
                </label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={editedWidget.animation?.duration || 0.5}
                  onChange={(e) =>
                    handleChange('animation.duration', parseFloat(e.target.value))
                  }
                  style={inputStyle}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)'
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                  }}
                />
              </div>

              <div>
                <label style={labelStyle}>
                  Delay (segundos)
                </label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={editedWidget.animation?.delay || 0}
                  onChange={(e) =>
                    handleChange('animation.delay', parseFloat(e.target.value))
                  }
                  style={inputStyle}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)'
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Estilos */}
        <div>
          <h3 style={{ ...headingStyle, marginBottom: '1rem', fontSize: '1.1rem' }}>
            Estilos
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>
                Color de Fondo
              </label>
              <input
                type="color"
                value={editedWidget.style?.backgroundColor || '#ffffff'}
                onChange={(e) => handleChange('style.backgroundColor', e.target.value)}
                style={{
                  width: '100%',
                  height: '50px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background: 'rgba(255, 255, 255, 0.1)',
                }}
              />
            </div>

            <div>
              <label style={labelStyle}>
                Color de Borde
              </label>
              <input
                type="color"
                value={editedWidget.style?.borderColor || '#ffffff'}
                onChange={(e) => handleChange('style.borderColor', e.target.value)}
                style={{
                  width: '100%',
                  height: '50px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background: 'rgba(255, 255, 255, 0.1)',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
