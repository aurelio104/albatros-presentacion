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
          min-height: clamp(60px, 12vh, 80px);
          max-height: clamp(60px, 12vh, 80px);
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
          max-height: clamp(40px, 8vh, 60px);
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
            padding: clamp(0.6rem, 1.2vw, 0.8rem) clamp(1.5rem, 3vw, 2.5rem);
            min-height: clamp(65px, 10vh, 85px);
            max-height: clamp(65px, 10vh, 85px);
          }
          .header-logo {
            width: clamp(${Math.min(size * 0.7, 220)}px, 12vw, ${Math.min(size * 0.9, 280)}px);
            max-height: clamp(45px, 7vh, 65px);
          }
        }

        /* Tablets */
        @media (max-width: 1024px) and (min-width: 769px) {
          .header {
            padding: clamp(0.5rem, 1vw, 0.7rem) clamp(1rem, 2.5vw, 1.5rem);
            min-height: clamp(55px, 9vh, 75px);
            max-height: clamp(55px, 9vh, 75px);
          }
          .header-logo {
            width: clamp(${Math.min(size * 0.65, 180)}px, 14vw, ${Math.min(size * 0.75, 220)}px);
            max-height: clamp(40px, 6vh, 55px);
          }
        }

        @media (max-width: 768px) {
          .header {
            padding: clamp(0.4rem, 1vw, 0.6rem) clamp(0.75rem, 2vw, 1rem);
            background: rgba(0, 0, 0, 0.3);
            min-height: clamp(50px, 8vh, 70px);
            max-height: clamp(50px, 8vh, 70px);
          }
          .header-logo {
            width: clamp(100px, 18vw, 150px);
            max-height: clamp(35px, 6vh, 50px);
          }
        }

        @media (max-width: 640px) {
          .header {
            padding: clamp(0.35rem, 0.8vw, 0.5rem) clamp(0.6rem, 1.5vw, 0.875rem);
            min-height: clamp(45px, 7vh, 65px);
            max-height: clamp(45px, 7vh, 65px);
          }
          .header-logo {
            width: clamp(90px, 16vw, 130px);
            max-height: clamp(30px, 5vh, 45px);
          }
        }

        @media (max-width: 480px) {
          .header {
            padding: clamp(0.3rem, 0.7vw, 0.45rem) clamp(0.5rem, 1.2vw, 0.75rem);
            min-height: clamp(40px, 6vh, 60px);
            max-height: clamp(40px, 6vh, 60px);
          }
          .header-logo {
            width: clamp(80px, 14vw, 120px);
            max-height: clamp(28px, 4.5vh, 40px);
          }
        }

        @media (max-width: 360px) {
          .header {
            min-height: clamp(38px, 5.5vh, 55px);
            max-height: clamp(38px, 5.5vh, 55px);
          }
          .header-logo {
            width: clamp(70px, 12vw, 110px);
            max-height: clamp(25px, 4vh, 38px);
          }
        }

        /* Landscape mobile */
        @media (max-height: 500px) and (orientation: landscape) {
          .header {
            padding: clamp(0.25rem, 0.5vw, 0.4rem) clamp(0.5rem, 1vw, 1rem);
            min-height: clamp(35px, 5vh, 50px);
            max-height: clamp(35px, 5vh, 50px);
          }
          .header-logo {
            width: clamp(60px, 10vw, 100px);
            max-height: clamp(22px, 3.5vh, 35px);
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
