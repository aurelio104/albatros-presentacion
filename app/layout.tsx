import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Albatros Presentación',
  description: 'Presentación interactiva de Albatros',
  icons: {
    icon: [
      { url: '/images/logoB.png', type: 'image/png' },
      { url: '/images/logoB.png', sizes: '32x32', type: 'image/png' },
      { url: '/images/logoB.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/images/logoB.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/images/logoB.png',
  },
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#667eea',
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/images/logoB.png" type="image/png" />
        <link rel="apple-touch-icon" href="/images/logoB.png" />
        <link rel="shortcut icon" href="/images/logoB.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Albatros" />
      </head>
      <body>{children}</body>
    </html>
  )
}
