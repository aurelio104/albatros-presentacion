# Configurar Volumen Persistente en Koyeb

## 🎯 Objetivo

Configurar un volumen persistente en Koyeb para que **absolutamente todo** se guarde en el servidor y persista entre despliegues.

## 📋 Pasos para Configurar

### Paso 1: Crear el Volumen

**Opción A: Usando Koyeb CLI**

```bash
# Instalar Koyeb CLI si no lo tienes
# brew install koyeb/tap/koyeb  # macOS
# O descargar desde: https://github.com/koyeb/koyeb-cli

# Autenticarse
koyeb auth login

# Crear volumen persistente (10GB recomendado)
koyeb volume create albatros-storage --size 10GB

# Anotar el ID del volumen que se muestra
```

**Opción B: Usando Dashboard de Koyeb**

1. Ve a: https://app.koyeb.com
2. Ve a tu servicio: `albatros-backend`
3. Ve a la pestaña "Volumes"
4. Haz clic en "Create Volume"
5. Nombre: `albatros-storage`
6. Tamaño: `10GB` (o más si necesitas)
7. Haz clic en "Create"

### Paso 2: Montar el Volumen en el Servicio

**Opción A: Usando Koyeb CLI**

```bash
# Obtener el ID del servicio
koyeb service list

# Obtener el ID del volumen
koyeb volume list

# Montar el volumen en el servicio
koyeb service update albatros-backend \
  --volume /app/storage:VOLUME_ID
```

**Opción B: Usando Dashboard**

1. Ve a tu servicio en Koyeb Dashboard
2. Ve a "Settings" → "Volumes"
3. Haz clic en "Attach Volume"
4. Selecciona el volumen `albatros-storage`
5. Mount Path: `/app/storage`
6. Haz clic en "Attach"

### Paso 3: Configurar Variable de Entorno

**Agregar variable de entorno `STORAGE_PATH`:**

```bash
# Usando CLI
koyeb service update albatros-backend \
  --env STORAGE_PATH=/app/storage
```

**O en el Dashboard:**
1. Ve a "Settings" → "Environment Variables"
2. Agrega: `STORAGE_PATH` = `/app/storage`
3. Guarda

### Paso 4: Verificar Configuración

Después de desplegar, verifica que el volumen esté montado:

```bash
# Conectarse al servicio
koyeb service exec albatros-backend -- sh

# Verificar que el volumen esté montado
ls -la /app/storage

# Deberías ver:
# - data/
# - public/
```

## 📁 Estructura del Almacenamiento

Una vez configurado, todo se guardará en `/app/storage/`:

```
/app/storage/
├── data/
│   ├── content.json              # Contenido actual
│   ├── presentations/            # Presentaciones guardadas
│   │   ├── presentacion-1.json
│   │   └── presentacion-2.json
│   └── backups/                  # Backups automáticos
│       └── content-backup-*.json
└── public/
    ├── images/                   # Todas las imágenes
    │   ├── pptx-*.jpg
    │   ├── pdf-*.jpg
    │   ├── word-*.jpg
    │   └── uploaded-*.jpg
    └── files/                    # PDFs y Excel (futuro)
        ├── *.pdf
        └── *.xlsx
```

## ✅ Ventajas

1. **Persistencia Total**: Todo se guarda en el servidor
2. **Sin Pérdida de Datos**: Los datos persisten entre despliegues
3. **Backups Automáticos**: Koyeb puede hacer snapshots del volumen
4. **Escalable**: Puedes aumentar el tamaño cuando sea necesario
5. **Seguro**: Los datos están en el servidor, no se pierden

## 🔄 Migración de Datos Existentes

Si ya tienes datos en el servidor actual:

1. **Conectarse al contenedor:**
   ```bash
   koyeb service exec albatros-backend -- sh
   ```

2. **Copiar datos al volumen:**
   ```bash
   # Si el volumen ya está montado
   cp -r /app/data /app/storage/
   cp -r /app/public /app/storage/
   
   # Verificar
   ls -la /app/storage/
   ```

3. **O desde fuera del contenedor:**
   ```bash
   # Descargar datos actuales
   curl "https://albatros-backend-aurelio104-5f63c813.koyeb.app/api/content" > content-backup.json
   
   # Después de configurar el volumen, los datos se guardarán automáticamente
   ```

## 🚀 Desplegar Cambios

Después de configurar el volumen:

```bash
# Hacer commit y push
git add -A
git commit -m "Add: Sistema de almacenamiento persistente en Koyeb"
git push

# Koyeb desplegará automáticamente
# El código detectará el volumen y usará /app/storage
```

## 📝 Notas Importantes

- El volumen debe montarse en `/app/storage`
- La variable `STORAGE_PATH` debe estar configurada
- El código detecta automáticamente si está en Koyeb y usa el volumen
- En desarrollo local, usa directorios relativos (sin volumen)
- El tamaño del volumen puede aumentarse después si es necesario

## 🔍 Verificar que Funciona

1. **Sube una imagen o procesa un documento**
2. **Verifica en los logs:**
   ```
   ✅ Almacenamiento inicializado en: /app/storage
      Modo: Koyeb (Volumen persistente)
   ```
3. **Verifica que los archivos se guarden:**
   ```bash
   koyeb service exec albatros-backend -- ls -la /app/storage/data/
   koyeb service exec albatros-backend -- ls -la /app/storage/public/images/
   ```
