'use client'

import { useState, useEffect, useRef } from 'react'
import { WidgetData } from '@/app/types'
import dynamic from 'next/dynamic'
import { ensureHttps } from '@/app/utils/imageUrl'

// Lazy load ReactQuill
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })
import 'react-quill/dist/quill.snow.css'

interface VisualWidgetEditorProps {
  widget: WidgetData
  onUpdate: (widget: WidgetData) => void
}

export default function VisualWidgetEditor({ widget, onUpdate }: VisualWidgetEditorProps) {
  const [editedWidget, setEditedWidget] = useState<WidgetData>(widget)
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState<'preview' | 'edit'>('preview')
  const previewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setEditedWidget(widget)
  }, [widget])

  // Función helper para detectar si el contenido es HTML
  const isHTML = (str: string) => {
    if (!str) return false
    return /<[a-z][\s\S]*>/i.test(str)
  }

  // Función helper para renderizar contenido (HTML o texto plano)
  const renderContent = (content: string, isPreview: boolean = false) => {
    if (!content) return null
    
    if (isHTML(content)) {
      return (
        <div
          dangerouslySetInnerHTML={{ __html: content }}
          style={{
            textAlign: 'left',
            lineHeight: '1.6',
          }}
        />
      )
    } else {
      return (
        <div
          style={{
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            textAlign: isPreview ? 'center' : 'left',
          }}
        >
          {content}
        </div>
      )
    }
  }

  const handleChange = (field: string, value: any) => {
    const updated = { ...editedWidget }
    
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      if (parent === 'content') {
        updated.content = { ...updated.content, [child]: value }
      }
    } else {
      (updated as any)[field] = value
    }
    
    setEditedWidget(updated)
    onUpdate(updated)
  }

  const moveImage = (fromIndex: number, toIndex: number) => {
    const images = [...editedWidget.content.images]
    const [moved] = images.splice(fromIndex, 1)
    images.splice(toIndex, 0, moved)
    
    const updated = {
      ...editedWidget,
      content: {
        ...editedWidget.content,
        images,
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

  const insertImageAtPosition = (imageUrl: string, position: number) => {
    const images = [...editedWidget.content.images]
    images.splice(position, 0, imageUrl)
    
    const updated = {
      ...editedWidget,
      content: {
        ...editedWidget.content,
        images,
      },
    }
    setEditedWidget(updated)
    onUpdate(updated)
  }

  // Configuración de ReactQuill
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ],
  }

  const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'align',
    'link', 'image'
  ]

  return (
    <div style={{ 
      background: 'rgba(0, 0, 0, 0.3)', 
      borderRadius: '16px', 
      padding: '2rem',
      backdropFilter: 'blur(10px)'
    }}>
      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginBottom: '2rem',
        borderBottom: '2px solid rgba(255, 255, 255, 0.2)'
      }}>
        <button
          onClick={() => setActiveTab('preview')}
          style={{
            padding: '0.75rem 1.5rem',
            background: activeTab === 'preview' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
            border: 'none',
            color: '#ffffff',
            cursor: 'pointer',
            borderRadius: '8px 8px 0 0',
            fontWeight: activeTab === 'preview' ? '600' : '400',
            transition: 'all 0.3s ease'
          }}
        >
          👁️ Vista Previa (Como se verá)
        </button>
        <button
          onClick={() => setActiveTab('edit')}
          style={{
            padding: '0.75rem 1.5rem',
            background: activeTab === 'edit' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
            border: 'none',
            color: '#ffffff',
            cursor: 'pointer',
            borderRadius: '8px 8px 0 0',
            fontWeight: activeTab === 'edit' ? '600' : '400',
            transition: 'all 0.3s ease'
          }}
        >
          ✏️ Editar Contenido
        </button>
      </div>

      {activeTab === 'preview' ? (
        /* Vista Previa - Exactamente como se verá en el frontend */
        <div 
          ref={previewRef}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${editedWidget.style?.borderColor || 'rgba(255, 255, 255, 0.2)'}`,
            borderRadius: '16px',
            padding: '2rem',
            minWidth: '280px',
            maxWidth: '320px',
            width: '100%',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
            color: editedWidget.style?.textColor || '#ffffff',
          }}
        >
          {/* Badge de categoría y modo */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            {editedWidget.category && (
              <div
                style={{
                  display: 'inline-block',
                  padding: '0.25rem 0.75rem',
                  background: 'rgba(59, 130, 246, 0.8)',
                  color: '#ffffff',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                }}
              >
                {editedWidget.category}
              </div>
            )}
            <div
              style={{
                display: 'inline-block',
                padding: '0.25rem 0.75rem',
                background: editedWidget.displayMode === 'completo' 
                  ? 'rgba(34, 197, 94, 0.8)' 
                  : 'rgba(251, 146, 60, 0.8)',
                color: '#ffffff',
                borderRadius: '12px',
                fontSize: '0.8rem',
                fontWeight: '600',
              }}
            >
              {editedWidget.displayMode === 'completo' ? '📋 Completo' : '📄 Resumen'}
            </div>
          </div>

          {/* Título */}
          <h2
            style={{
              color: editedWidget.style?.textColor || '#ffffff',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
              textAlign: 'center',
              lineHeight: '1.3',
              wordWrap: 'break-word',
            }}
          >
            {editedWidget.title}
          </h2>

          {/* Contenido según displayMode */}
          <div
            style={{
              color: editedWidget.style?.textColor ? `${editedWidget.style.textColor}dd` : 'rgba(255, 255, 255, 0.9)',
              fontSize: '1rem',
              lineHeight: '1.5',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              marginBottom: '1rem',
            }}
          >
            {editedWidget.displayMode === 'completo' ? (
              <div
                dangerouslySetInnerHTML={{
                  __html: editedWidget.content.description
                    .replace(/\n/g, '<br>')
                    .replace(/<img\s+src="([^"]+)"[^>]*>/gi, (match, src) => {
                      const httpsSrc = ensureHttps(src)
                      return `<img src="${httpsSrc}" alt="Imagen" style="max-width: 100%; height: auto; margin: 0.5rem 0; border-radius: 8px; display: block; border: 2px solid rgba(255, 255, 255, 0.3);" loading="lazy" onerror="this.style.display='none'" />`
                    })
                }}
              />
            ) : (
              renderContent(editedWidget.preview, true)
            )}
          </div>

          {/* Imágenes */}
          {editedWidget.content.images && editedWidget.content.images.length > 0 && (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '0.75rem',
              marginTop: '1rem'
            }}>
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
                    src={ensureHttps(img)}
                    alt={`Imagen ${index + 1}`}
                    style={{
                      width: '100%',
                      height: 'auto',
                      maxHeight: '200px',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      if (target.src.startsWith('http://')) {
                        target.src = ensureHttps(target.src)
                      } else {
                        target.style.display = 'none'
                      }
                    }}
                  />
                  {isEditing && (
                    <div style={{
                      position: 'absolute',
                      top: '0.5rem',
                      right: '0.5rem',
                      display: 'flex',
                      gap: '0.5rem',
                    }}>
                      {index > 0 && (
                        <button
                          onClick={() => moveImage(index, index - 1)}
                          style={{
                            background: 'rgba(59, 130, 246, 0.8)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            width: '30px',
                            height: '30px',
                            cursor: 'pointer',
                            fontSize: '1rem',
                          }}
                          title="Mover arriba"
                        >
                          ↑
                        </button>
                      )}
                      {index < editedWidget.content.images.length - 1 && (
                        <button
                          onClick={() => moveImage(index, index + 1)}
                          style={{
                            background: 'rgba(59, 130, 246, 0.8)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            width: '30px',
                            height: '30px',
                            cursor: 'pointer',
                            fontSize: '1rem',
                          }}
                          title="Mover abajo"
                        >
                          ↓
                        </button>
                      )}
                      <button
                        onClick={() => removeImage(index)}
                        style={{
                          background: 'rgba(239, 68, 68, 0.8)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          width: '30px',
                          height: '30px',
                          cursor: 'pointer',
                          fontSize: '1.2rem',
                        }}
                        title="Eliminar"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Botón para editar */}
          <button
            onClick={() => {
              setIsEditing(!isEditing)
              setActiveTab('edit')
            }}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              background: 'rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '8px',
              cursor: 'pointer',
              width: '100%',
            }}
          >
            {isEditing ? 'Finalizar Edición' : 'Editar Contenido'}
          </button>
        </div>
      ) : (
        /* Editor Visual */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Título del Widget */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              fontWeight: '500', 
              color: '#ffffff' 
            }}>
              Título del Widget
            </label>
            <input
              type="text"
              value={editedWidget.title}
              onChange={(e) => handleChange('title', e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                borderRadius: '8px',
                fontSize: '1rem',
              }}
            />
          </div>

          {/* Selector de Modo de Visualización */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              fontWeight: '500', 
              color: '#ffffff' 
            }}>
              Modo de Visualización
            </label>
            <select
              value={editedWidget.displayMode || 'resumen'}
              onChange={(e) => handleChange('displayMode', e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                borderRadius: '8px',
                fontSize: '1rem',
                cursor: 'pointer',
              }}
            >
              <option value="resumen">📄 Resumen (muestra preview corto)</option>
              <option value="completo">📋 Completo (muestra descripción completa)</option>
            </select>
            <p style={{ 
              fontSize: '0.85rem', 
              color: 'rgba(255, 255, 255, 0.7)', 
              marginTop: '0.5rem',
              padding: '0.5rem',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '6px',
            }}>
              {editedWidget.displayMode === 'completo' 
                ? '✅ El widget mostrará la descripción completa en la tarjeta'
                : '✅ El widget mostrará solo el preview (texto corto) en la tarjeta'}
            </p>
          </div>

          {/* Editor WYSIWYG para Descripción */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              fontWeight: '500', 
              color: '#ffffff' 
            }}>
              Descripción Completa (Editor Visual)
            </label>
            {typeof window !== 'undefined' && ReactQuill && (
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.95)', 
                borderRadius: '8px',
                color: '#000'
              }}>
                <ReactQuill
                  theme="snow"
                  value={editedWidget.content.description}
                  onChange={(value) => handleChange('content.description', value)}
                  modules={quillModules}
                  formats={quillFormats}
                  style={{
                    minHeight: '300px',
                  }}
                />
              </div>
            )}
          </div>

          {/* Preview corto */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              fontWeight: '500', 
              color: '#ffffff' 
            }}>
              Vista Previa (texto corto para modo Resumen)
            </label>
            <textarea
              value={editedWidget.preview}
              onChange={(e) => handleChange('preview', e.target.value)}
              rows={3}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                borderRadius: '8px',
                fontSize: '1rem',
                resize: 'vertical',
              }}
              placeholder="Texto corto que se mostrará cuando el modo sea 'Resumen'"
            />
          </div>

          {/* Gestión de Imágenes */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              fontWeight: '500', 
              color: '#ffffff' 
            }}>
              Imágenes en el Contenido (Las imágenes ya están insertadas en el texto donde se mencionan)
            </label>
            <p style={{ 
              fontSize: '0.85rem', 
              color: 'rgba(255, 255, 255, 0.7)', 
              marginBottom: '1rem',
              padding: '0.5rem',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '6px',
            }}>
              💡 Las imágenes se insertan automáticamente en el texto donde se mencionan. Puedes editarlas directamente en el editor visual arriba.
            </p>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              marginTop: '1.5rem',
              fontWeight: '500', 
              color: '#ffffff' 
            }}>
              Todas las Imágenes del Widget (Referencia)
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: '1rem',
            }}>
              {editedWidget.content.images.map((img, index) => (
                <div
                  key={index}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', index.toString())
                  }}
                  onDragOver={(e) => {
                    e.preventDefault()
                  }}
                  onDrop={(e) => {
                    e.preventDefault()
                    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'))
                    const toIndex = index
                    if (fromIndex !== toIndex) {
                      moveImage(fromIndex, toIndex)
                    }
                  }}
                  style={{
                    position: 'relative',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    cursor: 'move',
                  }}
                >
                  <img
                    src={ensureHttps(img)}
                    alt={`Imagen ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '150px',
                      objectFit: 'cover',
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      if (target.src.startsWith('http://')) {
                        target.src = ensureHttps(target.src)
                      } else {
                        target.style.display = 'none'
                      }
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem',
                  }}>
                    {index > 0 && (
                      <button
                        onClick={() => moveImage(index, index - 1)}
                        style={{
                          background: 'rgba(59, 130, 246, 0.8)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          width: '30px',
                          height: '30px',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                        }}
                        title="Mover arriba"
                      >
                        ↑
                      </button>
                    )}
                    {index < editedWidget.content.images.length - 1 && (
                      <button
                        onClick={() => moveImage(index, index + 1)}
                        style={{
                          background: 'rgba(59, 130, 246, 0.8)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          width: '30px',
                          height: '30px',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                        }}
                        title="Mover abajo"
                      >
                        ↓
                      </button>
                    )}
                    <button
                      onClick={() => removeImage(index)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.8)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        width: '30px',
                        height: '30px',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                      }}
                      title="Eliminar"
                    >
                      ×
                    </button>
                  </div>
                  <div style={{
                    position: 'absolute',
                    bottom: '0.5rem',
                    left: '0.5rem',
                    background: 'rgba(0, 0, 0, 0.7)',
                    color: '#ffffff',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                  }}>
                    Posición {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Botón para ver preview */}
          <button
            onClick={() => setActiveTab('preview')}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'rgba(59, 130, 246, 0.8)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
            }}
          >
            Ver Vista Previa
          </button>
        </div>
      )}
    </div>
  )
}
