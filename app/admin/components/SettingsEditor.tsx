'use client'

import { useState } from 'react'
import { AppSettings } from '@/app/types'

interface SettingsEditorProps {
  settings: AppSettings
  onUpdate: (settings: AppSettings) => void
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
        {/* Control de Visibilidad */}
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
