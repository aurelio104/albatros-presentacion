'use client'

import { useState, useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import VideoBackground from './components/VideoBackground'
import Header from './components/Header'
import { WidgetData, AppContent } from './types'

// Lazy load componentes pesados
const WidgetGrid = dynamic(() => import('./components/WidgetGrid'), {
  loading: () => <div style={{ padding: '2rem', textAlign: 'center', color: 'white' }}>Cargando widgets...</div>,
  ssr: false,
})

const InfoModal = dynamic(() => import('./components/InfoModal'), {
  ssr: false,
})

export default function Home() {
  const [selectedWidget, setSelectedWidget] = useState<WidgetData | null>(null)
  const [content, setContent] = useState<AppContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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
    loadContent()
  }, [])

  const loadContent = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
      const response = await fetch(`${backendUrl}/api/content`, {
        cache: 'no-store',
      })
      if (response.ok) {
        const data = await response.json()
        // Normalizar URLs HTTP a HTTPS para todas las imágenes
        if (data.widgets) {
          data.widgets = data.widgets.map((widget: any) => {
            if (widget.content?.images) {
              widget.content.images = widget.content.images.map((img: string) => 
                img.startsWith('http://') ? img.replace('http://', 'https://') : img
              )
            }
            return widget
          })
        }
        setContent(data)
        setError(null)
      } else {
        setError('Error al cargar el contenido')
      }
    } catch (error) {
      console.error('Error al cargar contenido:', error)
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <main style={{ 
        position: 'relative', 
        width: '100vw', 
        height: '100vh', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff'
      }}>
        <div style={{
          textAlign: 'center',
          fontSize: isMobile ? '1rem' : '1.2rem'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid rgba(255,255,255,0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p>Cargando...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </main>
    )
  }

  if (error || !content) {
    return (
      <main style={{ 
        position: 'relative', 
        width: '100vw', 
        height: '100vh', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <div>
          <h1 style={{ fontSize: isMobile ? '1.5rem' : '2rem', marginBottom: '1rem' }}>
            {error || 'Error al cargar el contenido'}
          </h1>
          <button
            onClick={loadContent}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'white',
              color: '#667eea',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Reintentar
          </button>
        </div>
      </main>
    )
  }

  // Verificar si el proyecto está visible
  if (content.settings.isVisible === false) {
    return (
      <main style={{ 
        position: 'relative', 
        width: '100vw', 
        height: '100vh', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '3rem',
          maxWidth: '600px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🔒</div>
          <h1 style={{ fontSize: isMobile ? '1.75rem' : '2.5rem', marginBottom: '1rem', fontWeight: 'bold' }}>
            Proyecto No Disponible
          </h1>
          <p style={{ fontSize: isMobile ? '1rem' : '1.2rem', lineHeight: '1.6', opacity: 0.9 }}>
            El proyecto está temporalmente oculto. Por favor, contacta al administrador para más información.
          </p>
        </div>
      </main>
    )
  }

  // Ordenar widgets por order si existe
  const sortedWidgets = [...content.widgets].sort((a, b) => {
    const orderA = a.order ?? a.id
    const orderB = b.order ?? b.id
    return orderA - orderB
  })

  return (
    <>
      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        html, body {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          overflow-x: hidden;
        }

        main {
          position: relative;
          width: 100%;
          min-width: 100vw;
          height: 100vh;
          min-height: 100vh;
          overflow-x: hidden;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior-y: contain;
        }

        @media (max-width: 768px) {
          main {
            height: 100vh;
            height: -webkit-fill-available;
            min-height: -webkit-fill-available;
            overflow-y: auto;
            overflow-x: hidden;
          }
        }

        @media (orientation: landscape) and (max-height: 500px) {
          main {
            height: auto;
            min-height: 100vh;
            overflow-y: auto;
          }
        }
        
        /* Prevenir zoom en iOS al hacer doble tap */
        @media (max-width: 768px) {
          * {
            touch-action: manipulation;
          }
        }
      `}</style>
      <main>
        <VideoBackground 
          videoSrc={content.settings.videoBackground} 
          overlay={content.settings.overlay} 
        />
        <Header 
          logoSrc={content.settings.logo.src}
          size={content.settings.logo.size}
        />
        <WidgetGrid 
          widgets={sortedWidgets} 
          onWidgetClick={setSelectedWidget}
        />
        {selectedWidget && (
          <InfoModal
            widget={selectedWidget}
            onClose={() => setSelectedWidget(null)}
          />
        )}
      </main>
    </>
  )
}
