#!/bin/bash

# Script para configurar el volumen persistente en Koyeb
# Ejecutar: bash SCRIPT_CONFIGURAR_VOLUMEN.sh

echo "🔧 Configurando almacenamiento persistente en Koyeb..."
echo ""

# IDs del servicio y volumen
SERVICE_ID="449589f6"
VOLUME_NAME="present"
MOUNT_PATH="/app/storage"

echo "📋 Información:"
echo "   - Servicio ID: $SERVICE_ID"
echo "   - Volumen: $VOLUME_NAME"
echo "   - Ruta de montaje: $MOUNT_PATH"
echo ""

# 1. Montar el volumen al servicio
echo "1️⃣  Montando volumen al servicio..."
koyeb service update $SERVICE_ID --volumes $VOLUME_NAME:$MOUNT_PATH

if [ $? -eq 0 ]; then
    echo "   ✅ Volumen montado correctamente"
else
    echo "   ❌ Error montando el volumen"
    exit 1
fi

echo ""

# 2. Configurar variable de entorno
echo "2️⃣  Configurando variable de entorno STORAGE_PATH..."
koyeb service update $SERVICE_ID --env STORAGE_PATH=$MOUNT_PATH

if [ $? -eq 0 ]; then
    echo "   ✅ Variable de entorno configurada"
else
    echo "   ❌ Error configurando variable de entorno"
    exit 1
fi

echo ""

# 3. Verificar configuración
echo "3️⃣  Verificando configuración..."
sleep 5

echo ""
echo "📊 Estado del volumen:"
koyeb volume get $VOLUME_NAME

echo ""
echo "📊 Estado del servicio:"
koyeb service get $SERVICE_ID

echo ""
echo "✅ Configuración completada!"
echo ""
echo "📝 Próximos pasos:"
echo "   1. Espera a que el servicio se despliegue (puede tardar 1-2 minutos)"
echo "   2. Verifica los logs: koyeb service logs $SERVICE_ID"
echo "   3. Busca el mensaje: '✅ Almacenamiento inicializado en: $MOUNT_PATH'"
echo ""
