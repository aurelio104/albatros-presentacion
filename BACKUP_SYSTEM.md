# Sistema de Backup y Recuperación

## 📦 PASO 1: Crear Backup del Estado Actual

### Opción A: Backup Manual (Rápido)
1. **Descargar el contenido actual:**
   - Ve al panel de administración
   - Abre la consola del navegador (F12)
   - Ejecuta: `fetch('/api/content').then(r => r.json()).then(d => console.log(JSON.stringify(d, null, 2)))`
   - Copia el JSON completo
   - Guárdalo en un archivo: `backup-content-YYYY-MM-DD.json`

### Opción B: Backup Automático (Recomendado)
El sistema creará automáticamente un backup cada vez que guardes contenido.

**Ubicación de backups:**
- Backend: `backend/data/backups/`
- Formato: `content-backup-YYYY-MM-DD-HH-MM-SS.json`

## 🔄 PASO 2: Recuperar un Backup

1. **Desde el panel de administración:**
   - Ve a la sección "Backups"
   - Selecciona el backup que quieres restaurar
   - Haz clic en "Restaurar"

2. **Manualmente:**
   - Copia el contenido del archivo backup
   - Pega en el editor JSON del panel de administración
   - Guarda

## 📋 Estructura del Backup

```json
{
  "timestamp": "2024-01-21T22:30:00.000Z",
  "version": "1.0",
  "content": {
    "widgets": [...],
    "settings": {...}
  }
}
```
