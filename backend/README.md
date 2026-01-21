# 🚀 Backend API - Albatros Presentación

Backend seguro para manejar contenido, imágenes y procesamiento de documentos.

## 🔒 Seguridad

- ✅ CORS configurado con orígenes permitidos
- ✅ Validación de tipos de archivo
- ✅ Límites de tamaño de archivo
- ✅ Sanitización de nombres de archivo
- ✅ Manejo de errores robusto

## 📋 Instalación Local

```bash
cd backend
npm install
npm start
```

## 🌐 Variables de Entorno

Crea un archivo `.env` basado en `.env.example`:

```env
PORT=3001
BACKEND_URL=http://localhost:3001
ALLOWED_ORIGINS=http://localhost:3000,https://albatros-presentacion.vercel.app
NODE_ENV=development
```

## 🚢 Despliegue en Koyeb

Ver `KOYEB_DEPLOY.md` para instrucciones completas.
