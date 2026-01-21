#!/bin/bash

# Script para desplegar backend en Koyeb usando CLI

set -e

echo "🚀 Iniciando despliegue en Koyeb..."

# Verificar que Koyeb CLI está instalado
if ! command -v koyeb &> /dev/null; then
    echo "❌ Koyeb CLI no está instalado"
    echo "📥 Instalando Koyeb CLI..."
    
    # Intentar instalar con diferentes métodos
    if command -v brew &> /dev/null; then
        brew install koyeb/tap/koyeb
    else
        curl -fsSL https://cli.koyeb.com/install.sh | sh
    fi
    
    echo "✅ Koyeb CLI instalado"
fi

# Verificar autenticación
echo "🔐 Verificando autenticación..."
if ! koyeb auth status &> /dev/null; then
    echo "⚠️  No estás autenticado en Koyeb"
    echo "🔑 Abriendo navegador para autenticación..."
    koyeb auth login
else
    echo "✅ Autenticado en Koyeb"
fi

# Obtener información del repositorio
REPO_NAME="albatros-presentacion"
GITHUB_USER=$(git remote get-url origin | sed -E 's/.*github.com[\/:]([^\/]+)\/.*/\1/')

echo "📦 Repositorio: $GITHUB_USER/$REPO_NAME"

# Verificar si la app ya existe
APP_NAME="albatros-backend"
if koyeb apps get "$APP_NAME" &> /dev/null; then
    echo "⚠️  La app $APP_NAME ya existe"
    read -p "¿Deseas actualizarla? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🔄 Actualizando app existente..."
        koyeb apps update "$APP_NAME" \
            --name "$APP_NAME" \
            --type docker \
            --git github.com/$GITHUB_USER/$REPO_NAME \
            --git-branch main \
            --git-build-command "cd backend && npm install" \
            --git-run-command "cd backend && npm start" \
            --ports 3001:http \
            --regions us-east
    else
        echo "❌ Cancelado"
        exit 1
    fi
else
    echo "🆕 Creando nueva app..."
    koyeb apps create "$APP_NAME" \
        --name "$APP_NAME" \
        --type docker \
        --git github.com/$GITHUB_USER/$REPO_NAME \
        --git-branch main \
        --git-build-command "cd backend && npm install" \
        --git-run-command "cd backend && npm start" \
        --ports 3001:http \
        --regions us-east
fi

# Esperar a que la app esté lista
echo "⏳ Esperando a que la app esté lista..."
sleep 10

# Obtener URL de la app
APP_URL=$(koyeb apps get "$APP_NAME" -o json | grep -o '"url":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$APP_URL" ]; then
    echo "⚠️  No se pudo obtener la URL automáticamente"
    echo "🔍 Obteniendo información de la app..."
    koyeb apps get "$APP_NAME"
    read -p "Ingresa la URL de tu app en Koyeb: " APP_URL
else
    echo "✅ URL de la app: $APP_URL"
fi

# Configurar variables de entorno
echo "🔧 Configurando variables de entorno..."

# Obtener URL de Vercel (asumiendo que es la producción)
VERCEL_URL="https://albatros-presentacion.vercel.app"

koyeb apps update "$APP_NAME" \
    --env PORT=3001 \
    --env NODE_ENV=production \
    --env BACKEND_URL="$APP_URL" \
    --env "ALLOWED_ORIGINS=$VERCEL_URL,https://albatros-presentacion-*.vercel.app"

echo "✅ Variables de entorno configuradas"

# Esperar a que el despliegue termine
echo "⏳ Esperando a que el despliegue termine..."
sleep 30

# Verificar health check
echo "🏥 Verificando health check..."
HEALTH_URL="$APP_URL/health"
if curl -f -s "$HEALTH_URL" > /dev/null; then
    echo "✅ Backend está funcionando correctamente"
else
    echo "⚠️  El backend aún no está listo, pero debería estar pronto"
fi

echo ""
echo "🎉 Despliegue completado!"
echo "📡 URL del backend: $APP_URL"
echo ""
echo "📋 Próximos pasos:"
echo "1. Configura en Vercel la variable de entorno:"
echo "   NEXT_PUBLIC_BACKEND_URL=$APP_URL"
echo "2. Redespliega el frontend en Vercel"
echo ""
