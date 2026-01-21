'use client'

import { WidgetData } from '../types'
import { useEffect, useRef, useState } from 'react'

interface WidgetGridProps {
  widgets: WidgetData[]
  onWidgetClick: (widget: WidgetData) => void
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
      <p
        style={{
          color: defaultStyle.textColor ? `${defaultStyle.textColor}dd` : 'rgba(255, 255, 255, 0.9)',
          fontSize: 'clamp(0.9rem, 3vw, 1rem)',
          textAlign: 'center',
          lineHeight: '1.5',
          wordWrap: 'break-word',
        }}
      >
        {widget.preview}
      </p>
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
