'use client'

interface LogoCenterProps {
  logoSrc?: string
  position?: 'top' | 'center' | 'bottom'
  size?: number
}

export default function LogoCenter({ 
  logoSrc = '/images/logotB.png',
  position = 'top',
  size = 320
}: LogoCenterProps) {
  const getTopPosition = () => {
    switch (position) {
      case 'top': return '5%'
      case 'center': return '50%'
      case 'bottom': return '95%'
      default: return '5%'
    }
  }

  const getTransform = () => {
    if (position === 'center') {
      return 'translate(-50%, -50%)'
    }
    return 'translateX(-50%)'
  }
  return (
    <>
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px) rotate(0deg);
          }
          33% {
            transform: translateY(-15px) translateX(5px) rotate(1deg);
          }
          66% {
            transform: translateY(-10px) translateX(-5px) rotate(-1deg);
          }
        }

        @keyframes glow {
          0%, 100% {
            filter: drop-shadow(0 0 25px rgba(255, 255, 255, 0.6))
                    drop-shadow(0 0 50px rgba(255, 255, 255, 0.4))
                    drop-shadow(0 0 75px rgba(255, 255, 255, 0.2))
                    drop-shadow(0 0 100px rgba(255, 255, 255, 0.1));
          }
          50% {
            filter: drop-shadow(0 0 35px rgba(255, 255, 255, 0.9))
                    drop-shadow(0 0 70px rgba(255, 255, 255, 0.6))
                    drop-shadow(0 0 105px rgba(255, 255, 255, 0.4))
                    drop-shadow(0 0 140px rgba(255, 255, 255, 0.2));
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.95;
            transform: scale(1.03);
          }
        }

        @keyframes rotate3d {
          0% {
            transform: perspective(1200px) rotateY(0deg) rotateX(0deg) translateZ(0px);
          }
          25% {
            transform: perspective(1200px) rotateY(8deg) rotateX(3deg) translateZ(10px);
          }
          50% {
            transform: perspective(1200px) rotateY(0deg) rotateX(0deg) translateZ(0px);
          }
          75% {
            transform: perspective(1200px) rotateY(-8deg) rotateX(-3deg) translateZ(10px);
          }
          100% {
            transform: perspective(1200px) rotateY(0deg) rotateX(0deg) translateZ(0px);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -200% center;
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            background-position: 200% center;
            opacity: 0;
          }
        }

        @keyframes particles {
          0%, 100% {
            transform: translate(0, 0) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translate(var(--tx), var(--ty)) scale(1);
            opacity: 0;
          }
        }

        .logo-container {
          position: absolute;
          top: ${getTopPosition()};
          left: 50%;
          transform: ${getTransform()};
          z-index: 2;
          pointer-events: none;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logo-wrapper {
          position: relative;
          animation: float 8s ease-in-out infinite, 
                     glow 4s ease-in-out infinite,
                     pulse 5s ease-in-out infinite;
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          will-change: transform, filter;
        }

        .logo-wrapper:hover {
          animation: rotate3d 3s ease-in-out infinite,
                     glow 2s ease-in-out infinite,
                     pulse 3s ease-in-out infinite;
        }

        .logo-image {
          position: relative;
          width: ${size}px;
          height: auto;
          max-width: 90vw;
          filter: brightness(1.15) contrast(1.15) saturate(1.1);
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          image-rendering: -webkit-optimize-contrast;
          image-rendering: crisp-edges;
        }

        .logo-wrapper:hover .logo-image {
          filter: brightness(1.4) contrast(1.25) saturate(1.2);
        }

        .halo {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 450px;
          height: 450px;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(255, 255, 255, 0.15) 0%,
            rgba(255, 255, 255, 0.08) 30%,
            rgba(255, 255, 255, 0.04) 50%,
            transparent 75%
          );
          animation: pulse 5s ease-in-out infinite;
          pointer-events: none;
          z-index: -1;
        }

        .halo::before {
          content: '';
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 380px;
          height: 380px;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(255, 255, 255, 0.12) 0%,
            rgba(255, 255, 255, 0.06) 40%,
            transparent 65%
          );
          animation: pulse 4s ease-in-out infinite;
        }

        .halo::after {
          content: '';
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(255, 255, 255, 0.05) 0%,
            transparent 50%
          );
          animation: pulse 6s ease-in-out infinite;
        }

        .shimmer-overlay {
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            45deg,
            transparent 30%,
            rgba(255, 255, 255, 0.15) 50%,
            transparent 70%
          );
          background-size: 200% 200%;
          animation: shimmer 4s linear infinite;
          pointer-events: none;
          border-radius: 50%;
          z-index: 1;
        }

        .particles {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
        }

        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: rgba(255, 255, 255, 0.6);
          border-radius: 50%;
          animation: particles 3s ease-in-out infinite;
        }

        .particle:nth-child(1) {
          --tx: 80px;
          --ty: -80px;
          animation-delay: 0s;
          top: 20%;
          left: 20%;
        }

        .particle:nth-child(2) {
          --tx: -80px;
          --ty: -80px;
          animation-delay: 0.5s;
          top: 20%;
          right: 20%;
        }

        .particle:nth-child(3) {
          --tx: 80px;
          --ty: 80px;
          animation-delay: 1s;
          bottom: 20%;
          left: 20%;
        }

        .particle:nth-child(4) {
          --tx: -80px;
          --ty: 80px;
          animation-delay: 1.5s;
          bottom: 20%;
          right: 20%;
        }

        .particle:nth-child(5) {
          --tx: 0px;
          --ty: -100px;
          animation-delay: 2s;
          top: 10%;
          left: 50%;
        }

        .particle:nth-child(6) {
          --tx: 0px;
          --ty: 100px;
          animation-delay: 2.5s;
          bottom: 10%;
          left: 50%;
        }

        /* Large screens */
        @media (min-width: 1400px) {
          .logo-image {
            width: ${Math.min(size * 1.1, 400)}px;
          }
        }

        /* Tablets */
        @media (max-width: 1024px) and (min-width: 769px) {
          .logo-image {
            width: ${Math.min(size * 0.85, 280)}px;
          }
          .halo {
            width: 380px;
            height: 380px;
          }
          .halo::before {
            width: 320px;
            height: 320px;
          }
          .halo::after {
            width: 420px;
            height: 420px;
          }
        }

        @media (max-width: 768px) {
          .logo-container {
            top: 3% !important;
          }
          .logo-image {
            width: clamp(140px, 25vw, 180px);
          }
          .halo {
            width: clamp(220px, 40vw, 280px);
            height: clamp(220px, 40vw, 280px);
          }
          .halo::before {
            width: clamp(180px, 35vw, 230px);
            height: clamp(180px, 35vw, 230px);
          }
          .halo::after {
            width: clamp(260px, 45vw, 320px);
            height: clamp(260px, 45vw, 320px);
          }
        }

        @media (max-width: 640px) {
          .logo-container {
            top: 2.5% !important;
          }
          .logo-image {
            width: clamp(120px, 22vw, 160px);
          }
        }

        @media (max-width: 480px) {
          .logo-container {
            top: 2% !important;
          }
          .logo-image {
            width: clamp(100px, 20vw, 140px);
          }
          .halo {
            width: clamp(180px, 35vw, 220px);
            height: clamp(180px, 35vw, 220px);
          }
          .halo::before {
            width: clamp(150px, 30vw, 180px);
            height: clamp(150px, 30vw, 180px);
          }
          .halo::after {
            width: clamp(210px, 40vw, 260px);
            height: clamp(210px, 40vw, 260px);
          }
        }

        @media (max-width: 360px) {
          .logo-image {
            width: clamp(90px, 18vw, 120px);
          }
        }

        /* Landscape mobile */
        @media (max-height: 500px) and (orientation: landscape) {
          .logo-container {
            top: 1% !important;
          }
          .logo-image {
            width: clamp(80px, 15vw, 120px);
          }
          .halo {
            width: clamp(150px, 30vw, 200px);
            height: clamp(150px, 30vw, 200px);
          }
        }

        /* Reduce motion for accessibility */
        @media (prefers-reduced-motion: reduce) {
          .logo-wrapper {
            animation: none;
          }
          .logo-wrapper:hover {
            animation: none;
          }
          .halo, .halo::before, .halo::after {
            animation: none;
          }
          .particle {
            animation: none;
            opacity: 0;
          }
        }
      `}</style>
      <div className="logo-container">
        <div className="halo">
          <div className="shimmer-overlay"></div>
        </div>
        <div className="particles">
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
        </div>
        <div className="logo-wrapper">
          <img
            src={logoSrc}
            alt="Albatros Logo"
            className="logo-image"
            loading="eager"
          />
        </div>
      </div>
    </>
  )
}
