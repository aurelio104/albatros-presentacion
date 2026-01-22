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
          
          @media (max-width: 768px) {
            * {
              touch-action: manipulation;
            }
          }
          
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
              opacity: 1;
            }
            50% {
              transform: scale(1.1);
              opacity: 0.8;
            }
          }
          
          @keyframes float {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-10px);
            }
          }
          
          .unavailable-icon-container {
            display: flex;
            justify-content: center;
            gap: 1.5rem;
            margin-top: 2rem;
            flex-wrap: wrap;
          }
          
          .unavailable-icon-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
            animation: float 3s ease-in-out infinite;
          }
          
          .unavailable-icon-item:nth-child(1) {
            animation-delay: 0s;
          }
          
          .unavailable-icon-item:nth-child(2) {
            animation-delay: 0.5s;
          }
          
          .unavailable-icon-item:nth-child(3) {
            animation-delay: 1s;
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
          <div style={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '2rem',
            paddingTop: 'clamp(90px, 15vh, 110px)',
            minHeight: 'calc(100vh - clamp(90px, 15vh, 110px))',
          }}>
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '16px',
                padding: 'clamp(2rem, 5vw, 3rem)',
                minWidth: '280px',
                maxWidth: '500px',
                width: '100%',
                margin: '0 auto',
                cursor: 'default',
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                WebkitTapHighlightColor: 'transparent',
                animation: 'fadeInUp 0.6s ease-out',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)'
                e.currentTarget.style.boxShadow = '0 12px 40px 0 rgba(31, 38, 135, 0.5)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)'
                e.currentTarget.style.boxShadow = '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
              }}
            >
              {/* Icono principal con animación */}
              <div style={{
                fontSize: 'clamp(3rem, 8vw, 5rem)',
                marginBottom: '1.5rem',
                textAlign: 'center',
                animation: 'pulse 2s ease-in-out infinite',
                filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.5))',
              }}>
                🔒
              </div>
              
              <h2 style={{
                color: '#ffffff',
                fontSize: 'clamp(1.5rem, 5vw, 2rem)',
                fontWeight: 'bold',
                marginBottom: '1rem',
                textAlign: 'center',
                lineHeight: '1.3',
                wordWrap: 'break-word',
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
              }}>
                Proyecto No Disponible
              </h2>
              
              <p style={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: 'clamp(0.9rem, 3vw, 1.1rem)',
                textAlign: 'center',
                lineHeight: '1.6',
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                marginBottom: '1.5rem',
                textShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
              }}>
                El proyecto está temporalmente oculto. Por favor, contacta al administrador para más información.
              </p>
              
              {/* Iconos modernos con animación flotante */}
              <div className="unavailable-icon-container">
                <div className="unavailable-icon-item">
                  <div style={{
                    fontSize: '2rem',
                    filter: 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.6))',
                  }}>
                    🔐
                  </div>
                  <span style={{
                    fontSize: '0.75rem',
                    color: 'rgba(255, 255, 255, 0.7)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}>
                    Seguro
                  </span>
                </div>
                <div className="unavailable-icon-item">
                  <div style={{
                    fontSize: '2rem',
                    filter: 'drop-shadow(0 0 10px rgba(168, 85, 247, 0.6))',
                  }}>
                    ⏳
                  </div>
                  <span style={{
                    fontSize: '0.75rem',
                    color: 'rgba(255, 255, 255, 0.7)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}>
                    Temporal
                  </span>
                </div>
                <div className="unavailable-icon-item">
                  <div style={{
                    fontSize: '2rem',
                    filter: 'drop-shadow(0 0 10px rgba(34, 197, 94, 0.6))',
                  }}>
                    🔄
                  </div>
                  <span style={{
                    fontSize: '0.75rem',
                    color: 'rgba(255, 255, 255, 0.7)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}>
                    Pronto
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </>
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
