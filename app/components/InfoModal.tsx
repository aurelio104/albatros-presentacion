'use client'

import { WidgetData } from '../types'
import { useEffect, useState } from 'react'
import { ensureHttps } from '../utils/imageUrl'

interface InfoModalProps {
  widget: WidgetData
  onClose: () => void
}

export default function InfoModal({ widget, onClose }: InfoModalProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [onClose])

  return (
    <>
      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          padding: 1rem;
          animation: fadeIn 0.3s ease;
        }

        .modal-content {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 20px;
          padding: 3rem;
          max-width: 800px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          animation: slideUp 0.3s ease;
        }
        
        .modal-content.with-background {
          background-image: var(--modal-bg-image);
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          background-color: var(--modal-bg-overlay, rgba(0, 0, 0, 0.6)); /* Overlay para legibilidad */
        }
        
        .modal-content.with-full-page {
          background-color: var(--modal-bg-overlay, rgba(0, 0, 0, 0.1)); /* Overlay muy transparente para preservar diseño exacto */
        }

        .modal-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: rgba(0, 0, 0, 0.1);
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          cursor: pointer;
          font-size: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          z-index: 10;
        }

        .modal-close:hover {
          background: rgba(0, 0, 0, 0.2);
          transform: scale(1.1);
        }

        .modal-title {
          font-size: 2.5rem;
          font-weight: bold;
          margin-bottom: 1.5rem;
          color: #1a1a1a;
          line-height: 1.2;
        }

        .modal-description {
          font-size: 1.2rem;
          line-height: 1.8;
          margin-bottom: 2rem;
          color: #333;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        
        .modal-description img {
          max-width: 100%;
          height: auto;
          margin: 1rem 0;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .modal-images {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .modal-image {
          width: 100%;
          height: 200px;
          object-fit: cover;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .modal-additional {
          background: rgba(0, 0, 0, 0.05);
          padding: 1.5rem;
          border-radius: 12px;
          margin-top: 2rem;
        }

        .modal-additional-text {
          font-size: 1rem;
          line-height: 1.6;
          color: #555;
          white-space: pre-wrap; /* PRESERVAR: espacios, saltos de línea, formato original */
          word-wrap: break-word;
          overflow-wrap: break-word;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @media (max-width: 768px) {
          .modal-overlay {
            padding: 0.5rem;
          }

          .modal-content {
            padding: 2rem 1.5rem;
            border-radius: 16px;
            max-height: 95vh;
          }

          .modal-close {
            top: 0.75rem;
            right: 0.75rem;
            width: 36px;
            height: 36px;
            font-size: 1.3rem;
          }

          .modal-title {
            font-size: 1.75rem;
            margin-bottom: 1rem;
            padding-right: 2.5rem;
          }

          .modal-description {
            font-size: 1rem;
            line-height: 1.6;
            margin-bottom: 1.5rem;
          }

          .modal-images {
            grid-template-columns: 1fr;
            gap: 0.75rem;
            margin-bottom: 1.5rem;
          }

          .modal-image {
            height: 180px;
          }

          .modal-additional {
            padding: 1rem;
            margin-top: 1.5rem;
          }

          .modal-additional-text {
            font-size: 0.9rem;
          }
        }

        @media (max-width: 480px) {
          .modal-content {
            padding: 1.5rem 1rem;
            border-radius: 12px;
          }

          .modal-title {
            font-size: 1.5rem;
            padding-right: 2rem;
          }

          .modal-description {
            font-size: 0.95rem;
          }

          .modal-image {
            height: 150px;
          }
        }

        @media (max-height: 600px) {
          .modal-content {
            max-height: 98vh;
            padding: 1.5rem;
          }

          .modal-title {
            font-size: 1.5rem;
            margin-bottom: 0.75rem;
          }

          .modal-description {
            font-size: 1rem;
            margin-bottom: 1rem;
          }
        }
      `}</style>
      <div className="modal-overlay" onClick={onClose}>
        <div 
          className={`modal-content ${(widget.style?.fullPageImage || widget.style?.backgroundImage) ? 'with-background' : ''} ${widget.style?.fullPageImage ? 'with-full-page' : ''}`}
          style={(widget.style?.fullPageImage || widget.style?.backgroundImage) ? {
            '--modal-bg-image': `url(${ensureHttps(widget.style.fullPageImage || widget.style.backgroundImage)})`,
            '--modal-bg-overlay': widget.style.fullPageImage ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.6)'
          } as React.CSSProperties : {}}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="modal-close" onClick={onClose} aria-label="Cerrar">
            ×
          </button>

          <h1 className="modal-title">{widget.title}</h1>

          {/* Renderizar descripción con imágenes inline si están en HTML */}
          {(() => {
            // En el modal siempre mostrar contenido completo, independientemente del displayMode
            let content = widget.content.description || widget.preview || ''
            const hasHTML = content && /<img\s+src=/i.test(content)
            const hasImagesArray = widget.content.images && widget.content.images.length > 0
            
            // Si hay imágenes en el array pero no en el HTML, agregarlas al final
            if (hasImagesArray && !hasHTML) {
              const imagesHTML = widget.content.images.map((img: string) => {
                const httpsSrc = ensureHttps(img)
                return `<img src="${httpsSrc}" alt="Imagen" style="max-width: 100%; height: auto; margin: 1rem 0; border-radius: 8px; display: block; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);" loading="lazy" onerror="this.onerror=null; this.style.display='none';" onload="this.style.display='block';" />`
              }).join('')
              content = content + (content ? '\n\n' : '') + imagesHTML
            }
            
            return (
              <div 
                className="modal-description"
                dangerouslySetInnerHTML={{
                  __html: content
                    .replace(/\n\n/g, '<br><br>') // Dobles saltos de línea
                    .replace(/\n/g, '<br>') // Saltos de línea simples
                    .replace(/<img\s+src="([^"]+)"[^>]*>/gi, (match, src) => {
                      const httpsSrc = ensureHttps(src)
                      // Manejar errores de carga de imagen silenciosamente
                      return `<img src="${httpsSrc}" alt="Imagen" style="max-width: 100%; height: auto; margin: 1rem 0; border-radius: 8px; display: block; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);" loading="lazy" onerror="this.onerror=null; this.style.display='none';" onload="this.style.display='block';" />`
                    })
                }}
              />
            )
          })()}

          {widget.content.additionalInfo && (
            <div className="modal-additional">
              <p className="modal-additional-text">{widget.content.additionalInfo}</p>
            </div>
          )}

          {/* Archivos Adjuntos */}
          {widget.content.attachments && widget.content.attachments.length > 0 && (
            <div style={{
              marginTop: '2rem',
              padding: '1.5rem',
              background: 'rgba(0, 0, 0, 0.05)',
              borderRadius: '12px',
            }}>
              <h3 style={{
                fontSize: '1.3rem',
                fontWeight: '600',
                marginBottom: '1rem',
                color: '#1a1a1a',
              }}>
                📎 Archivos Adjuntos
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '1rem',
              }}>
                {widget.content.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '8px',
                      padding: '1rem',
                      border: '1px solid rgba(0, 0, 0, 0.1)',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    {/* Vista previa - Siempre mostrar si existe */}
                    {attachment.previewUrl && attachment.previewUrl !== attachment.url && (
                      <div style={{ marginBottom: '0.75rem' }}>
                        <img
                          src={ensureHttps(attachment.previewUrl)}
                          alt={`Vista previa de ${attachment.filename}`}
                          style={{
                            width: '100%',
                            height: '200px',
                            objectFit: 'contain',
                            borderRadius: '6px',
                            background: '#f5f5f5',
                            border: '1px solid rgba(0, 0, 0, 0.1)',
                            padding: '0.5rem',
                          }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                          }}
                        />
                        <div style={{
                          fontSize: '0.75rem',
                          color: '#666',
                          marginTop: '0.25rem',
                          textAlign: 'center',
                        }}>
                          📄 Vista previa
                        </div>
                      </div>
                    )}
                    
                    {/* Información del archivo */}
                    <div style={{
                      fontSize: '0.9rem',
                      color: '#333',
                      wordBreak: 'break-word',
                      marginBottom: '0.5rem',
                    }}>
                      <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                        {attachment.filename}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#666' }}>
                        {attachment.type.toUpperCase()}
                        {attachment.size && ` • ${(attachment.size / 1024).toFixed(1)} KB`}
                      </div>
                    </div>

                    {/* Botón descargar */}
                    <a
                      href={ensureHttps(attachment.url)}
                      download={attachment.filename}
                      style={{
                        display: 'block',
                        padding: '0.5rem',
                        background: 'rgba(59, 130, 246, 0.9)',
                        color: 'white',
                        textAlign: 'center',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        fontSize: '0.85rem',
                        fontWeight: '500',
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(59, 130, 246, 1)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(59, 130, 246, 0.9)'
                      }}
                    >
                      📥 Descargar
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
