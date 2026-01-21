# 🚀 Guía Completa de Despliegue en Koyeb

## 📋 Resumen

Este proyecto ahora tiene:
- **Frontend**: Desplegado en Vercel (solo lectura, perfecto para Next.js)
- **Backend**: Desplegado en Koyeb (sistema de archivos escribible, perfecto para APIs)

## 🎯 ¿Por qué Koyeb?

- ✅ Sistema de archivos **escribible** (a diferencia de Vercel)
- ✅ Gratis en el plan básico
- ✅ Fácil despliegue desde GitHub
- ✅ Variables de entorno configurables
- ✅ Logs en tiempo real
- ✅ HTTPS automático

## 📦 Estructura del Proyecto

```
albatros-presentacion/
├── app/                    # Frontend Next.js (Vercel)
├── backend/                # Backend Node.js (Koyeb)
│   ├── src/
│   │   ├── server.js
│   │   └── routes/
│   ├── data/              # content.json se guarda aquí
│   ├── public/images/      # Imágenes se guardan aquí
│   └── package.json
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

1. En Koyeb Dashboard, haz clic en **"Create App"**
2. Selecciona **"GitHub"** como fuente
3. Selecciona el repositorio: `albatros-presentacion`
4. Configuración:
   - **Name**: `albatros-backend`
   - **Region**: Elige la más cercana (ej: `us-east`)
   - **Build Command**: `cd backend && npm install`
   - **Run Command**: `cd backend && npm start`
   - **Port**: `3001`

### Paso 4: Configurar Variables de Entorno

En la sección **"Environment Variables"**, agrega:

```env
PORT=3001
NODE_ENV=production
BACKEND_URL=https://albatros-backend-xxx.koyeb.app
ALLOWED_ORIGINS=https://albatros-presentacion.vercel.app,https://albatros-presentacion-*.vercel.app
```

**Nota**: Reemplaza `xxx` con el ID que Koyeb asigne a tu app.

### Paso 5: Desplegar

1. Haz clic en **"Deploy"**
2. Espera 2-3 minutos mientras Koyeb:
   - Clona el repositorio
   - Instala dependencias
   - Inicia el servidor
3. Una vez completado, copia la URL de tu app

### Paso 6: Actualizar Frontend

Una vez que tengas la URL del backend (ej: `https://albatros-backend-xxx.koyeb.app`):

1. Ve a Vercel Dashboard
2. Selecciona tu proyecto
3. Ve a **"Settings"** > **"Environment Variables"**
4. Agrega:
   - **Name**: `NEXT_PUBLIC_BACKEND_URL`
   - **Value**: `https://albatros-backend-xxx.koyeb.app`
5. Redespliega la aplicación

## ✅ Verificación

### 1. Health Check
```bash
curl https://tu-backend.koyeb.app/health
```
Debería retornar: `{"status":"ok","timestamp":"...","environment":"production"}`

### 2. API de Contenido
```bash
curl https://tu-backend.koyeb.app/api/content
```
Debería retornar el contenido JSON

### 3. Probar desde el Frontend
1. Ve a `/admin`
2. Intenta guardar contenido
3. Intenta subir una imagen
4. Todo debería funcionar ✅

## 🔒 Seguridad Implementada

- ✅ **CORS**: Solo orígenes permitidos pueden hacer requests
- ✅ **Validación de archivos**: Solo tipos permitidos
- ✅ **Límites de tamaño**: Máximo 10MB para imágenes, 50MB para documentos
- ✅ **Sanitización**: Nombres de archivo sanitizados
- ✅ **HTTPS**: Automático en Koyeb

## 📊 APIs Disponibles

### `GET /api/content`
Obtiene el contenido actual

### `POST /api/content`
Guarda nuevo contenido

### `POST /api/upload`
Sube una imagen (multipart/form-data)

### `POST /api/process-document`
Procesa un documento Word/Excel/PowerPoint

### `GET /health`
Health check del servidor

## 🔄 Actualización del Código

Cada vez que hagas push a GitHub:
1. Koyeb detectará los cambios automáticamente
2. Redesplegará el backend
3. El frontend seguirá funcionando (usa la misma URL)

## 💡 Troubleshooting

### Error: "Cannot connect to backend"
- Verifica que la URL del backend sea correcta
- Verifica que la variable `NEXT_PUBLIC_BACKEND_URL` esté configurada en Vercel
- Verifica los logs en Koyeb Dashboard

### Error: "CORS error"
- Verifica que `ALLOWED_ORIGINS` incluya la URL de Vercel
- Asegúrate de incluir el patrón `https://albatros-presentacion-*.vercel.app`

### Error: "Port already in use"
- Koyeb maneja esto automáticamente, no deberías ver este error

## 📝 Notas Importantes

- El backend en Koyeb tiene sistema de archivos **escribible**
- Las imágenes se guardan en `backend/public/images/`
- El contenido se guarda en `backend/data/content.json`
- Todo es **persistente** entre reinicios

## 🎉 ¡Listo!

Una vez configurado, tendrás:
- ✅ Frontend en Vercel (rápido, CDN global)
- ✅ Backend en Koyeb (almacenamiento persistente)
- ✅ Todo funcionando de forma segura
