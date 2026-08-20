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
  const [pdfPage, setPdfPage] = useState(0)
  const pdfPages = widget.content.embedPdf ? (widget.content.images || []) : []
  const pdfAttachment = (widget.content.attachments || []).find((a) => a.type === 'pdf')

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (!widget.content.embedPdf || pdfPages.length === 0) return
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault()
        setPdfPage((page) => Math.min(pdfPages.length - 1, page + 1))
      }
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault()
        setPdfPage((page) => Math.max(0, page - 1))
      }
    }
    document.addEventListener('keydown', handleKeys)
    document.body.style.overflow = 'hidden'
    
    return () => {
      document.removeEventListener('keydown', handleKeys)
      document.body.style.overflow = 'unset'
    }
  }, [onClose, widget.content.embedPdf, pdfPages.length])

  return (
    <>
      <style jsx>{`
        .modal-overlay.pdf-mode {
          padding: 0;
          background-color: #000;
          align-items: stretch;
        }

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
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 3rem;
          max-width: 800px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6), 
                      0 0 0 1px rgba(255, 255, 255, 0.2) inset,
                      0 8px 32px rgba(31, 38, 135, 0.37);
          animation: slideUp 0.3s ease;
          border: 1px solid rgba(255, 255, 255, 0.3);
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

        .modal-content.with-pdf {
          max-width: 100vw;
          width: 100vw;
          height: 100vh;
          max-height: 100vh;
          padding: 0;
          border-radius: 0;
          border: none;
          background: #000;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .pdf-fullscreen {
          position: relative;
          flex: 1;
          min-height: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #000;
        }

        .pdf-slide {
          width: 100%;
          height: 100%;
          object-fit: contain;
          background: #000;
          user-select: none;
        }

        .pdf-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 52px;
          height: 52px;
          border: none;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.55);
          color: #fff;
          font-size: 1.8rem;
          cursor: pointer;
          z-index: 12;
        }

        .pdf-nav:disabled {
          opacity: 0.3;
          cursor: default;
        }

        .pdf-nav.prev { left: 16px; }
        .pdf-nav.next { right: 16px; }

        .pdf-bar {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 0.75rem 1rem;
          background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
          color: #fff;
          z-index: 12;
        }

        .pdf-bar a, .pdf-bar button {
          color: #fff;
          background: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.25);
          border-radius: 8px;
          padding: 0.4rem 0.75rem;
          text-decoration: none;
          font-size: 0.85rem;
          cursor: pointer;
        }

        .modal-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
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
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .modal-close:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.1) rotate(90deg);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
        }

        .modal-title {
          font-size: 2.5rem;
          font-weight: bold;
          margin-bottom: 1.5rem;
          color: #ffffff;
          line-height: 1.2;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
          background: linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.9) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .modal-description {
          font-size: 1.2rem;
          line-height: 1.8;
          margin-bottom: 2rem;
          color: rgba(255, 255, 255, 0.95);
          word-wrap: break-word;
          overflow-wrap: break-word;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
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
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          padding: 1.5rem;
          border-radius: 12px;
          margin-top: 2rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        }

        .modal-additional-text {
          font-size: 1rem;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.9);
          white-space: pre-wrap; /* PRESERVAR: espacios, saltos de línea, formato original */
          word-wrap: break-word;
          overflow-wrap: break-word;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
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
            padding: clamp(0.25rem, 1vw, 0.5rem);
          }

          .modal-content {
            padding: clamp(1.5rem, 4vw, 2rem) clamp(1rem, 3vw, 1.5rem);
            border-radius: clamp(14px, 3vw, 16px);
            max-height: 95vh;
            max-width: calc(100vw - 1rem);
          }

          .modal-close {
            top: clamp(0.5rem, 1.5vw, 0.75rem);
            right: clamp(0.5rem, 1.5vw, 0.75rem);
            width: clamp(32px, 8vw, 36px);
            height: clamp(32px, 8vw, 36px);
            font-size: clamp(1.1rem, 3vw, 1.3rem);
          }

          .modal-title {
            font-size: clamp(1.5rem, 5vw, 1.75rem);
            margin-bottom: clamp(0.75rem, 2vh, 1rem);
            padding-right: clamp(2rem, 5vw, 2.5rem);
          }

          .modal-description {
            font-size: clamp(0.9rem, 3.5vw, 1rem);
            line-height: 1.6;
            margin-bottom: clamp(1rem, 2vh, 1.5rem);
          }

          .modal-images {
            grid-template-columns: 1fr;
            gap: clamp(0.5rem, 1.5vw, 0.75rem);
            margin-bottom: clamp(1rem, 2vh, 1.5rem);
          }

          .modal-image {
            height: clamp(150px, 25vh, 180px);
          }

          .modal-additional {
            padding: clamp(0.75rem, 2vw, 1rem);
            margin-top: clamp(1rem, 2vh, 1.5rem);
          }

          .modal-additional-text {
            font-size: clamp(0.85rem, 3vw, 0.9rem);
          }
        }

        @media (max-width: 480px) {
          .modal-content {
            padding: clamp(1rem, 3vw, 1.5rem) clamp(0.75rem, 2vw, 1rem);
            border-radius: clamp(10px, 2.5vw, 12px);
            max-width: calc(100vw - 1rem);
            margin: 0.5rem;
          }

          .modal-title {
            font-size: clamp(1.25rem, 5vw, 1.5rem);
            padding-right: clamp(1.5rem, 4vw, 2rem);
            margin-bottom: clamp(0.75rem, 2vh, 1rem);
          }

          .modal-description {
            font-size: clamp(0.875rem, 3.5vw, 0.95rem);
            line-height: 1.5;
          }

          .modal-image {
            height: clamp(120px, 30vh, 150px);
          }
          
          .modal-additional {
            padding: clamp(0.75rem, 2vw, 1rem);
            margin-top: clamp(1rem, 2vh, 1.5rem);
          }
        }
        
        @media (max-width: 360px) {
          .modal-content {
            padding: 1rem 0.75rem;
            border-radius: 10px;
            max-width: calc(100vw - 0.5rem);
            margin: 0.25rem;
          }

          .modal-title {
            font-size: clamp(1.1rem, 6vw, 1.3rem);
            padding-right: 1.5rem;
          }

          .modal-description {
            font-size: clamp(0.8rem, 4vw, 0.9rem);
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
      <div className={`modal-overlay${widget.content.embedPdf ? ' pdf-mode' : ''}`} onClick={onClose}>
        <div 
          className={`modal-content ${(widget.style?.fullPageImage || widget.style?.backgroundImage) ? 'with-background' : ''} ${widget.style?.fullPageImage ? 'with-full-page' : ''} ${widget.content.embedPdf ? 'with-pdf' : ''}`}
          style={(widget.style?.fullPageImage || widget.style?.backgroundImage) ? {
            '--modal-bg-image': `url(${ensureHttps(widget.style.fullPageImage || widget.style.backgroundImage)})`,
            '--modal-bg-overlay': widget.style.fullPageImage ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.6)'
          } as React.CSSProperties : {}}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="modal-close" onClick={onClose} aria-label="Cerrar">
            ×
          </button>

          {!widget.content.embedPdf && (
            <h1 className="modal-title">{widget.title}</h1>
          )}

          {widget.content.embedPdf && (
            <div className="pdf-fullscreen">
              {pdfPages.length > 0 ? (
                <img
                  className="pdf-slide"
                  src={ensureHttps(pdfPages[pdfPage])}
                  alt={`${widget.title} — página ${pdfPage + 1} de ${pdfPages.length}`}
                />
              ) : pdfAttachment ? (
                <iframe
                  className="pdf-slide"
                  src={`${ensureHttps(pdfAttachment.url)}#toolbar=1&navpanes=0&view=Fit`}
                  title={pdfAttachment.filename}
                />
              ) : (
                <p className="modal-description">No hay PDF de mantenimiento anexado.</p>
              )}

              {pdfPages.length > 1 && (
                <>
                  <button
                    className="pdf-nav prev"
                    onClick={() => setPdfPage((page) => Math.max(0, page - 1))}
                    disabled={pdfPage === 0}
                    aria-label="Página anterior"
                  >
                    ‹
                  </button>
                  <button
                    className="pdf-nav next"
                    onClick={() => setPdfPage((page) => Math.min(pdfPages.length - 1, page + 1))}
                    disabled={pdfPage === pdfPages.length - 1}
                    aria-label="Página siguiente"
                  >
                    ›
                  </button>
                </>
              )}

              <div className="pdf-bar">
                <span>{widget.title} · {pdfPage + 1} / {pdfPages.length || 3}</span>
                {pdfAttachment && (
                  <a href={ensureHttps(pdfAttachment.url)} target="_blank" rel="noopener noreferrer">
                    Abrir PDF original
                  </a>
                )}
              </div>
            </div>
          )}

          {!widget.content.embedPdf && (() => {
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

          {!widget.content.embedPdf && widget.content.additionalInfo && (
            <div className="modal-additional">
              <p className="modal-additional-text">{widget.content.additionalInfo}</p>
            </div>
          )}

          {/* Archivos Adjuntos */}
          {!widget.content.embedPdf && widget.content.attachments && widget.content.attachments.length > 0 && (
            <div style={{
              marginTop: '2rem',
              padding: '1.5rem',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
            }}>
              <h3 style={{
                fontSize: '1.3rem',
                fontWeight: '600',
                marginBottom: '1rem',
                color: '#ffffff',
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
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
                      background: 'rgba(255, 255, 255, 0.15)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      borderRadius: '8px',
                      padding: '1rem',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
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
                      color: 'rgba(255, 255, 255, 0.95)',
                      wordBreak: 'break-word',
                      marginBottom: '0.5rem',
                      textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                    }}>
                      <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                        {attachment.filename}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.8)' }}>
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
