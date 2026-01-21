// Configuración de la API del backend
// En producción, usar la URL de Koyeb
// En desarrollo, usar localhost o la URL configurada

const getBackendUrl = () => {
  // Si hay una variable de entorno, usarla
  if (typeof window !== 'undefined' && (window as any).BACKEND_URL) {
    return (window as any).BACKEND_URL
  }
  
  // En desarrollo, usar localhost
  if (process.env.NODE_ENV === 'development') {
    return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
  }
  
  // En producción, usar la URL de Koyeb
  return process.env.NEXT_PUBLIC_BACKEND_URL || 'https://albatros-backend.koyeb.app'
}

export const API_BASE_URL = getBackendUrl()

// Funciones helper para las APIs
export const api = {
  content: `${API_BASE_URL}/api/content`,
  upload: `${API_BASE_URL}/api/upload`,
  processDocument: `${API_BASE_URL}/api/process-document`,
}
