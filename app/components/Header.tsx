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
          padding: clamp(0.5rem, 1.5vw, 0.75rem) clamp(1rem, 3vw, 2rem);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          min-height: clamp(50px, 8vh, 70px);
          max-height: clamp(50px, 8vh, 70px);
        }

        .header-logo-container {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .header-logo {
          width: clamp(${Math.min(size * 0.6, 200)}px, 15vw, ${Math.min(size * 0.8, 250)}px);
          height: auto;
          max-width: 90vw;
          max-height: clamp(35px, 6vh, 50px);
          object-fit: contain;
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
            padding: clamp(0.5rem, 1vw, 0.7rem) clamp(1.5rem, 3vw, 2.5rem);
            min-height: clamp(55px, 8vh, 75px);
            max-height: clamp(55px, 8vh, 75px);
          }
          .header-logo {
            width: clamp(${Math.min(size * 0.65, 200)}px, 11vw, ${Math.min(size * 0.8, 250)}px);
            max-height: clamp(40px, 6vh, 55px);
          }
        }

        /* Tablets */
        @media (max-width: 1024px) and (min-width: 769px) {
          .header {
            padding: clamp(0.4rem, 0.8vw, 0.6rem) clamp(1rem, 2.5vw, 1.5rem);
            min-height: clamp(48px, 7vh, 65px);
            max-height: clamp(48px, 7vh, 65px);
          }
          .header-logo {
            width: clamp(${Math.min(size * 0.6, 160)}px, 13vw, ${Math.min(size * 0.7, 200)}px);
            max-height: clamp(35px, 5.5vh, 48px);
          }
        }

        @media (max-width: 768px) {
          .header {
            padding: clamp(0.35rem, 0.8vw, 0.5rem) clamp(0.75rem, 2vw, 1rem);
            background: rgba(0, 0, 0, 0.3);
            min-height: clamp(45px, 7vh, 60px);
            max-height: clamp(45px, 7vh, 60px);
          }
          .header-logo {
            width: clamp(90px, 16vw, 130px);
            max-height: clamp(30px, 5vh, 42px);
          }
        }

        @media (max-width: 640px) {
          .header {
            padding: clamp(0.3rem, 0.7vw, 0.45rem) clamp(0.6rem, 1.5vw, 0.875rem);
            min-height: clamp(40px, 6vh, 55px);
            max-height: clamp(40px, 6vh, 55px);
          }
          .header-logo {
            width: clamp(80px, 14vw, 120px);
            max-height: clamp(28px, 4.5vh, 38px);
          }
        }

        @media (max-width: 480px) {
          .header {
            padding: clamp(0.25rem, 0.6vw, 0.4rem) clamp(0.5rem, 1.2vw, 0.75rem);
            min-height: clamp(38px, 5.5vh, 52px);
            max-height: clamp(38px, 5.5vh, 52px);
          }
          .header-logo {
            width: clamp(70px, 12vw, 110px);
            max-height: clamp(25px, 4vh, 35px);
          }
        }

        @media (max-width: 360px) {
          .header {
            min-height: clamp(35px, 5vh, 48px);
            max-height: clamp(35px, 5vh, 48px);
          }
          .header-logo {
            width: clamp(65px, 11vw, 100px);
            max-height: clamp(22px, 3.5vh, 32px);
          }
        }

        /* Landscape mobile */
        @media (max-height: 500px) and (orientation: landscape) {
          .header {
            padding: clamp(0.2rem, 0.4vw, 0.35rem) clamp(0.5rem, 1vw, 1rem);
            min-height: clamp(32px, 4.5vh, 45px);
            max-height: clamp(32px, 4.5vh, 45px);
          }
          .header-logo {
            width: clamp(55px, 9vw, 90px);
            max-height: clamp(20px, 3vh, 30px);
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
                fetchPriority="high"
                decoding="async"
              />
        </div>
      </header>
    </>
  )
}
