# 🔧 Configuración de Vercel KV para Almacenamiento

## Problema
En Vercel, el sistema de archivos es de solo lectura en runtime. Por lo tanto, necesitamos usar Vercel KV (Redis) para almacenar el contenido dinámicamente.

## Solución Implementada
El sistema ahora usa Vercel KV en producción y archivos locales en desarrollo.

## 📋 Pasos para Configurar Vercel KV

### 1. Crear Base de Datos KV en Vercel

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Haz clic en tu proyecto "albatros-presentacion"
3. Ve a la pestaña **"Storage"**
4. Haz clic en **"Create Database"**
5. Selecciona **"KV"** (Redis)
6. Elige un nombre (ej: "albatros-kv")
7. Selecciona la región más cercana
8. Haz clic en **"Create"**

### 2. Configurar Variables de Entorno

Vercel automáticamente agregará las variables de entorno necesarias:
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`

Estas se configuran automáticamente cuando creas la base de datos KV.

### 3. Redesplegar

Después de crear la base de datos KV, Vercel automáticamente:
- Agregará las variables de entorno
- Redesplegará tu aplicación

O puedes hacerlo manualmente:
```bash
vercel --prod
```

## ✅ Verificación

Una vez configurado, el sistema:
- ✅ Guardará contenido en Vercel KV en producción
- ✅ Leerá contenido desde Vercel KV en producción
- ✅ Usará archivos locales en desarrollo (si están disponibles)
- ✅ Creará contenido por defecto si no existe
- ✅ Migrará automáticamente el contenido existente de `data/content.json` a KV

## 🔄 Migración Inicial

El contenido existente en `data/content.json` se migrará automáticamente:
1. La primera vez que se lea el contenido, si no existe en KV, se leerá del archivo
2. La primera vez que se guarde, se guardará en KV
3. A partir de ahí, todo se manejará desde KV

**Nota**: El archivo `data/content.json` seguirá existiendo como respaldo, pero en producción se usará KV.

## 🔍 Troubleshooting

### Error: "No se pudo guardar el contenido"
- Verifica que Vercel KV esté creado y configurado
- Revisa que las variables de entorno estén presentes
- Verifica los logs en Vercel Dashboard

### Error: "KV_REST_API_URL not found"
- Asegúrate de haber creado la base de datos KV
- Verifica que las variables de entorno estén configuradas
- Redespliega la aplicación

## 💡 Nota

El sistema funciona en dos modos:
- **Desarrollo**: Intenta usar archivos locales primero, luego KV
- **Producción**: Usa Vercel KV exclusivamente

Esto asegura que funcione tanto en desarrollo local como en producción.
