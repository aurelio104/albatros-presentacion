'use client'

import { useState, useEffect } from 'react'
import { AppContent, WidgetData } from '@/app/types'
import VideoBackground from '@/app/components/VideoBackground'
import Header from '@/app/components/Header'
import WidgetEditor from './WidgetEditor'
import ImageUploader from './ImageUploader'
import SettingsEditor from './SettingsEditor'

interface AdminDashboardProps {
  onLogout: () => void
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [content, setContent] = useState<AppContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'widgets' | 'settings' | 'images'>('widgets')
  const [selectedWidget, setSelectedWidget] = useState<WidgetData | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    try {
      const response = await fetch('/api/content')
      if (response.ok) {
        const data = await response.json()
        setContent(data)
      }
    } catch (error) {
      console.error('Error al cargar contenido:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveContent = async () => {
    if (!content) return

    setSaving(true)
    try {
      const response = await fetch('/api/content', {
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
        setMessage({ type: 'error', text: 'Error al guardar el contenido' })
        setTimeout(() => setMessage(null), 3000)
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al guardar el contenido' })
      setTimeout(() => setMessage(null), 3000)
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
                padding: '1rem',
                background: message.type === 'success' 
                  ? 'rgba(16, 185, 129, 0.3)' 
                  : 'rgba(239, 68, 68, 0.3)',
                color: 'white',
                borderRadius: '8px',
                marginBottom: '1rem',
                textAlign: 'center',
                border: `1px solid ${message.type === 'success' 
                  ? 'rgba(16, 185, 129, 0.5)' 
                  : 'rgba(239, 68, 68, 0.5)'}`,
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
              }}
            >
              {message.text}
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
            {(['widgets', 'settings', 'images'] as const).map((tab) => (
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
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '1rem',
                    }}
                  >
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

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {content.widgets.map((widget) => (
                      <div
                        key={widget.id}
                        onClick={() => setSelectedWidget(widget)}
                        style={{
                          padding: '1rem',
                          background:
                            selectedWidget?.id === widget.id 
                              ? 'rgba(255, 255, 255, 0.3)' 
                              : 'rgba(255, 255, 255, 0.1)',
                          color: 'white',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          border: selectedWidget?.id === widget.id 
                            ? '1px solid rgba(255, 255, 255, 0.4)' 
                            : '1px solid rgba(255, 255, 255, 0.2)',
                        }}
                        onMouseEnter={(e) => {
                          if (selectedWidget?.id !== widget.id) {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedWidget?.id !== widget.id) {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                          }
                        }}
                      >
                        <span style={{ fontWeight: '500' }}>{widget.title}</span>
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
                    ))}
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
