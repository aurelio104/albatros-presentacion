'use client'

import { useState, useEffect } from 'react'
import { WidgetData } from '@/app/types'
import ImageUploader from './ImageUploader'

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
      <h2 style={{ marginBottom: '2rem', fontSize: '1.5rem', fontWeight: '600' }}>
        Editor de Widget
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Información Básica */}
        <div>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '600' }}>
            Información Básica
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Título del Widget
              </label>
              <input
                type="text"
                value={editedWidget.title}
                onChange={(e) => handleChange('title', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Vista Previa
              </label>
              <textarea
                value={editedWidget.preview}
                onChange={(e) => handleChange('preview', e.target.value)}
                rows={2}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  resize: 'vertical',
                }}
              />
            </div>
          </div>
        </div>

        {/* Contenido Completo */}
        <div>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '600' }}>
            Contenido Completo
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Título
              </label>
              <input
                type="text"
                value={editedWidget.content.title}
                onChange={(e) => handleChange('content.title', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Descripción
              </label>
              <textarea
                value={editedWidget.content.description}
                onChange={(e) => handleChange('content.description', e.target.value)}
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  resize: 'vertical',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Información Adicional
              </label>
              <textarea
                value={editedWidget.content.additionalInfo || ''}
                onChange={(e) => handleChange('content.additionalInfo', e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  resize: 'vertical',
                }}
              />
            </div>
          </div>
        </div>

        {/* Imágenes */}
        <div>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '600' }}>
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
                  border: '2px solid #e0e0e0',
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
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '30px',
                    height: '30px',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
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
          <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '600' }}>
            Animación
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Tipo de Animación
              </label>
              <select
                value={editedWidget.animation?.type || 'none'}
                onChange={(e) =>
                  handleChange('animation.type', e.target.value)
                }
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                }}
              >
                {animationTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
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
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
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
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Estilos */}
        <div>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '600' }}>
            Estilos
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Color de Fondo
              </label>
              <input
                type="color"
                value={editedWidget.style?.backgroundColor || '#ffffff'}
                onChange={(e) => handleChange('style.backgroundColor', e.target.value)}
                style={{
                  width: '100%',
                  height: '50px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Color de Borde
              </label>
              <input
                type="color"
                value={editedWidget.style?.borderColor || '#ffffff'}
                onChange={(e) => handleChange('style.borderColor', e.target.value)}
                style={{
                  width: '100%',
                  height: '50px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
