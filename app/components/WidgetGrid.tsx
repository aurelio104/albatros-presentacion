'use client'

import { WidgetData, WidgetCategory } from '../types'
import { useEffect, useRef, useState, useMemo, memo } from 'react'
import dynamic from 'next/dynamic'
import { ensureHttps } from '../utils/imageUrl'

interface WidgetGridProps {
  widgets: WidgetData[]
  onWidgetClick: (widget: WidgetData) => void
}

const categoryLabels: Record<WidgetCategory, string> = {
  operaciones: 'Operaciones',
  economico: 'Económico',
  tecnologico: 'Tecnológico',
  estrategico: 'Estratégico',
  recursos: 'Recursos',
  calidad: 'Calidad',
  otro: 'Otro',
}

const categoryColors: Record<WidgetCategory, string> = {
  operaciones: 'rgba(59, 130, 246, 0.8)',
  economico: 'rgba(34, 197, 94, 0.8)',
  tecnologico: 'rgba(168, 85, 247, 0.8)',
  estrategico: 'rgba(251, 146, 60, 0.8)',
  recursos: 'rgba(236, 72, 153, 0.8)',
  calidad: 'rgba(14, 165, 233, 0.8)',
  otro: 'rgba(156, 163, 175, 0.8)',
}

const getAnimationStyle = (animation: WidgetData['animation'], isVisible: boolean) => {
  if (!animation || animation.type === 'none' || !isVisible) {
    return {}
  }

  const duration = animation.duration || 0.5
  const delay = animation.delay || 0

  const animations: Record<string, any> = {
    fadeIn: { opacity: isVisible ? 1 : 0 },
    slideUp: { transform: isVisible ? 'translateY(0)' : 'translateY(30px)', opacity: isVisible ? 1 : 0 },
    slideDown: { transform: isVisible ? 'translateY(0)' : 'translateY(-30px)', opacity: isVisible ? 1 : 0 },
    slideLeft: { transform: isVisible ? 'translateX(0)' : 'translateX(30px)', opacity: isVisible ? 1 : 0 },
    slideRight: { transform: isVisible ? 'translateX(0)' : 'translateX(-30px)', opacity: isVisible ? 1 : 0 },
    scale: { transform: isVisible ? 'scale(1)' : 'scale(0.8)', opacity: isVisible ? 1 : 0 },
    rotate: { transform: isVisible ? 'rotate(0deg)' : 'rotate(-10deg)', opacity: isVisible ? 1 : 0 },
  }

  return {
    ...animations[animation.type] || {},
    transition: `all ${duration}s ease-out ${delay}s`,
  }
}

function WidgetItem({ widget, onWidgetClick }: { widget: WidgetData; onWidgetClick: (widget: WidgetData) => void }) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  const defaultStyle = widget.style || {}
  const animationStyle = getAnimationStyle(widget.animation, isVisible)

  return (
    <>
      <style jsx>{`
        .widget-content img {
          max-width: 100%;
          height: auto;
          margin: 0.5rem 0;
          border-radius: 8px;
          display: block;
          border: 2px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
      `}</style>
      <div
        ref={ref}
        onClick={() => onWidgetClick(widget)}
        style={{
        background: defaultStyle.backgroundColor || 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: `1px solid ${defaultStyle.borderColor || 'rgba(255, 255, 255, 0.2)'}`,
        borderRadius: defaultStyle.borderRadius ? `${defaultStyle.borderRadius}px` : '16px',
        padding: '2rem',
        minWidth: '280px',
        maxWidth: '320px',
        width: '100%',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        WebkitTapHighlightColor: 'transparent',
        ...animationStyle,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-10px) scale(1.05)'
        e.currentTarget.style.background = defaultStyle.backgroundColor 
          ? `${defaultStyle.backgroundColor}dd` 
          : 'rgba(255, 255, 255, 0.2)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = animationStyle.transform || 'translateY(0) scale(1)'
        e.currentTarget.style.background = defaultStyle.backgroundColor || 'rgba(255, 255, 255, 0.1)'
      }}
    >
      {widget.category && (
        <div
          style={{
            display: 'inline-block',
            padding: '0.25rem 0.75rem',
            background: categoryColors[widget.category],
            color: '#ffffff',
            borderRadius: '12px',
            fontSize: 'clamp(0.7rem, 1.8vw, 0.8rem)',
            fontWeight: '600',
            marginBottom: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            boxShadow: `0 2px 8px ${categoryColors[widget.category]}40`,
          }}
        >
          {categoryLabels[widget.category]}
        </div>
      )}
      <h2
        style={{
          color: defaultStyle.textColor || '#ffffff',
          fontSize: 'clamp(1.25rem, 4vw, 1.5rem)',
          fontWeight: 'bold',
          marginBottom: '1rem',
          textAlign: 'center',
          lineHeight: '1.3',
          wordWrap: 'break-word',
        }}
      >
        {widget.title}
      </h2>
      {/* Helper para detectar si el contenido tiene HTML (imágenes) */}
      {(() => {
        const content = widget.displayMode === 'completo' 
          ? widget.content.description || widget.preview
          : widget.preview
        
        const hasHTML = content && /<img\s+src=/i.test(content)
        
        if (hasHTML) {
          // Renderizar como HTML para mostrar imágenes
          return (
            <div
              className="widget-content"
              style={{
                color: defaultStyle.textColor ? `${defaultStyle.textColor}dd` : 'rgba(255, 255, 255, 0.9)',
                fontSize: 'clamp(0.9rem, 3vw, 1rem)',
                textAlign: 'center',
                lineHeight: '1.5',
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                wordBreak: 'break-word',
                hyphens: 'auto',
                maxHeight: widget.displayMode === 'resumen' ? '150px' : 'none',
                overflow: widget.displayMode === 'resumen' ? 'hidden' : 'visible',
                textOverflow: widget.displayMode === 'resumen' ? 'ellipsis' : 'clip',
              }}
              dangerouslySetInnerHTML={{
                __html: content
                  .replace(/\n\n/g, '<br><br>')
                  .replace(/\n/g, '<br>')
                  .replace(/<img\s+src="([^"]+)"[^>]*>/gi, (match, src) => {
                    const httpsSrc = ensureHttps(src)
                    return `<img src="${httpsSrc}" alt="Imagen" style="max-width: 100%; height: auto; margin: 0.5rem 0; border-radius: 8px; display: block; border: 2px solid rgba(255, 255, 255, 0.3);" loading="lazy" onerror="this.style.display='none'" />`
                  })
              }}
            />
          )
        } else {
          // Renderizar como texto plano
          return (
            <p
              style={{
                color: defaultStyle.textColor ? `${defaultStyle.textColor}dd` : 'rgba(255, 255, 255, 0.9)',
                fontSize: 'clamp(0.9rem, 3vw, 1rem)',
                textAlign: 'center',
                lineHeight: '1.5',
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                wordBreak: 'break-word',
                hyphens: 'auto',
                whiteSpace: 'pre-wrap', // PRESERVAR: espacios, saltos de línea, formato original
                maxHeight: widget.displayMode === 'resumen' ? '150px' : 'none',
                overflow: widget.displayMode === 'resumen' ? 'hidden' : 'visible',
                textOverflow: widget.displayMode === 'resumen' ? 'ellipsis' : 'clip',
              }}
            >
              {content}
            </p>
          )
        }
      })()}
      <div
        style={{
          marginTop: '1.5rem',
          textAlign: 'center',
          color: defaultStyle.textColor ? `${defaultStyle.textColor}cc` : 'rgba(255, 255, 255, 0.8)',
          fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)',
        }}
      >
        Click para más información →
      </div>
    </div>
    </>
  )
}

export default function WidgetGrid({ widgets, onWidgetClick }: WidgetGridProps) {
  return (
    <>
      <style jsx>{`
        .widget-grid {
          position: relative;
          z-index: 1;
          width: 100%;
          height: 100%;
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          align-items: center;
          gap: 2rem;
          padding: 2rem;
          padding-top: 120px;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }

        .widget-item {
          min-width: 280px;
          max-width: 320px;
          flex: 0 1 auto;
        }

        /* Large screens */
        @media (min-width: 1400px) {
          .widget-grid {
            gap: 2.5rem;
            padding: 2.5rem;
          }
          .widget-item {
            min-width: 300px;
            max-width: 340px;
          }
        }

        /* Medium screens */
        @media (max-width: 1024px) and (min-width: 769px) {
          .widget-grid {
            gap: 1.5rem;
            padding: 1.5rem;
          }
          .widget-item {
            min-width: 260px;
            max-width: 300px;
          }
        }

        /* Tablets */
        @media (max-width: 768px) {
          .widget-grid {
            padding-top: 100px;
            align-items: flex-start;
            padding-bottom: 2rem;
            gap: 1.5rem;
          }
          .widget-item {
            min-width: calc(50% - 0.75rem);
            max-width: calc(50% - 0.75rem);
            width: calc(50% - 0.75rem);
          }
        }

        /* Small tablets */
        @media (max-width: 640px) {
          .widget-grid {
            padding-top: 180px;
            gap: 1.25rem;
          }
          .widget-item {
            min-width: calc(50% - 0.625rem);
            max-width: calc(50% - 0.625rem);
            width: calc(50% - 0.625rem);
          }
        }

        /* Mobile */
        @media (max-width: 480px) {
          .widget-grid {
            padding-top: 90px;
            gap: 1rem;
            padding-left: 1rem;
            padding-right: 1rem;
          }
          .widget-item {
            min-width: 100%;
            max-width: 100%;
            width: 100%;
          }
        }

        /* Very small mobile */
        @media (max-width: 360px) {
          .widget-grid {
            padding-top: 80px;
            gap: 0.75rem;
            padding-left: 0.75rem;
            padding-right: 0.75rem;
          }
        }

        /* Landscape mobile */
        @media (max-height: 500px) and (orientation: landscape) {
          .widget-grid {
            padding-top: 70px;
            align-items: flex-start;
            padding-bottom: 1rem;
          }
        }

        /* Touch devices */
        @media (hover: none) and (pointer: coarse) {
          .widget-item {
            touch-action: manipulation;
          }
        }
      `}</style>
      <div className="widget-grid">
        {widgets.map((widget) => (
          <div key={widget.id} className="widget-item">
            <WidgetItem widget={widget} onWidgetClick={onWidgetClick} />
          </div>
        ))}
      </div>
    </>
  )
}
