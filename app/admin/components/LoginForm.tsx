'use client'

import VideoBackground from '@/app/components/VideoBackground'
import Header from '@/app/components/Header'

interface LoginFormProps {
  password: string
  setPassword: (password: string) => void
  error: string
  handleLogin: (e: React.FormEvent) => void
}

export default function LoginForm({ password, setPassword, error, handleLogin }: LoginFormProps) {
  return (
    <>
      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        html, body {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          overflow-x: hidden;
        }
      `}</style>
      <main style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}>
        <VideoBackground 
          videoSrc="/videos/video1.MP4"
          overlay={{ opacity: 0.4, color: 'rgba(0, 0, 0, 0.4)' }}
        />
        <Header logoSrc="/images/logotB.png" size={320} />
        
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '20px',
            padding: '3rem',
            maxWidth: '400px',
            width: '100%',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          }}
        >
          <h1
            style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              marginBottom: '0.5rem',
              textAlign: 'center',
              color: '#ffffff',
            }}
          >
            Admin Panel
          </h1>
          <p
            style={{
              textAlign: 'center',
              color: 'rgba(255, 255, 255, 0.9)',
              marginBottom: '2rem',
            }}
          >
            Albatros Presentación
          </p>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                  color: '#ffffff',
                }}
              >
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  fontSize: '1rem',
                  transition: 'all 0.3s',
                  backdropFilter: 'blur(5px)',
                }}
                placeholder="Ingresa la contraseña"
                autoFocus
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)'
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                }}
              />
            </div>

            {error && (
              <div
                style={{
                  padding: '0.75rem',
                  background: 'rgba(239, 68, 68, 0.2)',
                  color: '#fee',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  textAlign: 'center',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  backdropFilter: 'blur(5px)',
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'
                e.currentTarget.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              Ingresar
            </button>
          </form>
        </div>
      </main>
    </>
  )
}
