# 🧠 Análisis Inteligente de Documentos

## 🎯 Mejoras Implementadas

### 1. Detección Precisa de Estructura Jerárquica

El sistema ahora detecta inteligentemente:

#### **Nivel 1: Títulos Principales**
- Títulos en mayúsculas completas y cortos
- Títulos seguidos de dos puntos (`:`)
- Títulos comunes de documentos técnicos:
  - `INFORME`, `ANÁLISIS`, `CONCLUSIÓN`, `RECOMENDACIÓN`, `OBSERVACIONES`
  - `INTRODUCCIÓN`, `RESUMEN`, `OBJETIVO`, `METODOLOGÍA`, `RESULTADOS`
- Números romanos seguidos de título (`I. Título`, `II. Título`)

#### **Nivel 2: Subtítulos**
- Números seguidos de punto y texto (`1. Subtítulo`, `2. Subtítulo`)
- Letras seguidas de punto y texto (`a. Subtítulo`, `b. Subtítulo`)
- Títulos en mayúsculas pero más largos (20-80 caracteres)

#### **Nivel 3: Sub-subtítulos**
- Viñetas (`• Subtítulo`, `- Subtítulo`, `* Subtítulo`)
- Letras minúsculas con paréntesis (`a) Subtítulo`)

### 2. Análisis Contextual

El sistema analiza:
- **Línea anterior**: Para determinar si es continuación de contenido
- **Línea siguiente**: Para verificar si hay contenido después (confirma que es título)
- **Longitud del texto**: Títulos suelen ser más cortos que el contenido
- **Formato**: Mayúsculas, números, viñetas, etc.

### 3. Categorización Inteligente

#### Palabras Clave Mejoradas

**Calidad** (inspección, mantenimiento, análisis):
- `inspección`, `mantenimiento`, `grieta`, `falla`, `análisis`, `preventivo`, `correctivo`

**Tecnológico** (material, fatiga, temperatura):
- `material`, `fatiga`, `térmica`, `temperatura`, `tecnología`

**Operaciones** (motor, aeronave, componente):
- `motor`, `aeronave`, `componente`, `reversible`, `operación`

**Económico** (adquisición, compra):
- `adquisición`, `compra`, `costo`, `presupuesto`

#### Sistema de Puntuación

- Palabras largas (>8 caracteres): peso 3
- Palabras medianas (5-8 caracteres): peso 2
- Palabras cortas (<5 caracteres): peso 1

Esto hace que palabras más específicas tengan mayor influencia en la categorización.

## 📊 Ejemplo con Informe Técnico

### Estructura Detectada:

```
Nivel 1: "Informe Técnico de Reversibles de Motores C560"
  └─ Contenido: Datos de aeronave, grietas detectadas

Nivel 1: "Análisis de Falla"
  └─ Contenido: Explicación de fatiga del material

Nivel 1: "Acciones Preventivas / Correctivas"
  └─ Contenido: Inspecciones, NDT, manuales

Nivel 1: "Conclusión"
  └─ Contenido: No es viable la reparación

Nivel 1: "Recomendación"
  └─ Contenido: Adquisición de componentes

Nivel 1: "Observaciones"
  └─ Contenido: P/N y placards
```

### Categorización:

- **Informe Técnico** → Calidad (inspección, mantenimiento, grieta)
- **Análisis de Falla** → Tecnológico (material, fatiga, térmica)
- **Acciones Preventivas** → Calidad (inspección, preventivo, correctivo)
- **Conclusión** → Operaciones (reparación, componente)
- **Recomendación** → Económico (adquisición)
- **Observaciones** → Operaciones (componente, P/N)

## ✅ Resultado

El sistema ahora:
- ✅ Detecta correctamente títulos, subtítulos y capítulos
- ✅ Asigna niveles jerárquicos (1, 2, 3)
- ✅ Analiza contexto (líneas anteriores y siguientes)
- ✅ Categoriza de forma inteligente con palabras clave mejoradas
- ✅ Proporciona información de estructura en la respuesta

## 📈 Información Adicional

La respuesta del API ahora incluye:

```json
{
  "structure": {
    "levels": {
      "titles": 6,      // Títulos principales (nivel 1)
      "subtitles": 0,    // Subtítulos (nivel 2)
      "subSubtitles": 0 // Sub-subtítulos (nivel 3)
    }
  }
}
```

Esto permite visualizar la estructura del documento procesado.
