'use client'

import { useState, useEffect } from 'react'
import { AppContent, WidgetData } from '@/app/types'
import VideoBackground from '@/app/components/VideoBackground'
import Header from '@/app/components/Header'
import WidgetEditor from './WidgetEditor'
import ImageUploader from './ImageUploader'
import SettingsEditor from './SettingsEditor'
import DocumentProcessor from './DocumentProcessor'

interface AdminDashboardProps {
  onLogout: () => void
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [content, setContent] = useState<AppContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'widgets' | 'settings' | 'images' | 'documents'>('widgets')
  const [selectedWidget, setSelectedWidget] = useState<WidgetData | null>(null)
  const [selectedWidgetIds, setSelectedWidgetIds] = useState<Set<number>>(new Set())
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string | React.ReactNode } | null>(null)

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
      const response = await fetch(`${backendUrl}/api/content`, { cache: 'no-store' })
      if (response.ok) {
        const data = await response.json()
        setContent(data)
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Error al cargar contenido:', errorData)
        setMessage({ type: 'error', text: errorData?.error || 'Error al cargar el contenido' })
        setTimeout(() => setMessage(null), 5000)
      }
    } catch (error: any) {
      console.error('Error al cargar contenido:', error)
      setMessage({ type: 'error', text: `Error de conexión: ${error?.message || 'Error desconocido'}` })
      setTimeout(() => setMessage(null), 5000)
    } finally {
      setLoading(false)
    }
  }

  const saveContent = async () => {
    if (!content) return

    setSaving(true)
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
      const response = await fetch(`${backendUrl}/api/content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(content),
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Contenido guardado exitosamente' })
        setTimeout(() => setMessage(null), 3000)
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Error al guardar:', errorData)
        
        // Si es error de KV no configurado, mostrar mensaje detallado
        if (errorData?.error === 'Vercel KV no está configurado' || errorData?.solution?.includes('Vercel KV')) {
          const instructions = errorData?.instructions || []
          const errorMsg = (
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                {errorData.error || 'Vercel KV no está configurado'}
              </div>
              <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem', opacity: 0.9 }}>
                {errorData.details}
              </div>
              {instructions.length > 0 && (
                <div style={{ fontSize: '0.85rem', marginTop: '0.75rem', paddingLeft: '1rem' }}>
                  <strong>Pasos para configurar:</strong>
                  <ol style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                    {instructions.map((step: string, idx: number) => (
                      <li key={idx} style={{ marginBottom: '0.25rem' }}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}
              {errorData.hint && (
                <div style={{ fontSize: '0.85rem', marginTop: '0.5rem', fontStyle: 'italic', opacity: 0.8 }}>
                  💡 {errorData.hint}
                </div>
              )}
            </div>
          )
          setMessage({ type: 'error', text: errorMsg as any })
        } else {
          const errorMsg = errorData?.error || errorData?.details || 'Error al guardar el contenido'
          setMessage({ type: 'error', text: errorMsg })
        }
        setTimeout(() => setMessage(null), 10000) // Más tiempo para leer las instrucciones
      }
    } catch (error: any) {
      console.error('Error al guardar el contenido:', error)
      setMessage({ type: 'error', text: `Error de conexión: ${error?.message || 'Error desconocido'}` })
      setTimeout(() => setMessage(null), 5000)
    } finally {
      setSaving(false)
    }
  }

  const addWidget = () => {
    if (!content) return

    const newWidget: WidgetData = {
      id: Date.now(),
      title: 'Nuevo Widget',
      preview: 'Descripción del widget',
      content: {
        title: 'Nuevo Widget',
        description: 'Descripción completa del widget',
        images: [],
        additionalInfo: '',
      },
      animation: {
        type: 'fadeIn',
        duration: 0.5,
        delay: 0,
      },
      style: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderColor: 'rgba(255, 255, 255, 0.2)',
      },
      order: content.widgets.length,
    }

    setContent({
      ...content,
      widgets: [...content.widgets, newWidget],
    })
    setSelectedWidget(newWidget)
  }

  const deleteWidget = (id: number) => {
    if (!content) return
    if (confirm('¿Estás seguro de eliminar este widget?')) {
      setContent({
        ...content,
        widgets: content.widgets.filter((w) => w.id !== id),
      })
      if (selectedWidget?.id === id) {
        setSelectedWidget(null)
      }
    }
  }

  const updateWidget = (updatedWidget: WidgetData) => {
    if (!content) return
    setContent({
      ...content,
      widgets: content.widgets.map((w) =>
        w.id === updatedWidget.id ? updatedWidget : w
      ),
    })
    setSelectedWidget(updatedWidget)
  }

  const updateSettings = (settings: AppContent['settings']) => {
    if (!content) return
    setContent({
      ...content,
      settings,
    })
  }

  const handleWidgetsGenerated = (newWidgets: WidgetData[]) => {
    if (!content) return
    setContent({
      ...content,
      widgets: [...content.widgets, ...newWidgets],
    })
    setMessage({ type: 'success', text: `${newWidgets.length} widgets creados exitosamente` })
    setTimeout(() => setMessage(null), 3000)
    setActiveTab('widgets')
  }

  const handleToggleWidgetSelection = (widgetId: number) => {
    const newSelected = new Set(selectedWidgetIds)
    if (newSelected.has(widgetId)) {
      newSelected.delete(widgetId)
    } else {
      newSelected.add(widgetId)
    }
    setSelectedWidgetIds(newSelected)
  }

  const handleMergeWidgets = () => {
    if (!content) return
    if (selectedWidgetIds.size < 2) {
      setMessage({ type: 'error', text: 'Selecciona al menos 2 widgets para unir' })
      setTimeout(() => setMessage(null), 3000)
      return
    }

    const ids = Array.from(selectedWidgetIds)
    const widgetsToMerge = ids
      .map(id => content.widgets.findIndex(w => w.id === id))
      .filter(idx => idx !== -1)
      .sort((a, b) => a - b)
      .map(idx => content.widgets[idx])

    if (widgetsToMerge.length < 2) {
      setMessage({ type: 'error', text: 'No se encontraron los widgets seleccionados' })
      setTimeout(() => setMessage(null), 3000)
      return
    }

    // Crear widget unificado
    const mergedTitle = widgetsToMerge[0].title // Usar el título del primero
    const mergedDescription = widgetsToMerge
      .map(w => `${w.title}\n\n${w.content.description}`)
      .join('\n\n---\n\n')
    const mergedAdditionalInfo = widgetsToMerge
      .map(w => w.content.additionalInfo)
      .filter(Boolean)
      .join('\n\n---\n\n')
    
    // Combinar todas las imágenes (sin duplicados)
    const allImages = new Set<string>()
    widgetsToMerge.forEach(w => {
      if (w.content.images) {
        w.content.images.forEach(img => allImages.add(img))
      }
    })
    
    // Usar la categoría más común o la primera
    const categories = widgetsToMerge.map(w => w.category).filter(Boolean)
    const categoryCounts = categories.reduce((acc, cat) => {
      acc[cat!] = (acc[cat!] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    const mergedCategory = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || widgetsToMerge[0].category || 'otro'
    
    // Usar el nivel más alto (menor número = más importante) si existe
    const levels = widgetsToMerge.map(w => w.order || 0).filter(l => l !== undefined)
    const mergedOrder = levels.length > 0 ? Math.min(...levels) : content.widgets.length

    const mergedWidget: WidgetData = {
      id: Date.now(),
      title: mergedTitle,
      preview: mergedDescription.substring(0, 150) + (mergedDescription.length > 150 ? '...' : ''),
      content: {
        title: mergedTitle,
        description: mergedDescription,
        additionalInfo: mergedAdditionalInfo || undefined,
        images: Array.from(allImages),
      },
      category: mergedCategory as any,
      animation: widgetsToMerge[0].animation || {
        type: 'fadeIn',
        duration: 0.5,
        delay: 0,
      },
      style: widgetsToMerge[0].style || {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderColor: 'rgba(255, 255, 255, 0.2)',
      },
      order: mergedOrder,
    }
    
    // Eliminar widgets originales y agregar el unificado
    const updatedWidgets = content.widgets.filter(w => !selectedWidgetIds.has(w.id))
    
    // Insertar el widget unificado en la posición del primero
    const firstIndex = content.widgets.findIndex(w => w.id === ids[0])
    updatedWidgets.splice(firstIndex >= 0 ? firstIndex : 0, 0, mergedWidget)
    
    // Reordenar los widgets
    updatedWidgets.forEach((w, i) => {
      w.order = i
    })
    
    setContent({
      ...content,
      widgets: updatedWidgets,
    })
    setSelectedWidgetIds(new Set())
    setSelectedWidget(mergedWidget)
    setMessage({ type: 'success', text: `✅ ${selectedWidgetIds.size} widgets unidos exitosamente` })
    setTimeout(() => setMessage(null), 3000)
  }

  if (loading) {
    return (
      <main style={{ 
        position: 'relative', 
        width: '100vw', 
        height: '100vh', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff'
      }}>
        <VideoBackground 
          videoSrc="/videos/video1.MP4"
          overlay={{ opacity: 0.4, color: 'rgba(0, 0, 0, 0.4)' }}
        />
        <Header logoSrc="/images/logotB.png" size={320} />
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
          <p>Cargando...</p>
        </div>
      </main>
    )
  }

  if (!content) {
    return (
      <main style={{ 
        position: 'relative', 
        width: '100vw', 
        height: '100vh', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff'
      }}>
        <VideoBackground 
          videoSrc="/videos/video1.MP4"
          overlay={{ opacity: 0.4, color: 'rgba(0, 0, 0, 0.4)' }}
        />
        <Header logoSrc="/images/logotB.png" size={320} />
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
          <p>Error al cargar el contenido</p>
        </div>
      </main>
    )
  }

  return (
    <>
      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        html, body {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          overflow-x: hidden;
        }
      `}</style>
      <main style={{
        position: 'relative',
        width: '100vw',
        minHeight: '100vh',
        overflow: 'hidden',
        padding: '2rem',
        paddingTop: '120px',
      }}>
        <VideoBackground 
          videoSrc={content.settings.videoBackground || '/videos/video1.MP4'}
          overlay={content.settings.overlay || { opacity: 0.4, color: 'rgba(0, 0, 0, 0.4)' }}
        />
        <Header 
          logoSrc={content.settings.logo.src || '/images/logotB.png'}
          size={content.settings.logo.size || 320}
        />

        <div style={{ position: 'relative', zIndex: 10 }}>
          {/* Header */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '16px',
              padding: '1.5rem',
              marginBottom: '2rem',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <h1
              style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#ffffff',
                margin: 0,
              }}
            >
              Panel de Administración - Albatros
            </h1>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => setActiveTab('documents')}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.6)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)'
                }}
              >
                📄 Adjuntar Archivo
              </button>
              <a
                href="/"
                target="_blank"
                style={{
                  padding: '0.5rem 1rem',
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                Ver Sitio
              </a>
              <button
                onClick={onLogout}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'rgba(220, 38, 38, 0.3)',
                  color: 'white',
                  border: '1px solid rgba(220, 38, 38, 0.5)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(220, 38, 38, 0.5)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(220, 38, 38, 0.3)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                Salir
              </button>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div
              style={{
                padding: '1.5rem',
                background: message.type === 'success' 
                  ? 'rgba(16, 185, 129, 0.3)' 
                  : 'rgba(239, 68, 68, 0.3)',
                color: 'white',
                borderRadius: '8px',
                marginBottom: '1rem',
                textAlign: typeof message.text === 'string' ? 'center' : 'left',
                border: `1px solid ${message.type === 'success' 
                  ? 'rgba(16, 185, 129, 0.5)' 
                  : 'rgba(239, 68, 68, 0.5)'}`,
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
                maxWidth: '100%',
                overflow: 'auto',
              }}
            >
              {typeof message.text === 'string' ? message.text : message.text}
            </div>
          )}

          {/* Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              marginBottom: '2rem',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              padding: '0.5rem',
              borderRadius: '12px',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            {(['widgets', 'documents', 'settings', 'images'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: activeTab === tab 
                    ? 'rgba(255, 255, 255, 0.3)' 
                    : 'transparent',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: activeTab === tab ? '600' : '400',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab) {
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                {tab === 'widgets' && 'Widgets'}
                {tab === 'documents' && '🤖 IA Documentos'}
                {tab === 'settings' && 'Configuración'}
                {tab === 'images' && 'Imágenes'}
              </button>
            ))}
          </div>

          {/* Content */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: activeTab === 'widgets' ? '300px 1fr' : '1fr',
              gap: '2rem',
            }}
          >
            {activeTab === 'widgets' && (
              <>
                {/* Widget List */}
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                    height: 'fit-content',
                    maxHeight: 'calc(100vh - 300px)',
                    overflowY: 'auto',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                      marginBottom: '1rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '600', color: 'white' }}>
                        Widgets ({content.widgets.length})
                      </h2>
                      <button
                        onClick={addWidget}
                        style={{
                          padding: '0.5rem 1rem',
                          background: 'rgba(16, 185, 129, 0.3)',
                          color: 'white',
                          border: '1px solid rgba(16, 185, 129, 0.5)',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          transition: 'all 0.3s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(16, 185, 129, 0.5)'
                          e.currentTarget.style.transform = 'translateY(-2px)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(16, 185, 129, 0.3)'
                          e.currentTarget.style.transform = 'translateY(0)'
                        }}
                      >
                        + Nuevo
                      </button>
                    </div>
                    {selectedWidgetIds.size > 0 && (
                      <div style={{
                        display: 'flex',
                        gap: '0.5rem',
                        alignItems: 'center',
                        padding: '0.75rem',
                        background: 'rgba(102, 126, 234, 0.2)',
                        borderRadius: '8px',
                        border: '1px solid rgba(102, 126, 234, 0.4)',
                      }}>
                        <span style={{ color: 'white', fontSize: '0.9rem', fontWeight: '500' }}>
                          {selectedWidgetIds.size} seleccionado{selectedWidgetIds.size > 1 ? 's' : ''}
                        </span>
                        <button
                          onClick={handleMergeWidgets}
                          style={{
                            padding: '0.5rem 1rem',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            transition: 'transform 0.2s',
                            marginLeft: 'auto',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.05)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)'
                          }}
                        >
                          🔗 Unir Widgets
                        </button>
                        <button
                          onClick={() => setSelectedWidgetIds(new Set())}
                          style={{
                            padding: '0.5rem 1rem',
                            background: 'rgba(255, 255, 255, 0.1)',
                            color: 'white',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                          }}
                        >
                          ✕ Cancelar
                        </button>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {content.widgets.map((widget) => {
                      const isSelected = selectedWidgetIds.has(widget.id)
                      const isActive = selectedWidget?.id === widget.id
                      return (
                        <div
                          key={widget.id}
                          onClick={(e) => {
                            // Si se hace clic en el checkbox, no cambiar la selección del editor
                            if ((e.target as HTMLElement).tagName === 'INPUT') return
                            setSelectedWidget(widget)
                          }}
                          style={{
                            padding: '1rem',
                            background:
                              isActive 
                                ? 'rgba(255, 255, 255, 0.3)' 
                                : isSelected
                                ? 'rgba(102, 126, 234, 0.2)'
                                : 'rgba(255, 255, 255, 0.1)',
                            color: 'white',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '0.5rem',
                            border: isActive 
                              ? '1px solid rgba(255, 255, 255, 0.4)' 
                              : isSelected
                              ? '1px solid rgba(102, 126, 234, 0.5)'
                              : '1px solid rgba(255, 255, 255, 0.2)',
                          }}
                          onMouseEnter={(e) => {
                            if (!isActive && !isSelected) {
                              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isActive && !isSelected) {
                              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                            }
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                e.stopPropagation()
                                handleToggleWidgetSelection(widget.id)
                              }}
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                width: '18px',
                                height: '18px',
                                cursor: 'pointer',
                                accentColor: '#667eea',
                              }}
                            />
                            <span style={{ fontWeight: '500', flex: 1 }}>{widget.title}</span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteWidget(widget.id)
                            }}
                            style={{
                              padding: '0.25rem 0.5rem',
                              background: 'rgba(239, 68, 68, 0.3)',
                              color: 'white',
                              border: '1px solid rgba(239, 68, 68, 0.5)',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                              transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.5)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)'
                            }}
                          >
                            ×
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Widget Editor */}
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '16px',
                    padding: '2rem',
                    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                    maxHeight: 'calc(100vh - 300px)',
                    overflowY: 'auto',
                  }}
                >
                  {selectedWidget ? (
                    <WidgetEditor
                      widget={selectedWidget}
                      onUpdate={updateWidget}
                    />
                  ) : (
                    <div style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.7)', padding: '3rem' }}>
                      <p>Selecciona un widget para editarlo</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {activeTab === 'settings' && (
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '16px',
                  padding: '2rem',
                  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                }}
              >
                <SettingsEditor
                  settings={content.settings}
                  onUpdate={updateSettings}
                />
              </div>
            )}

            {activeTab === 'documents' && (
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '16px',
                  padding: '2rem',
                  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                }}
              >
                <DocumentProcessor onWidgetsGenerated={handleWidgetsGenerated} />
              </div>
            )}

            {activeTab === 'images' && (
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '16px',
                  padding: '2rem',
                  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                }}
              >
                <ImageUploader />
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            zIndex: 1000,
          }}
        >
          <button
            onClick={saveContent}
            disabled={saving}
            style={{
              padding: '1rem 2rem',
              background: saving 
                ? 'rgba(255, 255, 255, 0.2)' 
                : 'rgba(102, 126, 234, 0.5)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '12px',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              transition: 'all 0.2s',
              backdropFilter: 'blur(10px)',
            }}
            onMouseEnter={(e) => {
              if (!saving) {
                e.currentTarget.style.background = 'rgba(102, 126, 234, 0.7)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }
            }}
            onMouseLeave={(e) => {
              if (!saving) {
                e.currentTarget.style.background = 'rgba(102, 126, 234, 0.5)'
                e.currentTarget.style.transform = 'translateY(0)'
              }
            }}
          >
            {saving ? 'Guardando...' : '💾 Guardar Cambios'}
          </button>
        </div>
      </main>
    </>
  )
}
