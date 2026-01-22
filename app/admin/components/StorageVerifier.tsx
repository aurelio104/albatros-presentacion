'use client'

import { useState } from 'react'

interface VerificationResults {
  storage: {
    available: boolean
    base: string
    mode: string
    directories: Record<string, any>
  }
  presentations: {
    count: number
    files: Array<{
      filename: string
      sizeKB: string
      name: string
      id: string
      timestamp: string | null
      widgetCount: number
      hasSettings: boolean
      version: string
    }>
  }
  images: {
    count: number
    sample: Array<{ filename: string }>
  }
  backups: {
    count: number
    sample: Array<{ filename: string }>
  }
  content: {
    exists: boolean
    size: number
  }
}

export default function StorageVerifier() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<VerificationResults | null>(null)
  const [error, setError] = useState<string | null>(null)

  const verifyStorage = async () => {
    setLoading(true)
    setError(null)
    setResults(null)

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
      const response = await fetch(`${backendUrl}/api/verify`, {
        cache: 'no-store'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al verificar almacenamiento')
      }

      const data = await response.json()
      if (data.success && data.results) {
        setResults(data.results)
      } else {
        throw new Error('Respuesta inválida del servidor')
      }
    } catch (err: any) {
      setError(err.message || 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '16px',
      padding: '2rem',
      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    }}>
      <h2 style={{
        color: '#ffffff',
        fontSize: '1.5rem',
        fontWeight: '600',
        marginBottom: '1rem',
      }}>
        🔍 Verificación de Almacenamiento
      </h2>

      <button
        onClick={verifyStorage}
        disabled={loading}
        style={{
          padding: '0.75rem 1.5rem',
          background: loading ? 'rgba(100, 100, 100, 0.5)' : 'rgba(59, 130, 246, 0.8)',
          color: '#ffffff',
          border: 'none',
          borderRadius: '8px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '1rem',
          fontWeight: '600',
          marginBottom: '1.5rem',
        }}
      >
        {loading ? '⏳ Verificando...' : '🔍 Verificar Almacenamiento'}
      </button>

      {error && (
        <div style={{
          padding: '1rem',
          background: 'rgba(239, 68, 68, 0.2)',
          border: '1px solid rgba(239, 68, 68, 0.5)',
          borderRadius: '8px',
          color: '#ffffff',
          marginBottom: '1rem',
        }}>
          ❌ Error: {error}
        </div>
      )}

      {results && (
        <div style={{ color: '#ffffff' }}>
          {/* Estado del Almacenamiento */}
          <div style={{
            marginBottom: '1.5rem',
            padding: '1rem',
            background: results.storage.available 
              ? 'rgba(34, 197, 94, 0.2)' 
              : 'rgba(239, 68, 68, 0.2)',
            border: `1px solid ${results.storage.available ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)'}`,
            borderRadius: '8px',
          }}>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>
              {results.storage.available ? '✅ Almacenamiento Disponible' : '❌ Almacenamiento No Disponible'}
            </h3>
            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
              <div>📍 Base: {results.storage.base}</div>
              <div>🔧 Modo: {results.storage.mode}</div>
            </div>
          </div>

          {/* Directorios */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>📁 Directorios</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '0.5rem',
            }}>
              {Object.entries(results.storage.directories).map(([name, dir]: [string, any]) => (
                <div
                  key={name}
                  style={{
                    padding: '0.75rem',
                    background: dir.exists ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    border: `1px solid ${dir.exists ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                  }}
                >
                  {dir.exists ? '✅' : '❌'} {name}
                </div>
              ))}
            </div>
          </div>

          {/* Presentaciones */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>
              📚 Presentaciones ({results.presentations.count})
            </h3>
            {results.presentations.files.length > 0 ? (
              <div style={{
                display: 'grid',
                gap: '0.75rem',
              }}>
                {results.presentations.files.map((file) => (
                  <div
                    key={file.filename}
                    style={{
                      padding: '1rem',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                    }}
                  >
                    <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                      📄 {file.name}
                    </div>
                    <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                      <div>ID: {file.id}</div>
                      <div>Widgets: {file.widgetCount}</div>
                      <div>Tamaño: {file.sizeKB} KB</div>
                      <div>Versión: {file.version}</div>
                      {file.timestamp && (
                        <div>Fecha: {new Date(file.timestamp).toLocaleString('es-ES')}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ opacity: 0.7 }}>No hay presentaciones guardadas</div>
            )}
          </div>

          {/* Imágenes */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>
              🖼️ Imágenes ({results.images.count})
            </h3>
            {results.images.sample.length > 0 && (
              <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                Muestra: {results.images.sample.slice(0, 5).map(img => img.filename).join(', ')}
                {results.images.count > 5 && ` ... y ${results.images.count - 5} más`}
              </div>
            )}
          </div>

          {/* Backups */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>
              💾 Backups ({results.backups.count})
            </h3>
            {results.backups.sample.length > 0 && (
              <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                {results.backups.sample.map(backup => backup.filename).join(', ')}
                {results.backups.count > 5 && ` ... y ${results.backups.count - 5} más`}
              </div>
            )}
          </div>

          {/* Contenido Actual */}
          <div>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>
              📄 Contenido Actual
            </h3>
            <div style={{
              padding: '0.75rem',
              background: results.content.exists ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${results.content.exists ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              borderRadius: '6px',
              fontSize: '0.85rem',
            }}>
              {results.content.exists ? (
                <>✅ Existe ({(results.content.size / 1024).toFixed(2)} KB)</>
              ) : (
                <>❌ No existe</>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
