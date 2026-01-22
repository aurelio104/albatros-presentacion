# ✅ Verificación de Presentación Guardada en Koyeb

## 🎯 Objetivo

Verificar que la presentación "Presentacion 1" se guardó correctamente en el volumen persistente de Koyeb.

## 📋 Comandos de Verificación

### 1. Verificar Estructura del Volumen

```bash
koyeb service exec 449589f6 -- ls -la /app/storage/
```

**Resultado esperado:**
```
drwxr-xr-x  data/
drwxr-xr-x  public/
```

### 2. Verificar Presentaciones Guardadas

```bash
koyeb service exec 449589f6 -- ls -la /app/storage/data/presentations/
```

**Resultado esperado:**
```
presentacion-1.json
```

### 3. Verificar Contenido de la Presentación

```bash
koyeb service exec 449589f6 -- cat /app/storage/data/presentations/presentacion-1.json | head -50
```

**Resultado esperado:**
```json
{
  "id": "presentacion-1",
  "name": "Presentacion 1",
  "timestamp": "2026-01-22T...",
  "version": "1.0",
  "content": {
    "widgets": [...],
    "settings": {...}
  }
}
```

### 4. Verificar Tamaño y Detalles

```bash
koyeb service exec 449589f6 -- du -sh /app/storage/*
```

**Resultado esperado:**
```
Tamaño de data/
Tamaño de public/
```

### 5. Verificar Widgets en la Presentación

```bash
koyeb service exec 449589f6 -- cat /app/storage/data/presentations/presentacion-1.json | python3 -c "import sys, json; data = json.load(sys.stdin); print(f'Widgets: {len(data.get(\"content\", {}).get(\"widgets\", []))}')"
```

**Resultado esperado:**
```
Widgets: 18
```

## ✅ Checklist de Verificación

- [ ] El volumen está montado en `/app/storage/`
- [ ] El directorio `data/presentations/` existe
- [ ] El archivo `presentacion-1.json` existe
- [ ] El archivo contiene el nombre correcto: "Presentacion 1"
- [ ] El archivo contiene 18 widgets
- [ ] El archivo contiene timestamp válido
- [ ] El archivo contiene `content.widgets` y `content.settings`
- [ ] Las imágenes están en `/app/storage/public/images/`
- [ ] Los backups están en `/app/storage/data/backups/`

## 🔍 Verificación desde el Frontend

También puedes verificar desde el panel de administración:

1. Ve a la pestaña "📚 Presentaciones"
2. Deberías ver:
   - **Nombre**: Presentacion 1
   - **Fecha**: 22 de enero de 2026, 00:00
   - **Widgets**: 18 widgets
   - **Botones**: 📂 Cargar, 🗑️ Eliminar

## 📝 Notas

- El volumen persistente está montado en `/app/storage/`
- Todas las presentaciones se guardan en `/app/storage/data/presentations/`
- Las imágenes se guardan en `/app/storage/public/images/`
- Los backups se guardan en `/app/storage/data/backups/`
- Todo persiste entre despliegues y reinicios
