# Instrucciones para Desplegar en Vercel

## Paso 1: Preparar el Repositorio Git

1. Inicializa el repositorio Git (si aún no lo has hecho):
```bash
git init
git add .
git commit -m "Initial commit - Albatros Presentación"
```

2. Crea un repositorio en GitHub:
   - Ve a https://github.com/new
   - Crea un nuevo repositorio llamado "albatros-presentacion"
   - No inicialices con README, .gitignore o licencia

3. Conecta tu repositorio local con GitHub:
```bash
git remote add origin https://github.com/TU_USUARIO/albatros-presentacion.git
git branch -M main
git push -u origin main
```

## Paso 2: Desplegar en Vercel

1. Ve a https://vercel.com y inicia sesión (o crea una cuenta)

2. Haz clic en "Add New Project"

3. Importa tu repositorio de GitHub:
   - Selecciona el repositorio "albatros-presentacion"
   - Vercel detectará automáticamente que es un proyecto Next.js

4. Configuración del proyecto:
   - **Framework Preset**: Next.js (debería detectarse automáticamente)
   - **Root Directory**: `./` (raíz del proyecto)
   - **Build Command**: `npm run build` (automático)
   - **Output Directory**: `.next` (automático)
   - **Install Command**: `npm install` (automático)

5. Haz clic en "Deploy"

## Paso 3: Configurar Variables de Entorno (si es necesario)

Si necesitas variables de entorno, puedes agregarlas en:
- Settings → Environment Variables

## Paso 4: Agregar tu Video de Fondo

1. Coloca tu video en la carpeta `public/videos/` con el nombre `background.mp4`
2. Haz commit y push:
```bash
git add public/videos/background.mp4
git commit -m "Add background video"
git push
```
3. Vercel desplegará automáticamente los cambios

## Características de Vercel

- **Despliegue Automático**: Cada push a la rama principal desplegará automáticamente
- **Preview Deployments**: Cada pull request crea un preview deployment
- **Dominio Personalizado**: Puedes agregar tu propio dominio en Settings → Domains
- **Analytics**: Puedes habilitar analytics en Settings → Analytics

## Notas Importantes

- El video debe estar en formato MP4 y optimizado para web
- Las imágenes deben estar en la carpeta `public/images/`
- Los cambios se reflejan en tiempo real después del despliegue (generalmente en 1-2 minutos)
