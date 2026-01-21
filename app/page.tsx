'use client'

import { useState, useEffect } from 'react'
import VideoBackground from './components/VideoBackground'
import WidgetGrid from './components/WidgetGrid'
import InfoModal from './components/InfoModal'
import LogoCenter from './components/LogoCenter'
import { WidgetData, AppContent } from './types'

export default function Home() {
  const [selectedWidget, setSelectedWidget] = useState<WidgetData | null>(null)
  const [content, setContent] = useState<AppContent | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    try {
      const response = await fetch('/api/content')
      if (response.ok) {
        const data = await response.json()
        setContent(data)
      } else {
        // Fallback a datos por defecto si hay error
        console.error('Error al cargar contenido, usando datos por defecto')
      }
    } catch (error) {
      console.error('Error al cargar contenido:', error)
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
        background: '#000',
        color: '#fff'
      }}>
        <div>Cargando...</div>
      </main>
    )
  }

  if (!content) {
    return (
      <main style={{ 
        position: 'relative', 
        width: '100vw', 
        height: '100vh', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000',
        color: '#fff'
      }}>
        <div>Error al cargar el contenido</div>
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
    <main style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <VideoBackground videoSrc={content.settings.videoBackground} overlay={content.settings.overlay} />
      <LogoCenter 
        logoSrc={content.settings.logo.src}
        position={content.settings.logo.position}
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
  )
}
