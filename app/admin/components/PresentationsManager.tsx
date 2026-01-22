'use client'

import { useState, useEffect } from 'react'
import { AppContent } from '@/app/types'

interface Presentation {
  id: string
  name: string
  filename: string
  timestamp: string | null
  date: Date | null
  widgetCount: number
}

interface PresentationsManagerProps {
  currentContent: AppContent | null
  onLoadPresentation: (content: AppContent) => void
}

export default function PresentationsManager({ currentContent, onLoadPresentation }: PresentationsManagerProps) {
  const [presentations, setPresentations] = useState<Presentation[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loadingPresentation, setLoadingPresentation] = useState<string | null>(null)
  const [newPresentationName, setNewPresentationName] = useState('')
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    loadPresentations()
  }, [])

  const loadPresentations = async () => {
    try {
      setLoading(true)
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
      const response = await fetch(`${backendUrl}/api/presentations`, { cache: 'no-store' })
      
      if (response.ok) {
        const data = await response.json()
        // Validar y parsear fechas de forma segura
        const validatedPresentations = (data.presentations || []).map((p: any) => {
          let parsedDate = null
          if (p.timestamp) {
            try {
              const date = new Date(p.timestamp)
              if (!isNaN(date.getTime())) {
                parsedDate = date
              }
            } catch (error) {
              console.warn('Fecha inválida en presentación:', p.name, p.timestamp)
            }
          }
          return {
            ...p,
            date: parsedDate
          }
        })
        setPresentations(validatedPresentations)
      } else {
        setMessage({ type: 'error', text: 'Error al cargar presentaciones' })
      }
    } catch (error: any) {
      console.error('Error cargando presentaciones:', error)
      setMessage({ type: 'error', text: `Error de conexión: ${error?.message || 'Error desconocido'}` })
    } finally {
      setLoading(false)
    }
  }

  const savePresentation = async () => {
    if (!currentContent) {
      setMessage({ type: 'error', text: 'No hay contenido para guardar' })
      return
    }

    if (!newPresentationName.trim()) {
      setMessage({ type: 'error', text: 'El nombre de la presentación es requerido' })
      return
    }

    setSaving(true)
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
      const response = await fetch(`${backendUrl}/api/presentations/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newPresentationName.trim(),
          content: currentContent
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Presentación guardada exitosamente' })
        setNewPresentationName('')
        setShowSaveDialog(false)
        await loadPresentations()
        setTimeout(() => setMessage(null), 3000)
      } else {
        const errorMsg = data.error || data.details || 'Error al guardar presentación'
        console.error('Error guardando presentación:', data)
        setMessage({ type: 'error', text: errorMsg })
        setTimeout(() => setMessage(null), 5000)
      }
    } catch (error: any) {
      console.error('Error guardando presentación:', error)
      setMessage({ type: 'error', text: `Error de conexión: ${error?.message || 'Error desconocido'}` })
      setTimeout(() => setMessage(null), 5000)
    } finally {
      setSaving(false)
    }
  }

  const loadPresentation = async (id: string) => {
    setLoadingPresentation(id)
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
      
      // Primero cargar la presentación en el servidor
      const loadResponse = await fetch(`${backendUrl}/api/presentations/load/${id}`, {
        method: 'POST',
      })

      if (!loadResponse.ok) {
        const errorData = await loadResponse.json().catch(() => ({}))
        throw new Error(errorData.error || 'Error al cargar presentación')
      }

      // Luego obtener el contenido actualizado
      const contentResponse = await fetch(`${backendUrl}/api/content`, { cache: 'no-store' })
      
      if (contentResponse.ok) {
        const content = await contentResponse.json()
        onLoadPresentation(content)
        setMessage({ type: 'success', text: 'Presentación cargada exitosamente' })
        setTimeout(() => setMessage(null), 3000)
      } else {
        throw new Error('Error al obtener contenido después de cargar')
      }
    } catch (error: any) {
      console.error('Error cargando presentación:', error)
      setMessage({ type: 'error', text: `Error: ${error?.message || 'Error desconocido'}` })
      setTimeout(() => setMessage(null), 5000)
    } finally {
      setLoadingPresentation(null)
    }
  }

  const deletePresentation = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de eliminar la presentación "${name}"?`)) {
      return
    }

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
      const response = await fetch(`${backendUrl}/api/presentations/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Presentación eliminada exitosamente' })
        await loadPresentations()
        setTimeout(() => setMessage(null), 3000)
      } else {
        const errorData = await response.json().catch(() => ({}))
        setMessage({ type: 'error', text: errorData.error || 'Error al eliminar presentación' })
        setTimeout(() => setMessage(null), 5000)
      }
    } catch (error: any) {
      console.error('Error eliminando presentación:', error)
      setMessage({ type: 'error', text: `Error de conexión: ${error?.message || 'Error desconocido'}` })
      setTimeout(() => setMessage(null), 5000)
    }
  }

  const formatDate = (date: Date | null) => {
    if (!date) return 'Fecha desconocida'
    try {
      // Verificar que la fecha sea válida
      if (!(date instanceof Date) || isNaN(date.getTime())) {
        return 'Fecha inválida'
      }
      return new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date)
    } catch (error) {
      console.error('Error formateando fecha:', error)
      return 'Fecha inválida'
    }
  }

  return (
    <div>
      <h2 style={{ marginBottom: '2rem', fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)', fontWeight: '600', color: '#ffffff' }}>
        📚 Gestión de Presentaciones
      </h2>

      {message && (
        <div
          style={{
            marginBottom: '1.5rem',
            padding: '1rem',
            background: message.type === 'success' 
              ? 'rgba(34, 197, 94, 0.3)' 
              : 'rgba(239, 68, 68, 0.3)',
            color: message.type === 'success' ? '#86efac' : '#fca5a5',
            borderRadius: '8px',
            border: `1px solid ${message.type === 'success' ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)'}`,
            backdropFilter: 'blur(10px)',
          }}
        >
          {message.text}
        </div>
      )}

      {/* Botón para guardar presentación actual */}
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={() => setShowSaveDialog(true)}
          disabled={!currentContent || saving}
          style={{
            padding: '0.75rem 1.5rem',
            background: currentContent && !saving
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              : 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: currentContent && !saving ? 'pointer' : 'not-allowed',
            transition: 'all 0.3s',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
          }}
        >
          💾 Guardar Presentación Actual
        </button>
      </div>

      {/* Diálogo para guardar */}
      {showSaveDialog && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => !saving && setShowSaveDialog(false)}
        >
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '16px',
              padding: '2rem',
              minWidth: '400px',
              maxWidth: '500px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#ffffff' }}>
              Guardar Presentación
            </h3>
            <input
              type="text"
              value={newPresentationName}
              onChange={(e) => setNewPresentationName(e.target.value)}
              placeholder="Ej: Presentación 1"
              disabled={saving}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                borderRadius: '8px',
                fontSize: '1rem',
                marginBottom: '1rem',
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !saving && newPresentationName.trim()) {
                  savePresentation()
                }
              }}
            />
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowSaveDialog(false)
                  setNewPresentationName('')
                }}
                disabled={saving}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={savePresentation}
                disabled={saving || !newPresentationName.trim()}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: saving || !newPresentationName.trim()
                    ? 'rgba(255, 255, 255, 0.2)'
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: saving || !newPresentationName.trim() ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                }}
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de presentaciones */}
      {loading ? (
        <div style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.7)', padding: '3rem' }}>
          <p>Cargando presentaciones...</p>
        </div>
      ) : presentations.length === 0 ? (
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            padding: '3rem',
            textAlign: 'center',
            color: 'rgba(255, 255, 255, 0.7)',
          }}
        >
          <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
            No hay presentaciones guardadas
          </p>
          <p style={{ fontSize: '0.9rem' }}>
            Guarda tu primera presentación usando el botón de arriba
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {presentations.map((presentation) => (
            <div
              key={presentation.id}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                padding: '1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, marginBottom: '0.5rem', color: '#ffffff', fontSize: '1.1rem' }}>
                  {presentation.name}
                </h3>
                <div style={{ display: 'flex', gap: '1.5rem', color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem', flexWrap: 'wrap' }}>
                  <span>📅 {formatDate(presentation.date)}</span>
                  <span>📊 {presentation.widgetCount} widgets</span>
                  {presentation.timestamp && (
                    <span style={{ fontSize: '0.85rem', opacity: 0.6 }}>
                      {new Date(presentation.timestamp).toLocaleString('es-ES', { 
                        year: 'numeric', 
                        month: '2-digit', 
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => loadPresentation(presentation.id)}
                  disabled={loadingPresentation === presentation.id}
                  style={{
                    padding: '0.5rem 1rem',
                    background: loadingPresentation === presentation.id
                      ? 'rgba(255, 255, 255, 0.2)'
                      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: loadingPresentation === presentation.id ? 'not-allowed' : 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                  }}
                >
                  {loadingPresentation === presentation.id ? 'Cargando...' : '📂 Cargar'}
                </button>
                <button
                  onClick={() => deletePresentation(presentation.id, presentation.name)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: 'rgba(239, 68, 68, 0.3)',
                    color: 'white',
                    border: '1px solid rgba(239, 68, 68, 0.5)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                  }}
                >
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
