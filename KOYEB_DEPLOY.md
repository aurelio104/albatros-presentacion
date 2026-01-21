# 🚀 Guía Completa de Despliegue en Koyeb

## 📋 Resumen

Este proyecto ahora tiene una arquitectura separada:
- **Frontend**: Desplegado en Vercel (Next.js, CDN global, rápido)
- **Backend**: Desplegado en Koyeb (Node.js, sistema de archivos escribible, APIs)

## 🎯 ¿Por qué Koyeb?

- ✅ Sistema de archivos **escribible** (a diferencia de Vercel que es solo lectura)
- ✅ **Gratis** en el plan básico
- ✅ Fácil despliegue desde GitHub
- ✅ Variables de entorno configurables
- ✅ Logs en tiempo real
- ✅ HTTPS automático
- ✅ Persistencia de datos

## 📦 Estructura del Proyecto

```
albatros-presentacion/
├── app/                    # Frontend Next.js (Vercel)
│   ├── components/
│   ├── admin/
│   └── ...
├── backend/                # Backend Node.js (Koyeb)
│   ├── src/
│   │   ├── server.js       # Servidor Express
│   │   └── routes/
│   │       ├── content.js  # API de contenido
│   │       ├── upload.js   # API de imágenes
│   │       └── document.js # API de documentos
│   ├── data/              # content.json se guarda aquí
│   ├── public/images/      # Imágenes se guardan aquí
│   ├── package.json
│   └── Dockerfile
└── ...
```

## 🚀 Pasos para Desplegar el Backend en Koyeb

### Paso 1: Crear Cuenta en Koyeb

1. Ve a [https://www.koyeb.com](https://www.koyeb.com)
2. Haz clic en **"Sign Up"** (gratis)
3. Crea cuenta con GitHub, Google, o email
4. Verifica tu email

### Paso 2: Conectar GitHub

1. En Koyeb Dashboard, ve a **"GitHub"** en el menú lateral
2. Haz clic en **"Connect GitHub"**
3. Autoriza Koyeb para acceder a tus repositorios
4. Selecciona el repositorio: `albatros-presentacion`

### Paso 3: Crear Aplicación

1. En Koyeb Dashboard, haz clic en **"Create App"** (botón grande)
2. Selecciona **"GitHub"** como fuente
3. Selecciona el repositorio: `albatros-presentacion`
4. Configuración:
   - **Name**: `albatros-backend`
   - **Region**: Elige la más cercana (ej: `us-east`, `europe-west`)
   - **Build Command**: `cd backend && npm install`
   - **Run Command**: `cd backend && npm start`
   - **Port**: `3001`
   - **Environment**: `Node.js` o `Docker` (ambos funcionan)

### Paso 4: Configurar Variables de Entorno

En la sección **"Environment Variables"** de la app, agrega:

```env
PORT=3001
NODE_ENV=production
BACKEND_URL=https://albatros-backend-xxx.koyeb.app
ALLOWED_ORIGINS=https://albatros-presentacion.vercel.app,https://albatros-presentacion-*.vercel.app
```

**⚠️ IMPORTANTE**: 
- Reemplaza `xxx` con el ID que Koyeb asigne a tu app después del primer despliegue
- O usa el dominio personalizado si lo configuras

### Paso 5: Desplegar

1. Haz clic en **"Deploy"**
2. Espera 2-3 minutos mientras Koyeb:
   - Clona el repositorio
   - Instala dependencias (`npm install`)
   - Inicia el servidor (`npm start`)
3. Una vez completado, copia la URL de tu app (ej: `https://albatros-backend-abc123.koyeb.app`)

### Paso 6: Actualizar Frontend en Vercel

Una vez que tengas la URL del backend:

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto `albatros-presentacion`
3. Ve a **"Settings"** > **"Environment Variables"**
4. Agrega nueva variable:
   - **Name**: `NEXT_PUBLIC_BACKEND_URL`
   - **Value**: `https://albatros-backend-xxx.koyeb.app` (la URL de tu backend en Koyeb)
   - **Environment**: Production, Preview, Development (marca todas)
5. Haz clic en **"Save"**
6. Ve a **"Deployments"** y haz clic en **"Redeploy"** en el último deployment

## ✅ Verificación

### 1. Health Check del Backend
```bash
curl https://tu-backend.koyeb.app/health
```
Debería retornar: 
```json
{"status":"ok","timestamp":"2024-01-21T...","environment":"production"}
```

### 2. API de Contenido
```bash
curl https://tu-backend.koyeb.app/api/content
```
Debería retornar el contenido JSON con widgets y settings

### 3. Probar desde el Frontend
1. Ve a `https://albatros-presentacion.vercel.app/admin`
2. Intenta guardar contenido → ✅ Debería funcionar
3. Intenta subir una imagen → ✅ Debería funcionar
4. Intenta procesar un documento → ✅ Debería funcionar

## 🔒 Seguridad Implementada

- ✅ **CORS**: Solo orígenes permitidos pueden hacer requests
- ✅ **Validación de archivos**: Solo tipos permitidos (imágenes)
- ✅ **Límites de tamaño**: 
  - Imágenes: máximo 10MB
  - Documentos: máximo 50MB
- ✅ **Sanitización**: Nombres de archivo sanitizados
- ✅ **HTTPS**: Automático en Koyeb
- ✅ **Variables de entorno**: Configuración segura

## 📊 APIs Disponibles

### `GET /health`
Health check del servidor

### `GET /api/content`
Obtiene el contenido actual (widgets y settings)

### `POST /api/content`
Guarda nuevo contenido
```json
{
  "widgets": [...],
  "settings": {...}
}
```

### `POST /api/upload`
Sube una imagen
- Content-Type: `multipart/form-data`
- Campo: `file`
- Retorna: URL completa de la imagen

### `POST /api/process-document`
Procesa un documento Word/Excel/PowerPoint
- Content-Type: `multipart/form-data`
- Campo: `file`
- Campo opcional: `autoCreate` (true/false)
- Retorna: Widgets generados automáticamente

### `GET /images/:filename`
Sirve imágenes estáticas

## 🔄 Flujo de Datos

```
Frontend (Vercel) 
    ↓ HTTP Request
Backend (Koyeb)
    ↓ Escribe archivos
Sistema de Archivos (Koyeb)
    ├── data/content.json
    └── public/images/*.jpg
```

## 💡 Troubleshooting

### Error: "Cannot connect to backend"
- ✅ Verifica que la URL del backend sea correcta
- ✅ Verifica que la variable `NEXT_PUBLIC_BACKEND_URL` esté configurada en Vercel
- ✅ Verifica los logs en Koyeb Dashboard > Logs

### Error: "CORS error"
- ✅ Verifica que `ALLOWED_ORIGINS` incluya la URL exacta de Vercel
- ✅ Asegúrate de incluir el patrón `https://albatros-presentacion-*.vercel.app` para previews
- ✅ Verifica los logs del backend para ver qué origin está bloqueando

### Error: "Port already in use"
- ✅ Koyeb maneja esto automáticamente, no deberías ver este error
- ✅ Si lo ves, verifica que `PORT=3001` esté en las variables de entorno

### El backend no inicia
- ✅ Verifica los logs en Koyeb Dashboard
- ✅ Asegúrate de que `cd backend && npm start` sea el comando correcto
- ✅ Verifica que `package.json` tenga el script `start`

## 📝 Notas Importantes

- El backend en Koyeb tiene sistema de archivos **escribible y persistente**
- Las imágenes se guardan en `backend/public/images/` y son accesibles públicamente
- El contenido se guarda en `backend/data/content.json`
- Todo es **persistente** entre reinicios y deployments
- Los datos se mantienen incluso si redesplegas

## 🎉 ¡Listo!

Una vez configurado, tendrás:
- ✅ Frontend en Vercel (rápido, CDN global, optimizado)
- ✅ Backend en Koyeb (almacenamiento persistente, APIs funcionales)
- ✅ Todo funcionando de forma segura y escalable

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs en Koyeb Dashboard
2. Revisa los logs en Vercel Dashboard
3. Verifica las variables de entorno
4. Prueba el health check del backend
