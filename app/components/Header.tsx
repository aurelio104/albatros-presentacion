'use client'

interface HeaderProps {
  logoSrc?: string
  size?: number
}

export default function Header({ 
  logoSrc = '/images/logotB.png',
  size = 320
}: HeaderProps) {
  return (
    <>
      <style jsx>{`
        @keyframes glow {
          0%, 100% {
            filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.5))
                    drop-shadow(0 0 40px rgba(255, 255, 255, 0.3));
          }
          50% {
            filter: drop-shadow(0 0 30px rgba(255, 255, 255, 0.7))
                    drop-shadow(0 0 60px rgba(255, 255, 255, 0.5));
          }
        }

        .header {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 100;
          background: rgba(0, 0, 0, 0.2);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding: 1rem 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .header-logo-container {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .header-logo {
          width: ${size}px;
          height: auto;
          max-width: 90vw;
          filter: brightness(1.15) contrast(1.15) saturate(1.1);
          transition: all 0.3s ease;
          animation: glow 4s ease-in-out infinite;
        }

        .header-logo:hover {
          filter: brightness(1.3) contrast(1.2) saturate(1.2);
          transform: scale(1.05);
        }

        /* Large screens */
        @media (min-width: 1400px) {
          .header {
            padding: 1.25rem 2.5rem;
          }
          .header-logo {
            width: ${Math.min(size * 1.1, 400)}px;
          }
        }

        /* Tablets */
        @media (max-width: 1024px) and (min-width: 769px) {
          .header {
            padding: 0.875rem 1.5rem;
          }
          .header-logo {
            width: ${Math.min(size * 0.85, 280)}px;
          }
        }

        @media (max-width: 768px) {
          .header {
            padding: 0.75rem 1rem;
            background: rgba(0, 0, 0, 0.3);
          }
          .header-logo {
            width: clamp(140px, 25vw, 180px);
          }
        }

        @media (max-width: 640px) {
          .header {
            padding: 0.625rem 0.875rem;
          }
          .header-logo {
            width: clamp(120px, 22vw, 160px);
          }
        }

        @media (max-width: 480px) {
          .header {
            padding: 0.5rem 0.75rem;
          }
          .header-logo {
            width: clamp(100px, 20vw, 140px);
          }
        }

        @media (max-width: 360px) {
          .header-logo {
            width: clamp(90px, 18vw, 120px);
          }
        }

        /* Landscape mobile */
        @media (max-height: 500px) and (orientation: landscape) {
          .header {
            padding: 0.5rem 1rem;
          }
          .header-logo {
            width: clamp(80px, 15vw, 120px);
          }
        }

        /* Reduce motion for accessibility */
        @media (prefers-reduced-motion: reduce) {
          .header-logo {
            animation: none;
          }
          .header-logo:hover {
            transform: none;
          }
        }
      `}</style>
      <header className="header">
        <div className="header-logo-container">
          <img
            src={logoSrc}
            alt="Albatros Logo"
            className="header-logo"
            loading="eager"
          />
        </div>
      </header>
    </>
  )
}
