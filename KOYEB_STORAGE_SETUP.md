# Configuración de Almacenamiento Persistente en Koyeb

## 📦 Objetivo

Configurar un volumen persistente en Koyeb para guardar **absolutamente todo** en el servidor:
- ✅ Contenido (content.json)
- ✅ Presentaciones guardadas
- ✅ Backups automáticos
- ✅ Imágenes subidas
- ✅ Imágenes extraídas de documentos
- ✅ Archivos procesados

## 🔧 Configuración

### Opción 1: Usando Koyeb CLI (Recomendado)

```bash
# 1. Crear un volumen persistente
koyeb volume create albatros-storage --size 10GB

# 2. Obtener el ID del volumen
koyeb volume list

# 3. Actualizar el servicio para montar el volumen
koyeb service update albatros-backend \
  --volume /app/storage:albatros-storage
```

### Opción 2: Usando el Dashboard de Koyeb

1. Ve a tu servicio en Koyeb Dashboard
2. Ve a la sección "Volumes"
3. Crea un nuevo volumen: `albatros-storage` (10GB recomendado)
4. Monta el volumen en: `/app/storage`
5. Guarda los cambios

### Opción 3: Usando koyeb.json (Configuración en código)

El archivo `koyeb.json` se actualizará para incluir la configuración del volumen.

## 📁 Estructura del Almacenamiento

```
/app/storage/
├── data/
│   ├── content.json          # Contenido actual
│   ├── presentations/        # Presentaciones guardadas
│   │   ├── presentacion-1.json
│   │   └── presentacion-2.json
│   └── backups/              # Backups automáticos
│       ├── content-backup-2024-01-21-18-00-00.json
│       └── content-backup-2024-01-21-19-00-00.json
└── public/
    └── images/               # Todas las imágenes
        ├── pptx-*.jpg
        ├── pdf-*.jpg
        ├── word-*.jpg
        └── uploaded-*.jpg
```

## ✅ Ventajas

1. **Persistencia**: Los datos se mantienen entre despliegues
2. **Backup automático**: Koyeb puede hacer snapshots del volumen
3. **Escalabilidad**: Puedes aumentar el tamaño del volumen cuando sea necesario
4. **Seguridad**: Los datos están en el servidor, no se pierden

## 🔄 Migración de Datos Existentes

Si ya tienes datos en el servidor, necesitarás migrarlos al volumen:

1. **Conectarse al contenedor actual:**
   ```bash
   koyeb service exec albatros-backend -- sh
   ```

2. **Copiar datos al volumen:**
   ```bash
   cp -r /app/data /app/storage/
   cp -r /app/public /app/storage/
   ```

3. **Verificar que todo esté en el volumen:**
   ```bash
   ls -la /app/storage/
   ```

## 📝 Notas Importantes

- El volumen debe montarse en `/app/storage`
- Todos los datos se guardarán en `/app/storage/`
- El código se actualizará automáticamente para usar estas rutas
- El volumen persiste entre reinicios y despliegues
