'use client'

import { useState } from 'react'
import { AppSettings } from '@/app/types'

interface SettingsEditorProps {
  settings: AppSettings
  onUpdate: (settings: AppSettings) => void
}

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
      <h2 style={{ marginBottom: '2rem', fontSize: '1.5rem', fontWeight: '600' }}>
        Configuración General
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Video de Fondo */}
        <div>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '600' }}>
            Video de Fondo
          </h3>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Ruta del Video
            </label>
            <input
              type="text"
              value={editedSettings.videoBackground}
              onChange={(e) => handleChange('videoBackground', e.target.value)}
              placeholder="/videos/video1.MP4"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '1rem',
              }}
            />
            <p style={{ marginTop: '0.5rem', color: '#666', fontSize: '0.9rem' }}>
              Coloca el video en /public/videos/ y especifica la ruta aquí
            </p>
          </div>
        </div>

        {/* Logo */}
        <div>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '600' }}>
            Logo
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Ruta del Logo
              </label>
              <input
                type="text"
                value={editedSettings.logo.src}
                onChange={(e) => handleChange('logo.src', e.target.value)}
                placeholder="/images/logotB.png"
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
                Posición
              </label>
              <select
                value={editedSettings.logo.position}
                onChange={(e) => handleChange('logo.position', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                }}
              >
                <option value="top">Arriba</option>
                <option value="center">Centro</option>
                <option value="bottom">Abajo</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Tamaño (px)
              </label>
              <input
                type="number"
                min="100"
                max="500"
                value={editedSettings.logo.size}
                onChange={(e) => handleChange('logo.size', parseInt(e.target.value))}
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

        {/* Overlay */}
        <div>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '600' }}>
            Overlay del Video
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Opacidad (0-1)
              </label>
              <input
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={editedSettings.overlay.opacity}
                onChange={(e) => handleChange('overlay.opacity', parseFloat(e.target.value))}
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
                Color
              </label>
              <input
                type="color"
                value={editedSettings.overlay.color}
                onChange={(e) => handleChange('overlay.color', e.target.value)}
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
