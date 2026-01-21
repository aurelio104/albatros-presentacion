'use client'

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
  // Convertir color rgba a formato válido
  const overlayColor = overlay.color || 'rgba(0, 0, 0, 0.4)'
  const overlayOpacity = overlay.opacity ?? 0.4
  
  // Extraer RGB del color si es rgba
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

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        overflow: 'hidden',
      }}
    >
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      >
        <source src={videoSrc} type="video/mp4" />
        Tu navegador no soporta videos HTML5.
      </video>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: finalColor,
        }}
      />
    </div>
  )
}
