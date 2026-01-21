'use client'

import { useState, useEffect } from 'react'
import { AppContent, WidgetData } from '@/app/types'
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
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Cargando...</p>
      </div>
    )
  }

  if (!content) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Error al cargar el contenido</p>
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f5f5f5',
        padding: '2rem',
      }}
    >
      {/* Header */}
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#1a1a1a',
            margin: 0,
          }}
        >
          Panel de Administración - Albatros
        </h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <a
            href="/"
            target="_blank"
            style={{
              padding: '0.5rem 1rem',
              background: '#667eea',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              fontSize: '0.9rem',
            }}
          >
            Ver Sitio
          </a>
          <button
            onClick={onLogout}
            style={{
              padding: '0.5rem 1rem',
              background: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem',
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
            background: message.type === 'success' ? '#10b981' : '#ef4444',
            color: 'white',
            borderRadius: '8px',
            marginBottom: '1rem',
            textAlign: 'center',
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
          background: 'white',
          padding: '0.5rem',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        {(['widgets', 'settings', 'images'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '0.75rem 1.5rem',
              background: activeTab === tab ? '#667eea' : 'transparent',
              color: activeTab === tab ? 'white' : '#666',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: activeTab === tab ? '600' : '400',
              transition: 'all 0.2s',
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
                background: 'white',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                height: 'fit-content',
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
                <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '600' }}>
                  Widgets ({content.widgets.length})
                </h2>
                <button
                  onClick={addWidget}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
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
                        selectedWidget?.id === widget.id ? '#667eea' : '#f5f5f5',
                      color: selectedWidget?.id === widget.id ? 'white' : '#333',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
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
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
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
                background: 'white',
                borderRadius: '12px',
                padding: '2rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              {selectedWidget ? (
                <WidgetEditor
                  widget={selectedWidget}
                  onUpdate={updateWidget}
                />
              ) : (
                <div style={{ textAlign: 'center', color: '#999', padding: '3rem' }}>
                  <p>Selecciona un widget para editarlo</p>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'settings' && (
          <SettingsEditor
            settings={content.settings}
            onUpdate={updateSettings}
          />
        )}

        {activeTab === 'images' && <ImageUploader />}
      </div>

      {/* Save Button */}
      <div
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
        }}
      >
        <button
          onClick={saveContent}
          disabled={saving}
          style={{
            padding: '1rem 2rem',
            background: saving ? '#999' : '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: saving ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: '600',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
            transition: 'all 0.2s',
          }}
        >
          {saving ? 'Guardando...' : '💾 Guardar Cambios'}
        </button>
      </div>
    </div>
  )
}
