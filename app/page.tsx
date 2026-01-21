'use client'

import { useState } from 'react'
import VideoBackground from './components/VideoBackground'
import WidgetGrid from './components/WidgetGrid'
import InfoModal from './components/InfoModal'
import LogoCenter from './components/LogoCenter'
import { WidgetData } from './types'

export default function Home() {
  const [selectedWidget, setSelectedWidget] = useState<WidgetData | null>(null)

  // Datos de ejemplo para los widgets - puedes modificar estos datos
  const widgets: WidgetData[] = [
    {
      id: 1,
      title: 'Sobre Albatros',
      preview: 'Conoce más sobre nuestra historia y misión',
      content: {
        title: 'Sobre Albatros',
        description: 'Albatros es una empresa dedicada a la innovación y excelencia. Con años de experiencia en el mercado, nos especializamos en brindar soluciones de calidad.',
        images: [
          // Puedes agregar URLs de imágenes aquí
          // '/images/albatros-1.jpg',
          // '/images/albatros-2.jpg',
        ],
        additionalInfo: 'Fundada con la visión de transformar el futuro, Albatros se ha convertido en un referente en su industria.'
      }
    },
    {
      id: 2,
      title: 'Nuestros Servicios',
      preview: 'Descubre todo lo que podemos ofrecerte',
      content: {
        title: 'Nuestros Servicios',
        description: 'Ofrecemos una amplia gama de servicios diseñados para satisfacer las necesidades de nuestros clientes.',
        images: [],
        additionalInfo: 'Desde consultoría hasta implementación, cubrimos todos los aspectos de tu proyecto.'
      }
    },
    {
      id: 3,
      title: 'Proyectos',
      preview: 'Explora nuestros trabajos más destacados',
      content: {
        title: 'Proyectos Destacados',
        description: 'Hemos trabajado en proyectos innovadores que han marcado la diferencia.',
        images: [],
        additionalInfo: 'Cada proyecto es una oportunidad de demostrar nuestro compromiso con la excelencia.'
      }
    },
    {
      id: 4,
      title: 'Contacto',
      preview: 'Ponte en contacto con nuestro equipo',
      content: {
        title: 'Contacto',
        description: 'Estamos aquí para ayudarte. Contáctanos y descubre cómo podemos trabajar juntos.',
        images: [],
        additionalInfo: 'Email: contacto@albatros.com | Teléfono: +1 234 567 890'
      }
    },
  ]

  return (
    <main style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <VideoBackground />
      <LogoCenter />
      <WidgetGrid 
        widgets={widgets} 
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
