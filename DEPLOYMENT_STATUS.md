# ✅ Estado del Despliegue

## Backend en Koyeb

**Estado**: ✅ Desplegado

Para verificar:
```bash
koyeb apps get albatros-backend
```

Para ver logs:
```bash
koyeb apps logs albatros-backend --follow
```

## Frontend en Vercel

**Estado**: ⚠️ Necesita configuración

### Variable de Entorno Requerida

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona proyecto: `albatros-presentacion`
3. Settings > Environment Variables
4. Agrega:
   - **Name**: `NEXT_PUBLIC_BACKEND_URL`
   - **Value**: `https://albatros-backend-xxx.koyeb.app` (obtén la URL con: `koyeb apps get albatros-backend`)
   - **Environment**: Production, Preview, Development
5. Guarda y redespliega

### Obtener URL del Backend

```bash
koyeb apps get albatros-backend | grep -oE 'https://[a-z0-9-]+\.koyeb\.app'
```

## Verificación

### Health Check del Backend
```bash
curl https://tu-backend.koyeb.app/health
```

Debería retornar:
```json
{"status":"ok","timestamp":"...","environment":"production"}
```

### Probar desde el Frontend
1. Ve a `https://albatros-presentacion.vercel.app/admin`
2. Intenta guardar contenido
3. Intenta subir una imagen
4. Todo debería funcionar ✅
