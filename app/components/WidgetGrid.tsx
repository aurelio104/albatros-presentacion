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
        border: `1px solid ${defaultStyle.borderColor || 'rgba(255, 255, 255, 0.2)'}`,
        borderRadius: defaultStyle.borderRadius ? `${defaultStyle.borderRadius}px` : '16px',
        padding: '2rem',
        minWidth: '280px',
        maxWidth: '320px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
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
          fontSize: '1.5rem',
          fontWeight: 'bold',
          marginBottom: '1rem',
          textAlign: 'center',
        }}
      >
        {widget.title}
      </h2>
      <p
        style={{
          color: defaultStyle.textColor ? `${defaultStyle.textColor}dd` : 'rgba(255, 255, 255, 0.9)',
          fontSize: '1rem',
          textAlign: 'center',
          lineHeight: '1.5',
        }}
      >
        {widget.preview}
      </p>
      <div
        style={{
          marginTop: '1.5rem',
          textAlign: 'center',
          color: defaultStyle.textColor ? `${defaultStyle.textColor}cc` : 'rgba(255, 255, 255, 0.8)',
          fontSize: '0.9rem',
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
        }

        .widget-item {
          min-width: 280px;
          max-width: 320px;
        }

        @media (max-width: 768px) {
          .widget-grid {
            padding-top: 200px;
            align-items: flex-start;
            padding-bottom: 2rem;
          }
          .widget-item {
            min-width: 250px;
            max-width: 100%;
            width: calc(50% - 1rem);
          }
        }

        @media (max-width: 480px) {
          .widget-grid {
            padding-top: 160px;
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
