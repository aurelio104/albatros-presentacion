# 🚀 Despliegue Manual en Koyeb usando CLI

## Paso 1: Instalar Koyeb CLI

```bash
# macOS/Linux
curl -fsSL https://cli.koyeb.com/install.sh | sh

# O con Homebrew
brew install koyeb/tap/koyeb

# Agregar al PATH (si es necesario)
export PATH="$HOME/.koyeb/bin:$PATH"
```

## Paso 2: Autenticarse

```bash
koyeb auth login
```

Esto abrirá tu navegador para autenticarte.

## Paso 3: Crear la App

```bash
# Obtener tu usuario de GitHub del repositorio
GITHUB_USER=$(git remote get-url origin | sed -E 's/.*github.com[\/:]([^\/]+)\/.*/\1/')
echo "Usuario GitHub: $GITHUB_USER"

# Crear la app
koyeb apps create albatros-backend \
  --name albatros-backend \
  --type docker \
  --git github.com/$GITHUB_USER/albatros-presentacion \
  --git-branch main \
  --git-build-command "cd backend && npm install" \
  --git-run-command "cd backend && npm start" \
  --ports 3001:http \
  --regions us-east
```

## Paso 4: Configurar Variables de Entorno

```bash
# Obtener la URL de la app primero
APP_URL=$(koyeb apps get albatros-backend -o json | jq -r '.url' 2>/dev/null || echo "")

# Si no tienes jq, obtén la URL manualmente:
# koyeb apps get albatros-backend

# Configurar variables
koyeb apps update albatros-backend \
  --env PORT=3001 \
  --env NODE_ENV=production \
  --env BACKEND_URL="$APP_URL" \
  --env "ALLOWED_ORIGINS=https://albatros-presentacion.vercel.app,https://albatros-presentacion-*.vercel.app"
```

## Paso 5: Verificar Despliegue

```bash
# Ver logs
koyeb apps logs albatros-backend

# Verificar health check
curl https://albatros-backend-xxx.koyeb.app/health
```

## Paso 6: Configurar Vercel

```bash
# Obtener URL del backend
APP_URL=$(koyeb apps get albatros-backend -o json | jq -r '.url' 2>/dev/null || koyeb apps get albatros-backend | grep -o 'https://[^ ]*')

# Configurar en Vercel
vercel env add NEXT_PUBLIC_BACKEND_URL production
# Cuando pregunte el valor, ingresa: $APP_URL

# Redesplegar
vercel --prod
```

## Comandos Útiles

```bash
# Ver estado de la app
koyeb apps get albatros-backend

# Ver logs en tiempo real
koyeb apps logs albatros-backend --follow

# Actualizar la app
koyeb apps update albatros-backend --git-branch main

# Eliminar la app (si es necesario)
koyeb apps delete albatros-backend
```
