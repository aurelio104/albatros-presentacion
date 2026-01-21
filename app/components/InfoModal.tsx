'use client'

import { WidgetData } from '../types'
import { useEffect } from 'react'

interface InfoModalProps {
  widget: WidgetData
  onClose: () => void
}

export default function InfoModal({ widget, onClose }: InfoModalProps) {
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
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: '2rem',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          padding: '3rem',
          maxWidth: '800px',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'rgba(0, 0, 0, 0.1)',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            cursor: 'pointer',
            fontSize: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.1)'
          }}
        >
          ×
        </button>

        <h1
          style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            marginBottom: '1.5rem',
            color: '#1a1a1a',
          }}
        >
          {widget.content.title}
        </h1>

        <p
          style={{
            fontSize: '1.2rem',
            lineHeight: '1.8',
            marginBottom: '2rem',
            color: '#333',
          }}
        >
          {widget.content.description}
        </p>

        {widget.content.images && widget.content.images.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem',
            }}
          >
            {widget.content.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`${widget.content.title} ${index + 1}`}
                style={{
                  width: '100%',
                  height: '200px',
                  objectFit: 'cover',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                }}
              />
            ))}
          </div>
        )}

        {widget.content.additionalInfo && (
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.05)',
              padding: '1.5rem',
              borderRadius: '12px',
              marginTop: '2rem',
            }}
          >
            <p
              style={{
                fontSize: '1rem',
                lineHeight: '1.6',
                color: '#555',
              }}
            >
              {widget.content.additionalInfo}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
