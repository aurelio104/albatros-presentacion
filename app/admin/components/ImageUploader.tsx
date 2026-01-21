'use client'

import { useState } from 'react'

interface ImageUploaderProps {
  onUpload?: (url: string) => void
}

export default function ImageUploader({ onUpload }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen')
      return
    }

    // Validar tamaño (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('El archivo es demasiado grande. Máximo 10MB')
      return
    }

    // Preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
      const response = await fetch(`${backendUrl}/api/upload`, {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok && data.url) {
        if (onUpload) {
          onUpload(data.url)
        }
        alert('Imagen subida exitosamente')
        setPreview(null)
        e.target.value = '' // Reset input
      } else {
        const errorMsg = data?.error || data?.details || 'Error al subir la imagen'
        console.error('Error en upload:', data)
        alert(`Error: ${errorMsg}`)
      }
    } catch (error: any) {
      console.error('Error al subir la imagen:', error)
      alert(`Error de conexión: ${error?.message || 'Error desconocido'}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <div
        style={{
          border: '2px dashed rgba(255, 255, 255, 0.3)',
          borderRadius: '12px',
          padding: '2rem',
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(5px)',
          transition: 'all 0.3s',
          cursor: uploading ? 'wait' : 'pointer',
        }}
        onDragOver={(e) => {
          e.preventDefault()
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.6)'
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
        }}
        onDragLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
        }}
        onDrop={(e) => {
          e.preventDefault()
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
          
          const file = e.dataTransfer.files[0]
          if (file && file.type.startsWith('image/')) {
            const input = document.createElement('input')
            input.type = 'file'
            input.accept = 'image/*'
            const dataTransfer = new DataTransfer()
            dataTransfer.items.add(file)
            input.files = dataTransfer.files
            handleFileSelect({ target: input } as any)
          }
        }}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={uploading}
          style={{ display: 'none' }}
          id="image-upload"
        />
        <label
          htmlFor="image-upload"
          style={{
            cursor: uploading ? 'wait' : 'pointer',
            display: 'block',
          }}
        >
          {uploading ? (
            <div>
              <p style={{ margin: 0, color: '#ffffff', fontWeight: '600' }}>
                Subiendo...
              </p>
            </div>
          ) : (
            <div>
              <p style={{ margin: 0, color: '#ffffff', fontSize: '1.1rem' }}>
                📷 Arrastra una imagen aquí o haz clic para seleccionar
              </p>
              <p style={{ margin: '0.5rem 0 0 0', color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
                Máximo 10MB - JPG, PNG, WEBP, GIF
              </p>
            </div>
          )}
        </label>
      </div>

      {preview && (
        <div
          style={{
            marginTop: '1rem',
            borderRadius: '8px',
            overflow: 'hidden',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            background: 'rgba(255, 255, 255, 0.05)',
          }}
        >
          <img
            src={preview}
            alt="Preview"
            style={{
              width: '100%',
              maxHeight: '300px',
              objectFit: 'contain',
            }}
          />
        </div>
      )}
    </div>
  )
}
