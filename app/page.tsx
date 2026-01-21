'use client'

import { useState, useEffect } from 'react'
import VideoBackground from './components/VideoBackground'
import WidgetGrid from './components/WidgetGrid'
import InfoModal from './components/InfoModal'
import Header from './components/Header'
import { WidgetData, AppContent, WidgetCategory } from './types'

export default function Home() {
  const [selectedWidget, setSelectedWidget] = useState<WidgetData | null>(null)
  const [content, setContent] = useState<AppContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<WidgetCategory | 'all'>('all')

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
      const response = await fetch('/api/content', {
        cache: 'no-store',
      })
      if (response.ok) {
        const data = await response.json()
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

  // Ordenar widgets por order si existe y filtrar por categoría
  const sortedWidgets = [...content.widgets]
    .filter(widget => selectedCategory === 'all' || widget.category === selectedCategory)
    .sort((a, b) => {
      const orderA = a.order ?? a.id
      const orderB = b.order ?? b.id
      return orderA - orderB
    })

  // Obtener categorías únicas
  const categories: WidgetCategory[] = ['operaciones', 'economico', 'tecnologico', 'estrategico', 'recursos', 'calidad', 'otro']
  const categoryLabels: Record<WidgetCategory | 'all', string> = {
    all: 'Todos',
    operaciones: 'Operaciones',
    economico: 'Económico',
    tecnologico: 'Tecnológico',
    estrategico: 'Estratégico',
    recursos: 'Recursos',
    calidad: 'Calidad',
    otro: 'Otro',
  }

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
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          -webkit-overflow-scrolling: touch;
        }

        @media (max-width: 768px) {
          main {
            height: 100vh;
            height: -webkit-fill-available;
          }
        }

        @media (orientation: landscape) and (max-height: 500px) {
          main {
            height: auto;
            min-height: 100vh;
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
        
        {/* Filtros de categoría */}
        <div
          style={{
            position: 'fixed',
            top: '100px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 5,
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
            padding: '0.5rem',
            background: 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            maxWidth: '90vw',
          }}
        >
          {(['all', ...categories] as const).map((category) => {
            const isActive = selectedCategory === category
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                style={{
                  padding: '0.5rem 1rem',
                  background: isActive 
                    ? 'rgba(102, 126, 234, 0.6)' 
                    : 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  border: `1px solid ${isActive ? 'rgba(102, 126, 234, 0.8)' : 'rgba(255, 255, 255, 0.2)'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: 'clamp(0.75rem, 1.8vw, 0.9rem)',
                  fontWeight: isActive ? '600' : '400',
                  transition: 'all 0.3s ease',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                {categoryLabels[category]}
              </button>
            )
          })}
        </div>

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
