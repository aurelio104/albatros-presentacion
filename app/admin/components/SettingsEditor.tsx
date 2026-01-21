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
