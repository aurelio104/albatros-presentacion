'use client'

export default function LogoCenter() {
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
          top: 5%;
          left: 50%;
          transform: translateX(-50%);
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
          width: 320px;
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

        @media (max-width: 768px) {
          .logo-image {
            width: 220px;
          }
          .halo {
            width: 320px;
            height: 320px;
          }
          .halo::before {
            width: 270px;
            height: 270px;
          }
          .halo::after {
            width: 360px;
            height: 360px;
          }
        }

        @media (max-width: 480px) {
          .logo-image {
            width: 180px;
          }
          .halo {
            width: 280px;
            height: 280px;
          }
          .halo::before {
            width: 230px;
            height: 230px;
          }
          .halo::after {
            width: 320px;
            height: 320px;
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
            src="/images/logotB.png"
            alt="Albatros Logo"
            className="logo-image"
            loading="eager"
          />
        </div>
      </div>
    </>
  )
}
