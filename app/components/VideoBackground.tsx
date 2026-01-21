'use client'

import { useEffect, useState } from 'react'

interface VideoBackgroundProps {
  videoSrc?: string
  overlay?: {
    opacity: number
    color: string
  }
}

export default function VideoBackground({ 
  videoSrc = '/videos/video1.MP4',
  overlay = { opacity: 0.4, color: 'rgba(0, 0, 0, 0.4)' }
}: VideoBackgroundProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Convertir color rgba a formato válido
  const overlayColor = overlay.color || 'rgba(0, 0, 0, 0.4)'
  const overlayOpacity = overlay.opacity ?? 0.4
  
  let finalColor = overlayColor
  if (overlayColor.startsWith('rgba')) {
    const rgbaMatch = overlayColor.match(/rgba?\(([^)]+)\)/)
    if (rgbaMatch) {
      const values = rgbaMatch[1].split(',').map(v => v.trim())
      if (values.length >= 3) {
        finalColor = `rgba(${values[0]}, ${values[1]}, ${values[2]}, ${overlayOpacity})`
      }
    }
  }

  // En móviles, usar menos overlay para mejor visibilidad
  const mobileOverlay = isMobile ? overlayOpacity * 0.7 : overlayOpacity
  const finalOverlayColor = isMobile 
    ? finalColor.replace(/[\d.]+\)$/, `${mobileOverlay})`)
    : finalColor

  return (
    <>
      <style jsx>{`
        .video-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1;
          overflow: hidden;
        }

        .video-element {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .video-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: ${finalOverlayColor};
          transition: background-color 0.3s ease;
        }

        .video-fallback {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.2rem;
        }

        @media (max-width: 768px) {
          .video-element {
            object-position: center;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .video-element {
            animation: none;
          }
        }
      `}</style>
      <div className="video-container">
        {!videoError ? (
          <>
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="video-element"
              onLoadedData={() => setIsLoading(false)}
              onError={() => {
                setVideoError(true)
                setIsLoading(false)
              }}
            >
              <source src={videoSrc} type="video/mp4" />
            </video>
            {isLoading && (
              <div className="video-fallback">
                <div>Cargando video...</div>
              </div>
            )}
          </>
        ) : (
          <div className="video-fallback">
            <div>Video no disponible</div>
          </div>
        )}
        <div className="video-overlay" />
      </div>
    </>
  )
}
