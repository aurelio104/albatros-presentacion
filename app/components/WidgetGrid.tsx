'use client'

import { WidgetData } from '../types'

interface WidgetGridProps {
  widgets: WidgetData[]
  onWidgetClick: (widget: WidgetData) => void
}

export default function WidgetGrid({ widgets, onWidgetClick }: WidgetGridProps) {
  return (
    <div
      style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'flex-end',
        gap: '2rem',
        padding: '2rem',
        paddingBottom: '4rem',
      }}
    >
      {widgets.map((widget) => (
        <div
          key={widget.id}
          onClick={() => onWidgetClick(widget)}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            padding: '2rem',
            minWidth: '280px',
            maxWidth: '320px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-10px) scale(1.05)'
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)'
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
          }}
        >
          <h2
            style={{
              color: '#ffffff',
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
              color: 'rgba(255, 255, 255, 0.9)',
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
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '0.9rem',
            }}
          >
            Click para más información →
          </div>
        </div>
      ))}
    </div>
  )
}
