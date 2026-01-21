'use client'

import { WidgetData } from '../types'
import { useEffect, useState } from 'react'

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
          white-space: pre-wrap; /* PRESERVAR: espacios, saltos de línea, formato original */
          word-wrap: break-word;
          overflow-wrap: break-word;
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
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={onClose} aria-label="Cerrar">
            ×
          </button>

          <h1 className="modal-title">{widget.content.title}</h1>

          <p className="modal-description">{widget.content.description}</p>

          {widget.content.images && widget.content.images.length > 0 && (
            <div className="modal-images">
              {widget.content.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${widget.content.title} ${index + 1}`}
                  className="modal-image"
                  loading="lazy"
                />
              ))}
            </div>
          )}

          {widget.content.additionalInfo && (
            <div className="modal-additional">
              <p className="modal-additional-text">{widget.content.additionalInfo}</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
