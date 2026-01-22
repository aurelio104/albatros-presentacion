'use client'

import { useState, useEffect } from 'react'
import { AppSettings } from '@/app/types'

interface SettingsEditorProps {
  settings: AppSettings
  onUpdate: (settings: AppSettings) => void
}

interface Presentation {
  id: string
  name: string
  isActive: boolean
  widgetCount?: number
}

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

export default function SettingsEditor({ settings, onUpdate }: SettingsEditorProps) {
  const [editedSettings, setEditedSettings] = useState<AppSettings>(settings)
  const [presentations, setPresentations] = useState<Presentation[]>([])
  const [loadingPresentations, setLoadingPresentations] = useState(true)
  const [activatingPresentation, setActivatingPresentation] = useState<string | null>(null)

  useEffect(() => {
    loadPresentations()
  }, [])

  const loadPresentations = async () => {
    try {
      setLoadingPresentations(true)
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
      const response = await fetch(`${backendUrl}/api/presentations`, { cache: 'no-store' })
      
      if (response.ok) {
        const data = await response.json()
        setPresentations(data.presentations || [])
      }
    } catch (error) {
      console.error('Error cargando presentaciones:', error)
    } finally {
      setLoadingPresentations(false)
    }
  }

  const activatePresentation = async (id: string) => {
    setActivatingPresentation(id)
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
      const response = await fetch(`${backendUrl}/api/presentations/active/${id}`, {
        method: 'POST',
      })
      
      if (response.ok) {
        await loadPresentations() // Recargar para actualizar estados
      } else {
        const data = await response.json()
        alert(`Error: ${data.error || 'Error desconocido'}`)
      }
    } catch (error: any) {
      console.error('Error activando presentación:', error)
      alert(`Error de conexión: ${error?.message || 'Error desconocido'}`)
    } finally {
      setActivatingPresentation(null)
    }
  }

  const deactivatePresentation = async () => {
    setActivatingPresentation('clear')
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
      const response = await fetch(`${backendUrl}/api/presentations/active/clear`, {
        method: 'POST',
      })
      
      if (response.ok) {
        await loadPresentations() // Recargar para actualizar estados
      } else {
        const data = await response.json()
        alert(`Error: ${data.error || 'Error desconocido'}`)
      }
    } catch (error: any) {
      console.error('Error desactivando presentación:', error)
      alert(`Error de conexión: ${error?.message || 'Error desconocido'}`)
    } finally {
      setActivatingPresentation(null)
    }
  }

  const handleChange = (path: string, value: any) => {
    const updated = { ...editedSettings }
    
    if (path === 'videoBackground') {
      updated.videoBackground = value
    } else if (path === 'isVisible') {
      updated.isVisible = value
    } else if (path.startsWith('logo.')) {
      const field = path.split('.')[1]
      updated.logo = { ...updated.logo, [field]: value }
    } else if (path.startsWith('overlay.')) {
      const field = path.split('.')[1]
      updated.overlay = { ...updated.overlay, [field]: value }
    }
    
    setEditedSettings(updated)
    onUpdate(updated)
  }

  return (
    <div>
      <h2 style={{ ...headingStyle, marginBottom: '2rem', fontSize: '1.5rem' }}>
        Configuración General
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Selección de Proyecto Activo */}
        <div>
          <h3 style={{ ...headingStyle, marginBottom: '1rem', fontSize: '1.1rem' }}>
            Proyecto Activo
          </h3>
          <p style={{ marginBottom: '1rem', color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
            Selecciona qué proyecto estará visible para los visitantes. Solo un proyecto puede estar activo a la vez.
          </p>
          
          {loadingPresentations ? (
            <div style={{
              padding: '2rem',
              textAlign: 'center',
              color: 'rgba(255, 255, 255, 0.7)',
            }}>
              Cargando proyectos...
            </div>
          ) : presentations.length === 0 ? (
            <div style={{
              padding: '1.5rem',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              textAlign: 'center',
              color: 'rgba(255, 255, 255, 0.7)',
            }}>
              <p style={{ marginBottom: '0.5rem' }}>No hay proyectos guardados</p>
              <p style={{ fontSize: '0.85rem' }}>Guarda un proyecto en la pestaña "📚 Presentaciones" para poder activarlo</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* Opción: Ninguno activo (usar contenido general) */}
              <div
                style={{
                  padding: '1rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: activatingPresentation === 'clear' ? 'wait' : 'pointer',
                  opacity: activatingPresentation === 'clear' ? 0.6 : 1,
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  if (activatingPresentation !== 'clear') {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (activatingPresentation !== 'clear') {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                  }
                }}
                onClick={() => {
                  if (activatingPresentation !== 'clear') {
                    deactivatePresentation()
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    border: '2px solid rgba(255, 255, 255, 0.5)',
                    background: presentations.some(p => p.isActive) ? 'transparent' : 'rgba(34, 197, 94, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {!presentations.some(p => p.isActive) && (
                      <div style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: '#ffffff',
                      }} />
                    )}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', color: '#ffffff', marginBottom: '0.25rem' }}>
                      Contenido General
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                      Usar el contenido actual (sin proyecto específico)
                    </div>
                  </div>
                </div>
                {activatingPresentation === 'clear' && (
                  <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                    ⏳ Activando...
                  </div>
                )}
              </div>
              
              {/* Lista de proyectos */}
              {presentations.map((presentation) => (
                <div
                  key={presentation.id}
                  style={{
                    padding: '1rem',
                    background: presentation.isActive ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    border: `2px solid ${presentation.isActive ? 'rgba(34, 197, 94, 0.5)' : 'rgba(255, 255, 255, 0.2)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: activatingPresentation === presentation.id ? 'wait' : 'pointer',
                    opacity: activatingPresentation === presentation.id ? 0.6 : 1,
                    transition: 'all 0.3s ease',
                    boxShadow: presentation.isActive ? '0 0 20px rgba(34, 197, 94, 0.3)' : 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (activatingPresentation !== presentation.id) {
                      e.currentTarget.style.background = presentation.isActive 
                        ? 'rgba(34, 197, 94, 0.25)' 
                        : 'rgba(255, 255, 255, 0.15)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activatingPresentation !== presentation.id) {
                      e.currentTarget.style.background = presentation.isActive 
                        ? 'rgba(34, 197, 94, 0.2)' 
                        : 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                  onClick={() => {
                    if (activatingPresentation !== presentation.id && !presentation.isActive) {
                      activatePresentation(presentation.id)
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: '2px solid rgba(255, 255, 255, 0.5)',
                      background: presentation.isActive ? 'rgba(34, 197, 94, 0.8)' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {presentation.isActive && (
                        <div style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          background: '#ffffff',
                        }} />
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', color: '#ffffff', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {presentation.name}
                        {presentation.isActive && (
                          <span style={{
                            fontSize: '0.75rem',
                            padding: '0.25rem 0.5rem',
                            background: 'rgba(34, 197, 94, 0.8)',
                            borderRadius: '12px',
                            fontWeight: '600',
                          }}>
                            ACTIVO
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                        {presentation.widgetCount || 0} widgets
                      </div>
                    </div>
                  </div>
                  {activatingPresentation === presentation.id && (
                    <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                      ⏳ Activando...
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Control de Visibilidad (mantener para compatibilidad) */}
        <div>
          <h3 style={{ ...headingStyle, marginBottom: '1rem', fontSize: '1.1rem' }}>
            Visibilidad del Proyecto
          </h3>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1rem',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            border: '2px solid rgba(255, 255, 255, 0.2)',
          }}>
            <label style={{
              ...labelStyle,
              margin: 0,
              flex: 1,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
            }}>
              <span style={{ fontSize: '1rem', fontWeight: '500' }}>
                {editedSettings.isVisible !== false ? '✅ Proyecto Visible' : '❌ Proyecto Oculto'}
              </span>
              <div
                onClick={() => handleChange('isVisible', !(editedSettings.isVisible !== false))}
                style={{
                  position: 'relative',
                  width: '60px',
                  height: '32px',
                  background: editedSettings.isVisible !== false ? 'rgba(34, 197, 94, 0.8)' : 'rgba(156, 163, 175, 0.6)',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: editedSettings.isVisible !== false 
                    ? '0 0 20px rgba(34, 197, 94, 0.4)' 
                    : 'none',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '2px',
                    left: editedSettings.isVisible !== false ? '30px' : '2px',
                    width: '24px',
                    height: '24px',
                    background: '#ffffff',
                    borderRadius: '50%',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                  }}
                />
              </div>
            </label>
          </div>
          <p style={{ marginTop: '0.75rem', color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem', paddingLeft: '1rem' }}>
            {editedSettings.isVisible !== false 
              ? 'El proyecto está visible para todos los visitantes' 
              : 'El proyecto está oculto. Los visitantes verán un mensaje indicando que no está disponible'}
          </p>
        </div>
        {/* Video de Fondo */}
        <div>
          <h3 style={{ ...headingStyle, marginBottom: '1rem', fontSize: '1.1rem' }}>
            Video de Fondo
          </h3>
          <div>
            <label style={labelStyle}>
              Ruta del Video
            </label>
            <input
              type="text"
              value={editedSettings.videoBackground}
              onChange={(e) => handleChange('videoBackground', e.target.value)}
              placeholder="/videos/video1.MP4"
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
            <p style={{ marginTop: '0.5rem', color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
              Coloca el video en /public/videos/ y especifica la ruta aquí
            </p>
          </div>
        </div>

        {/* Logo */}
        <div>
          <h3 style={{ ...headingStyle, marginBottom: '1rem', fontSize: '1.1rem' }}>
            Logo
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>
                Ruta del Logo
              </label>
              <input
                type="text"
                value={editedSettings.logo.src}
                onChange={(e) => handleChange('logo.src', e.target.value)}
                placeholder="/images/logotB.png"
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
                Posición
              </label>
              <select
                value={editedSettings.logo.position}
                onChange={(e) => handleChange('logo.position', e.target.value)}
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
                <option value="top" style={{ background: '#1a1a1a', color: '#ffffff' }}>Arriba</option>
                <option value="center" style={{ background: '#1a1a1a', color: '#ffffff' }}>Centro</option>
                <option value="bottom" style={{ background: '#1a1a1a', color: '#ffffff' }}>Abajo</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>
                Tamaño (px)
              </label>
              <input
                type="number"
                min="100"
                max="500"
                value={editedSettings.logo.size}
                onChange={(e) => handleChange('logo.size', parseInt(e.target.value))}
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

        {/* Overlay */}
        <div>
          <h3 style={{ ...headingStyle, marginBottom: '1rem', fontSize: '1.1rem' }}>
            Overlay del Video
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>
                Opacidad (0-1)
              </label>
              <input
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={editedSettings.overlay.opacity}
                onChange={(e) => handleChange('overlay.opacity', parseFloat(e.target.value))}
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
                Color
              </label>
              <input
                type="color"
                value={editedSettings.overlay.color}
                onChange={(e) => handleChange('overlay.color', e.target.value)}
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
