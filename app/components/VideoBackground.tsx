'use client'

export default function VideoBackground() {
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
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      >
        {/* Video de fondo */}
        <source src="/videos/video1.MP4" type="video/mp4" />
        {/* Fallback si el video no carga */}
        Tu navegador no soporta videos HTML5.
      </video>
      {/* Overlay oscuro para mejor legibilidad */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
        }}
      />
    </div>
  )
}
