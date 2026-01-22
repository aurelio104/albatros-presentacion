# 🔄 Cómo Recuperar Presentación Perdida

## 🔍 Problema Detectado

El almacenamiento está detectando `/workspace/backend` en lugar de `/app/storage` (donde está el volumen montado).

## ✅ Solución Inmediata

### Opción 1: Verificar que el Volumen Tenga los Datos

El volumen `present` está montado en `/app/storage`. Los datos deberían estar ahí.

**Verificar desde el admin panel:**
1. Ve a "📚 Presentaciones" → "🔍 Verificación de Almacenamiento"
2. Haz clic en "🔍 Verificar Almacenamiento"
3. Debería mostrar `/app/storage` como base (después del fix)

### Opción 2: Recuperar desde Backup

Si tienes un backup, puedes restaurarlo:

1. Ve a la pestaña "📚 Presentaciones"
2. Busca la sección de backups (si está disponible)
3. O usa el script de recuperación:

```bash
node backend/scripts/recover-production-presentation.js
```

### Opción 3: Re-subir el Documento

Si tienes el documento original (PowerPoint, Word, PDF, Excel):

1. Ve a "🤖 IA Documentos"
2. Sube el documento nuevamente
3. El sistema generará los widgets automáticamente
4. Guarda como "Presentacion 1"

## 🔧 Corrección Aplicada

He corregido el código para que detecte correctamente `STORAGE_PATH`:

- ✅ Ahora usa `process.env.STORAGE_PATH` directamente si está configurado
- ✅ El volumen está montado en `/app/storage`
- ✅ La variable `STORAGE_PATH=/app/storage` está configurada

## 📋 Verificación Post-Fix

Después de que Koyeb despliegue el fix:

1. **Verifica el almacenamiento:**
   - Debería mostrar: `📍 Base: /app/storage`
   - Debería mostrar: `🔧 Modo: Koyeb (Volumen persistente)`

2. **Verifica presentaciones:**
   - Si el volumen tiene los datos, deberían aparecer
   - Si no aparecen, los datos pueden estar en una ubicación diferente

## 🚨 Si los Datos No Aparecen

### Verificar el Volumen Directamente

El volumen `present` debería tener los datos. Si no aparecen después del fix:

1. **Los datos pueden estar en el volumen pero el código no los encuentra**
2. **O los datos se perdieron en el despliegue anterior**

### Solución: Re-crear la Presentación

Si no puedes recuperar los datos:

1. **Re-sube el documento original**
2. **Guarda la presentación nuevamente**
3. **Esta vez se guardará correctamente en `/app/storage`**

## 📝 Notas Importantes

- El volumen `present` está montado en `/app/storage`
- La variable `STORAGE_PATH=/app/storage` está configurada
- Después del fix, el código usará correctamente el volumen
- Los nuevos datos se guardarán en el volumen persistente

## 🔄 Próximos Pasos

1. **Espera a que Koyeb despliegue el fix** (1-2 minutos)
2. **Verifica el almacenamiento** desde el admin panel
3. **Si no aparecen los datos**, re-sube el documento y guarda nuevamente
4. **Los nuevos datos se guardarán correctamente** en el volumen persistente
