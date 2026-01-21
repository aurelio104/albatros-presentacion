# 🔍 Instrucciones para Debug en Koyeb

## 📊 Cómo Revisar los Logs

### 1. Ver Logs en Tiempo Real

```bash
koyeb apps logs <APP_ID> --follow
```

O desde el dashboard de Koyeb:
- Ve a tu app → Logs
- Verás los logs en tiempo real

### 2. Buscar Logs de pdf-parse

Busca estos mensajes en los logs:

**Al iniciar el servidor:**
- `🚀 Servidor backend ejecutándose en puerto 3001`

**Al procesar un PDF:**
- `📦 pdf-parse cargado. Tipo: ...`
- `✅ pdfParse asignado como función directa`
- `📊 pdfParse final. Tipo: function`
- `📄 Llamando a pdfParse con buffer de tamaño: ...`

**Si hay error:**
- `❌ ERROR: pdfParse no es una función después de procesar`
- `📦 pdfParseModule completo: ...`
- `🔑 Claves de pdfParseModule: [...]`

## 🔧 Qué Hacer Según los Logs

### Caso 1: "pdf-parse cargado. Tipo: function"
✅ **Todo está bien** - El módulo se carga correctamente
- El problema puede estar en otro lugar
- Revisa los logs del procesamiento del PDF

### Caso 2: "pdf-parse cargado. Tipo: object"
⚠️ **El módulo se carga pero no es función directa**
- Los logs mostrarán las claves disponibles
- El código intentará usar `.default` o `.pdfParse`

### Caso 3: "Error cargando pdf-parse"
❌ **El módulo no se puede cargar**
- Verifica que `pdf-parse` esté en `package.json`
- Verifica que se instale en el build
- Puede ser un problema de instalación

## 🚀 Próximos Pasos

1. **Espera el redespliegue** (2-3 minutos)
2. **Revisa los logs** cuando subas un PDF
3. **Comparte los logs** si el problema persiste

Los logs ahora son muy detallados y nos dirán exactamente qué está pasando.
