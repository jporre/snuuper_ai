# Elementos de Inteligencia Artificial en Snuuper

## Índice

1. [Introducción](#introducción)
2. [Arquitectura General de IA](#arquitectura-general-de-ia)
3. [Proveedores y Modelos de IA](#proveedores-y-modelos-de-ia)
4. [Flujos de Procesamiento con IA](#flujos-de-procesamiento-con-ia)
5. [Sistema de Embeddings y Búsqueda Vectorial](#sistema-de-embeddings-y-búsqueda-vectorial)
6. [Sistema de Agentes Conversacionales](#sistema-de-agentes-conversacionales)
7. [Generación Automática de Contenido](#generación-automática-de-contenido)
8. [Análisis de Sentimiento y Etiquetado](#análisis-de-sentimiento-y-etiquetado)
9. [Orden de Ejecución de Procesos de IA](#orden-de-ejecución-de-procesos-de-ia)

---

## Introducción

Este documento describe en detalle todos los elementos de Inteligencia Artificial implementados en el proyecto Snuuper. El sistema utiliza IA en múltiples puntos del flujo de trabajo para:

- **Procesar y analizar respuestas de encuestas** (tareas de cliente incógnito)
- **Generar reportes ejecutivos y resúmenes automáticos**
- **Proporcionar asistencia conversacional contextual** a los usuarios
- **Realizar búsquedas semánticas** de información relevante
- **Analizar sentimientos y etiquetar respuestas** de forma automática

---

## Arquitectura General de IA

El sistema de IA en Snuuper está diseñado con una arquitectura modular que integra tres proveedores principales:

```
┌─────────────────────────────────────────────────────────────┐
│                    CAPA DE APLICACIÓN                       │
│  (SvelteKit - Interfaces de Usuario y API Endpoints)       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  CAPA DE SERVICIOS DE IA                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌───────────────┐  ┌───────────────┐  ┌──────────────┐  │
│  │   OpenAI      │  │ Google Gemini │  │   Flowise    │  │
│  │               │  │               │  │              │  │
│  │ - GPT-4.1-mini│  │ - Gemini      │  │ - Chatflows  │  │
│  │ - GPT-4o-mini │  │   2.5-pro     │  │   personali- │  │
│  │ - GPT-4-turbo │  │               │  │   zados      │  │
│  │ - Embeddings  │  │               │  │              │  │
│  └───────────────┘  └───────────────┘  └──────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              CAPA DE ALMACENAMIENTO (MongoDB)               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  • Colección: ai_TaskAnswers (embeddings + análisis)       │
│  • Colección: ai_politicas (embeddings de políticas)       │
│  • Colección: Task (reportes y manuales generados)         │
│  • Índices vectoriales para búsqueda semántica             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Proveedores y Modelos de IA

### 1. OpenAI

**Ubicación**: Utilizado en múltiples endpoints
**Cliente**: Configurado con `OPENAI_API_KEY`

#### Modelos Implementados:

| Modelo | Uso Principal | Temperatura | Características |
|--------|---------------|-------------|-----------------|
| `gpt-4.1-mini` | Chat conversacional con streaming | 0.4 | Respuestas en tiempo real, balance costo/calidad |
| `gpt-4o-mini` | Generación de reportes y resúmenes | 0.4 | Análisis de datos, formato estructurado |
| `gpt-4-turbo` | Especificaciones ejecutivas | 0.4 | Documentos formales, ingeniería inversa |
| `gpt-5-mini-2025-08-07` | Análisis de respuestas individuales | 0.33 | Procesamiento masivo con razonamiento |
| `text-embedding-3-small` | Generación de embeddings | N/A | Vectorización de texto para búsqueda semántica |

#### Funcionalidades:

- **Moderación de contenido**: Validación automática de consultas antes del procesamiento
- **Embeddings**: Conversión de texto a vectores de 1536 dimensiones
- **Streaming**: Respuestas progresivas en tiempo real (Server-Sent Events)
- **Formato JSON**: Generación estructurada para análisis de sentimiento

---

### 2. Google Gemini

**Ubicación**: `/src/routes/gtyui6t7_lk/data/createSherpa/+server.ts`
**Cliente**: Configurado con `GEMINI_API_KEY`

#### Modelo Implementado:

- **Gemini 2.5-pro**: Generación de manuales de instrucciones (Sherpa)

#### Características:

- Generación de textos extensos y estructurados
- Análisis contextual de encuestas complejas
- Instrucciones detalladas para analistas
- Salida en formato markdown

---

### 3. Flowise AI

**Ubicación**: `/src/routes/flowiseChat/+server.ts`
**Endpoint**: `https://ai.4c.cl`
**Chatflow ID**: `98e03b96-eb56-40a5-9885-2b8972f4bccd`

#### Características:

- Sistema de chatflows personalizables
- Integración con flujos de trabajo complejos
- Streaming de respuestas habilitado
- Arquitectura modular y extensible

---

## Flujos de Procesamiento con IA

### Flujo 1: Análisis Completo de Respuestas con Embeddings V2

**Endpoint**: `/gtyui6t7_lk/data/createTaskEmbedingV2`
**Modelo**: GPT-5-mini + text-embedding-3-small

#### Secuencia de Operaciones:

```
1. INICIO
   │
   ├─► Recepción de solicitud con taskId
   │
   ├─► Obtención de todas las respuestas de la tarea desde DB
   │
   ├─► Filtrado de respuestas ya procesadas
   │   (consulta a colección ai_TaskAnswers)
   │
   ├─► División en chunks de 4 respuestas
   │
   ├─► Procesamiento paralelo (30 operaciones simultáneas)
   │   │
   │   └─► Para cada respuesta:
   │       │
   │       ├─► PASO 1: Formateo a Markdown
   │       │   ├─ Fecha y hora legible en español
   │       │   ├─ Dirección del punto de venta
   │       │   ├─ Preguntas y respuestas estructuradas
   │       │   └─ Exclusión de medios (fotos, audio)
   │       │
   │       ├─► PASO 2: Análisis con GPT-5-mini
   │       │   ├─ Input: markdown + manual_ai (instrucciones)
   │       │   ├─ Temperatura: 0.33
   │       │   ├─ Max tokens: 6492
   │       │   └─ Output: análisis profesional en texto
   │       │
   │       ├─► PASO 3: Generación de Embeddings
   │       │   ├─ markdownEmbedding (del contenido)
   │       │   └─ analisisEmbedding (del análisis IA)
   │       │
   │       └─► PASO 4: Almacenamiento en MongoDB
   │           ├─ Colección: ai_TaskAnswers
   │           ├─ Upsert para evitar duplicados
   │           └─ Incluye análisis + vectores
   │
   ├─► Delay de 15 segundos entre lotes
   │   (control de rate limiting)
   │
   └─► FIN: Todas las respuestas enriquecidas
```

#### Configuración de Procesamiento:

- **CHUNK_SIZE**: 4 respuestas por operación
- **PARALLEL_OPERATIONS_COUNT**: 30 operaciones en paralelo
- **Delay entre lotes**: 15 segundos

---

### Flujo 2: Generación de Resumen Ejecutivo de Tarea

**Endpoint**: `/gtyui6t7_lk/data/createTaskSummary`
**Modelo**: GPT-4-turbo

#### Secuencia de Operaciones:

```
1. INICIO
   │
   ├─► Recepción de solicitud con taskId
   │
   ├─► PASO 1: Recolección de Datos
   │   ├─ Información de la tarea (título, descripción, tipo)
   │   ├─ Datos de empresa(s) asociada(s)
   │   ├─ Direcciones de puntos de venta
   │   ├─ Pasos/preguntas de la encuesta con alternativas
   │   └─ Recompensas (créditos, bonos, experiencia)
   │
   ├─► PASO 2: Construcción del Prompt
   │   ├─ Contexto: Encuesta de cliente incógnito
   │   ├─ Rol: Analista experto con 20+ años
   │   ├─ Acción: Ingeniería inversa (especificación)
   │   └─ Formato: 3 párrafos en markdown
   │
   ├─► PASO 3: Llamada a GPT-4-turbo
   │   ├─ Temperatura: 0.4
   │   ├─ Input: datos estructurados de la tarea
   │   └─ Output: especificación de requerimientos
   │
   ├─► PASO 4: Almacenamiento
   │   ├─ Campo: Task.definicion_ejecutiva
   │   └─ Formato: Markdown profesional
   │
   └─► FIN: Especificación generada
```

#### Objetivo:

Generar una **especificación de requerimientos** a partir de una tarea ya creada, usando ingeniería inversa para documentar objetivos, metodología y controles de calidad.

---

### Flujo 3: Generación de Reporte Ejecutivo con Estadísticas

**Endpoint**: `/gtyui6t7_lk/data/createTaskReport`
**Modelo**: GPT-4o-mini

#### Secuencia de Operaciones:

```
1. INICIO
   │
   ├─► Recepción de solicitud con taskId
   │
   ├─► PASO 1: Recolección de Datos
   │   ├─ Información de la tarea
   │   ├─ Información de la empresa (company_summary)
   │   ├─ Pasos/preguntas de la encuesta
   │   └─ Estadísticas completas:
   │       ├─ KPIs generales (total respuestas, tiempo promedio)
   │       ├─ Distribución horaria
   │       ├─ Preguntas de selección múltiple
   │       ├─ Preguntas sí/no
   │       ├─ Estadísticas de precios
   │       ├─ Estadísticas de escala
   │       └─ Archivos subidos
   │
   ├─► PASO 2: Formateo de Estadísticas
   │   └─ Generación de textStats (markdown)
   │       ├─ Cálculo de porcentajes
   │       ├─ Promedios y totales
   │       └─ Distribuciones por pregunta
   │
   ├─► PASO 3: Construcción del Prompt
   │   ├─ Rol: Analista experto en cliente incógnito
   │   ├─ Tarea: Informe ejecutivo con conclusiones
   │   ├─ Input: definición + estadísticas + empresa
   │   └─ Directrices: tono coloquial, sin repetir stats
   │
   ├─► PASO 4: Llamada a GPT-4o-mini
   │   ├─ Temperatura: 0.4
   │   ├─ Input: estadísticas + contexto
   │   └─ Output: informe ejecutivo
   │
   ├─► PASO 5: Almacenamiento
   │   ├─ Campo: Task.resumen_ejecutiva
   │   └─ Incluye reseña de empresa + conclusiones
   │
   └─► FIN: Reporte ejecutivo generado
```

#### Características del Reporte:

- **Reseña de la empresa**: Contexto relevante del cliente
- **Análisis sin repetir estadísticas**: Interpretación de datos
- **Conclusiones accionables**: Recomendaciones específicas
- **Tono profesional-coloquial**: Accesible pero riguroso

---

### Flujo 4: Generación de Manual de Instrucciones (Sherpa)

**Endpoint**: `/gtyui6t7_lk/data/createSherpa`
**Modelo**: Google Gemini 2.5-pro

#### Secuencia de Operaciones:

```
1. INICIO
   │
   ├─► Recepción de solicitud con taskId
   │
   ├─► PASO 1: Recolección de Datos
   │   ├─ Información completa de la tarea
   │   ├─ Datos de la empresa mandante
   │   └─ Contexto del negocio
   │
   ├─► PASO 2: Construcción del System Prompt
   │   ├─ Contexto: Análisis de encuestas
   │   ├─ Rol: Analista experto
   │   └─ Objetivo: Manual para otros analistas
   │
   ├─► PASO 3: Construcción de la Query
   │   └─ Solicitud de manual de instrucciones para:
   │       ├─ Análisis de respuestas
   │       ├─ Evaluación de calidad
   │       └─ Recomendaciones específicas
   │
   ├─► PASO 4: Llamada a Gemini 2.5-pro
   │   ├─ Input: contexto + query
   │   ├─ Formato: texto plano (markdown)
   │   └─ Tono: profesional-coloquial
   │
   ├─► PASO 5: Almacenamiento
   │   ├─ Campo: Task.manual_ai
   │   └─ Uso: Guía para análisis posteriores
   │
   └─► FIN: Manual de instrucciones generado
```

#### Propósito del Manual:

El manual generado (Sherpa) se utiliza como **contexto para el análisis de respuestas individuales** en el Flujo 1 (createTaskEmbedingV2). Proporciona lineamientos específicos sobre cómo debe analizarse cada respuesta de esa tarea en particular.

---

### Flujo 5: Análisis de Sentimiento y Etiquetado

**Endpoint**: `/gtyui6t7_lk/data/PoblarStepAnswerDetails`
**Modelo**: GPT-4o-mini

#### Secuencia de Operaciones:

```
1. INICIO
   │
   ├─► Recepción de solicitud con taskId
   │
   ├─► PASO 1: Obtención de Respuestas
   │   └─ Todas las respuestas de la tarea
   │
   ├─► PASO 2: Procesamiento por Respuesta
   │   │
   │   └─► Para cada respuesta:
   │       │
   │       ├─► Identificación de preguntas abiertas
   │       │   (tipo: free_question)
   │       │
   │       ├─► Extracción del texto de respuesta
   │       │
   │       ├─► PASO 3: Análisis con GPT-4o-mini
   │       │   ├─ Input: texto de respuesta abierta
   │       │   ├─ Output: JSON estructurado
   │       │   │   {
   │       │   │     "sentiment": "positive|neutral|negative",
   │       │   │     "tags": ["etiqueta1", "etiqueta2", ...]
   │       │   │   }
   │       │   └─ Temperatura: ~0.4
   │       │
   │       └─► PASO 4: Almacenamiento
   │           ├─ Creación de step especial tipo 'ai'
   │           ├─ Campo: stepAnswerDetails
   │           └─ Incluye: sentiment + tags
   │
   └─► FIN: Respuestas etiquetadas
```

#### Clasificación de Sentimiento:

- **positive**: Experiencia positiva del cliente
- **neutral**: Experiencia neutra o mixta
- **negative**: Experiencia negativa del cliente
- **indeterminado**: No se puede determinar

#### Etiquetado Automático:

El modelo extrae automáticamente temas relevantes de la respuesta (ejemplo: "limpieza", "atención", "precios", "velocidad del servicio").

---

## Sistema de Embeddings y Búsqueda Vectorial

### Arquitectura de Embeddings

El sistema utiliza **embeddings de 1536 dimensiones** generados con `text-embedding-3-small` para realizar búsqueda semántica.

#### Colecciones MongoDB con Vectores:

| Colección | Índice | Campo | Uso |
|-----------|--------|-------|-----|
| `ai_TaskAnswers` | `vector_analisis` | `analisisEmbedding` | Búsqueda de respuestas similares |
| `ai_TaskAnswers` | N/A | `markdownEmbedding` | Búsqueda en contenido original |
| `ai_politicas` | `poli_vector` | `embedding` | Búsqueda de políticas relevantes |

---

### Búsqueda Vectorial: Proceso Detallado

#### Caso de Uso 1: Chat con Contexto de Tarea

**Ubicación**: `/src/routes/openai/+server.ts`

```
1. Usuario realiza una pregunta en el chat
   │
   ├─► PASO 1: Moderación de Contenido
   │   ├─ OpenAI Moderations API
   │   └─ Bloqueo si contenido inapropiado
   │
   ├─► PASO 2: Generación de Embedding
   │   ├─ Modelo: text-embedding-3-small
   │   ├─ Input: última pregunta del usuario
   │   └─ Output: vector de 1536 dimensiones
   │
   ├─► PASO 3: Búsqueda Vectorial (si hay taskId)
   │   ├─ Índice: vector_analisis
   │   ├─ Colección: ai_TaskAnswers
   │   ├─ NumCandidates: 100
   │   ├─ Limit: 30 resultados más similares
   │   └─ Match adicional: taskId específico
   │
   ├─► PASO 4: Extracción de Contexto RAG
   │   └─ Para cada resultado:
   │       ├─ analisis (texto generado por IA)
   │       ├─ coordinates (ubicación geográfica)
   │       └─ nameAddress (nombre del punto de venta)
   │
   ├─► PASO 5: Construcción del Prompt
   │   ├─ Agente: agente_tarea
   │   ├─ Datos de la tarea + estadísticas
   │   ├─ Pasos/preguntas
   │   └─ Contexto RAG (respuestas similares)
   │
   ├─► PASO 6: Llamada a GPT-4.1-mini
   │   ├─ Temperatura: 0.4
   │   ├─ Streaming: habilitado
   │   └─ Conversación completa
   │
   └─► PASO 7: Respuesta en Tiempo Real
       └─ Server-Sent Events (SSE)
```

#### Caso de Uso 2: Búsqueda de Políticas

**Ubicación**: `/src/routes/gtyui6t7_lk/data/buscaPoliticas/+server.ts`

```
1. Recepción de consulta
   │
   ├─► Generación de embedding de la consulta
   │
   ├─► Búsqueda vectorial
   │   ├─ Índice: poli_vector
   │   ├─ Colección: ai_politicas
   │   ├─ NumCandidates: 150
   │   └─ Limit: 10 políticas más relevantes
   │
   └─► Retorno de resultados
       ├─ text (contenido de la política)
       ├─ loc (ubicación en documentación)
       └─ score (similaridad semántica)
```

---

## Sistema de Agentes Conversacionales

El sistema implementa dos agentes especializados con personalidad y contexto específicos.

### Agente 1: Concierge (Asistente General)

**Ubicación**: `/src/lib/prompts.ts` - función `agente_concerje`
**Uso**: Chat general sobre Snuuper (sin contexto de tarea específica)

#### Características:

- **Rol**: Analista experto en experiencia de usuario y puntos de venta
- **Alcance**: Solo temas relacionados con Snuuper
- **Tono**: Conversacional y amigable, profesional pero cercano
- **Personalización**: Se dirige al usuario por su nombre
- **Contexto temporal**: Incluye fecha, hora y semana del año

#### Fuentes de Información:

```javascript
const faq = await getFAQ(country);
// Preguntas frecuentes organizadas por secciones
```

El agente tiene acceso a:
- FAQ de la base de datos (por país)
- Políticas de seguridad (vía búsqueda vectorial si necesario)
- Fecha y hora actual para contexto temporal

#### Ejemplo de Prompt Construido:

```
Eres un analista experto en experiencia de usuario y puntos de venta...
Hoy es viernes, 20/11/2025, 15:30, Semana del año: 47 en el Mes: noviembre

# Directrices:
- Alcance: Solo responder sobre Snuuper
- Tono: Conversacional y amigable
- Personalización: Usa el nombre "Juan"

## Preguntas Frecuentes Disponibles:
### Inicio de Sesión
**Pregunta:** ¿Cómo recupero mi contraseña?
**Respuesta:** ...
```

---

### Agente 2: Agente de Tarea (Asistente Especializado)

**Ubicación**: `/src/lib/prompts.ts` - función `agente_tarea`
**Uso**: Chat con contexto de tarea específica (análisis de encuesta)

#### Características:

- **Rol**: Analista experto especializado en la tarea actual
- **Alcance**: Preguntas sobre la tarea específica
- **Contexto Rico**:
  - Título de la tarea
  - Definición ejecutiva (especificación)
  - Estadísticas acumuladas
  - Pasos/preguntas con alternativas
  - Respuestas similares (RAG)

#### Fuentes de Información:

```javascript
// Datos de la tarea
const taskData = await getTask(taskId, country);
const textStats = await getStatsText(taskId, country);
const taskSteps = await getStepDetails(taskId, country);

// Contexto RAG (respuestas similares)
const getKBData = await getTaskAnswerEmbedingsFromMongo(
    taskId,
    searchVectors,
    country
);
```

#### Ejemplo de Prompt Construido:

```
Eres un analista experto... conversando con Juan sobre la tarea
"Evaluación Tricot Febrero 2025"

Definición ejecutiva: [especificación generada por IA]

Estadísticas generales:
- Total de Respuestas: 42
- Tiempo Promedio: 98 minutos
- Distribución horaria: [...]

Pasos de la tarea:
- Paso 1: Fotografiar fachada del local
- Paso 2: ¿El personal te saludó al entrar?
  Alternativas: 1: Sí, 2: No

En base a tu pregunta, estas respuestas pueden ser relevantes:
[datos RAG de respuestas similares]
```

---

### Ejemplos de Conversación del Agente de Tarea

El prompt incluye ejemplos detallados de interacciones esperadas:

#### Categoría: Tiempos y Duración

```
Usuario: ¿Cuál es el tiempo promedio en Tricot Apumanque?
Asistente: Analizando las encuestas en Tricot Apumanque,
el tiempo promedio es 98 minutos, dentro del límite de 120
minutos. Las duraciones varían de 3 minutos a 21 horas,
pero los extremos sugieren pausas o problemas de registro.
```

#### Categoría: Calidad y Condiciones

```
Usuario: ¿Qué podemos concluir sobre la limpieza?
Asistente: Según el checklist (pregunta 11):
- 100% reportan tiendas "Limpias" y "Despejadas"
- "Sin ropa en el piso" en más del 80%
- Calificación promedio: 4.4 de 6
```

---

## Generación Automática de Contenido

### 1. Definición Ejecutiva (Especificación de Requerimientos)

**Modelo**: GPT-4-turbo
**Endpoint**: `/gtyui6t7_lk/data/createTaskSummary`

#### Contenido Generado:

- **Análisis del diseño de la encuesta**: Objetivos, estructura, áreas de enfoque
- **Reconstrucción de especificación**: Ingeniería inversa desde tarea existente
- **Tres secciones**:
  1. Objetivos de la encuesta
  2. Estructura y metodología
  3. Control de calidad

#### Formato:

- Texto en markdown
- 3 párrafos concisos
- Lenguaje afirmativo (no condicional)
- Términos relevantes resaltados

#### Almacenamiento:

- Campo: `Task.definicion_ejecutiva`
- Uso posterior: Contexto para agente de tarea

---

### 2. Resumen Ejecutivo (Informe con Estadísticas)

**Modelo**: GPT-4o-mini
**Endpoint**: `/gtyui6t7_lk/data/createTaskReport`

#### Contenido Generado:

- **Reseña de la empresa**: Contexto del cliente mandante
- **Análisis de resultados**: Interpretación de estadísticas
- **Conclusiones**: Hallazgos principales
- **Recomendaciones**: Sugerencias accionables

#### Características:

- **No repite estadísticas crudas**: Solo interpretación
- **Incluye contexto empresarial**: company_summary
- **Tono profesional-coloquial**: Accesible pero riguroso
- **Análisis sin jerga técnica**: Comprensible para stakeholders

#### Almacenamiento:

- Campo: `Task.resumen_ejecutiva`
- Uso: Presentación a clientes/gerencia

---

### 3. Manual de Instrucciones (Sherpa)

**Modelo**: Google Gemini 2.5-pro
**Endpoint**: `/gtyui6t7_lk/data/createSherpa`

#### Contenido Generado:

- **Guía para analistas**: Cómo interpretar respuestas de esta tarea
- **Criterios de evaluación**: Qué buscar en las respuestas
- **Estándares de calidad**: Qué constituye una buena respuesta
- **Recomendaciones específicas**: Según el tipo de encuesta

#### Características:

- **Formato extenso**: Varias páginas de instrucciones
- **Contexto específico**: Adaptado a la tarea particular
- **Markdown estructurado**: Secciones, listas, ejemplos
- **Tono instructivo**: Para guiar a otros analistas

#### Almacenamiento:

- Campo: `Task.manual_ai`
- Uso: Contexto para análisis de respuestas (Flujo 1)

---

## Análisis de Sentimiento y Etiquetado

### Proceso de Análisis

**Modelo**: GPT-4o-mini
**Endpoint**: `/gtyui6t7_lk/data/PoblarStepAnswerDetails`

#### Input:

```json
{
  "tipo_paso": "free_question",
  "respuesta_texto": "El local estaba muy limpio y el personal
  fue amable, pero la espera fue un poco larga"
}
```

#### Output (JSON estructurado):

```json
{
  "sentiment": "neutral",
  "tags": ["limpieza", "atención al cliente", "tiempo de espera", "servicio"]
}
```

---

### Clasificación de Sentimiento

| Categoría | Criterio | Ejemplo |
|-----------|----------|---------|
| **positive** | Experiencia claramente positiva | "Excelente servicio, muy rápido" |
| **neutral** | Mixto o sin carga emocional | "Todo normal, nada destacable" |
| **negative** | Experiencia claramente negativa | "Muy mala atención, local sucio" |
| **indeterminado** | No se puede determinar | "N/A" o respuestas ambiguas |

---

### Etiquetado Automático

El modelo extrae **temas relevantes** de la respuesta libre:

#### Ejemplos de Tags:

- `limpieza`
- `atención al cliente`
- `tiempo de espera`
- `precios`
- `calidad de productos`
- `orden del local`
- `disponibilidad de stock`
- `personal amable`
- `velocidad del servicio`

---

### Almacenamiento

Los resultados se guardan como un **step especial tipo 'ai'** en `stepAnswerDetails`:

```json
{
  "tipo_paso": "ai",
  "orden": 999,
  "sentiment": "neutral",
  "tags": ["limpieza", "atención al cliente", "tiempo de espera"]
}
```

---

## Orden de Ejecución de Procesos de IA

### Secuencia Completa: Desde Creación de Tarea hasta Chat Interactivo

```
╔═════════════════════════════════════════════════════════════╗
║  FASE 1: CONFIGURACIÓN DE TAREA (Orden de Botones en UI)   ║
╚═════════════════════════════════════════════════════════════╝

Acción del Usuario                    Proceso de IA
─────────────────────────────────────────────────────────────

1. Crear tarea en el sistema
   └─► Sin IA, configuración manual

2. Clic: "Generar Manual (Sherpa)"
   │
   └─► Endpoint: createSherpa
       ├─ Modelo: Gemini 2.5-pro
       ├─ Input: Datos de tarea + empresa
       ├─ Output: Manual de instrucciones
       └─ Almacena: Task.manual_ai

       ⏱️ Tiempo estimado: 30-60 segundos

3. Clic: "Generar Especificación"
   │
   └─► Endpoint: createTaskSummary
       ├─ Modelo: GPT-4-turbo
       ├─ Input: Diseño de tarea
       ├─ Output: Especificación ejecutiva
       └─ Almacena: Task.definicion_ejecutiva

       ⏱️ Tiempo estimado: 20-40 segundos


╔═════════════════════════════════════════════════════════════╗
║  FASE 2: RECOLECCIÓN DE RESPUESTAS                          ║
╚═════════════════════════════════════════════════════════════╝

Los usuarios de la app móvil completan encuestas
└─► Respuestas almacenadas en TaskAnswer


╔═════════════════════════════════════════════════════════════╗
║  FASE 3: PROCESAMIENTO DE RESPUESTAS (Orden Recomendado)   ║
╚═════════════════════════════════════════════════════════════╝

4. Clic: "Analizar Sentimientos"
   │
   └─► Endpoint: PoblarStepAnswerDetails
       ├─ Modelo: GPT-4o-mini
       ├─ Procesa: Preguntas abiertas
       ├─ Output: Sentiment + Tags
       └─ Almacena: stepAnswerDetails (tipo: ai)

       ⏱️ Tiempo estimado: 10-30 segundos/respuesta

5. Clic: "Generar Embeddings y Análisis"
   │
   └─► Endpoint: createTaskEmbedingV2
       ├─ Modelo: GPT-5-mini + text-embedding-3-small
       ├─ Procesa: Todas las respuestas nuevas
       ├─ Pipeline:
       │   ├─ Formateo a markdown
       │   ├─ Análisis con GPT-5-mini
       │   │   (usa Task.manual_ai como contexto)
       │   ├─ Generación de markdownEmbedding
       │   └─ Generación de analisisEmbedding
       ├─ Output: Análisis + vectores
       └─ Almacena: ai_TaskAnswers

       ⏱️ Tiempo estimado:
          - 4 respuestas por chunk
          - 30 operaciones en paralelo
          - 15 segundos de delay entre lotes
          - ~500 respuestas = 15-20 minutos

6. Clic: "Generar Reporte Ejecutivo"
   │
   └─► Endpoint: createTaskReport
       ├─ Modelo: GPT-4o-mini
       ├─ Input: Estadísticas + empresa + definición
       ├─ Output: Informe ejecutivo
       └─ Almacena: Task.resumen_ejecutiva

       ⏱️ Tiempo estimado: 30-60 segundos


╔═════════════════════════════════════════════════════════════╗
║  FASE 4: INTERACCIÓN CON CHAT (Cualquier Momento)          ║
╚═════════════════════════════════════════════════════════════╝

Usuario escribe pregunta en chat
│
├─► Endpoint: /openai
│   │
│   ├─► PASO 1: Moderación
│   │   └─ OpenAI Moderation API
│   │
│   ├─► PASO 2: Embedding de pregunta
│   │   └─ text-embedding-3-small
│   │
│   ├─► PASO 3: Búsqueda vectorial (si hay taskId)
│   │   ├─ Índice: vector_analisis
│   │   ├─ Límite: 30 respuestas similares
│   │   └─ RAG context extraído
│   │
│   ├─► PASO 4: Selección de agente
│   │   ├─ Con taskId → agente_tarea
│   │   │   ├─ Usa: Task.definicion_ejecutiva
│   │   │   ├─ Estadísticas de tarea
│   │   │   ├─ Pasos/preguntas
│   │   │   └─ Contexto RAG
│   │   │
│   │   └─ Sin taskId → agente_concerje
│   │       └─ Usa: FAQ del país
│   │
│   ├─► PASO 5: Chat con GPT-4.1-mini
│   │   ├─ Temperatura: 0.4
│   │   ├─ Streaming: habilitado
│   │   └─ Conversación completa
│   │
│   └─► PASO 6: Respuesta en tiempo real
│       └─ Server-Sent Events (SSE)
│
└─► ⏱️ Tiempo de respuesta: 2-10 segundos
```

---

### Dependencias entre Procesos

```
Manual (Sherpa)
   │
   └─► REQUERIDO PARA ───► Análisis de Respuestas (createTaskEmbedingV2)
                               │
                               └─► Genera embeddings para ───► Chat con RAG


Especificación Ejecutiva
   │
   └─► RECOMENDADO PARA ───► Chat con contexto de tarea
                               (agente_tarea)


Análisis de Sentimientos
   │
   └─► INDEPENDIENTE ───► Puede ejecutarse en cualquier momento
                          No afecta otros procesos


Reporte Ejecutivo
   │
   └─► INDEPENDIENTE ───► Puede ejecutarse en cualquier momento
                          No requiere embeddings previos
```

---

### Recomendaciones de Orden

#### Flujo Óptimo Completo:

```
1. Crear tarea manualmente
2. Generar Manual (Sherpa) ← PRIMERO
3. Generar Especificación ← SEGUNDO
4. Esperar respuestas de usuarios
5. Generar Embeddings y Análisis ← TERCERO (requiere Sherpa)
6. Analizar Sentimientos ← CUARTO (opcional, paralelo)
7. Generar Reporte Ejecutivo ← QUINTO
8. Usar Chat interactivo ← SEXTO (ya tiene todo el contexto)
```

#### Flujo Mínimo para Chat con RAG:

```
1. Crear tarea
2. Generar Manual (Sherpa)
3. Generar Embeddings y Análisis
4. Chat ya funciona con búsqueda semántica
```

---

### Tiempos de Procesamiento Estimados

| Proceso | Respuestas | Tiempo Estimado |
|---------|-----------|-----------------|
| Manual (Sherpa) | N/A | 30-60 seg |
| Especificación | N/A | 20-40 seg |
| Sentimientos | 100 respuestas | 15-30 min |
| Embeddings V2 | 100 respuestas | 10-15 min |
| Embeddings V2 | 500 respuestas | 45-60 min |
| Reporte | N/A | 30-60 seg |
| Chat (pregunta) | N/A | 2-10 seg |

---

## Configuración de MongoDB para IA

### Colección: ai_TaskAnswers

**Propósito**: Almacenar respuestas enriquecidas con análisis e embeddings

#### Estructura:

```javascript
{
  _id: ObjectId,
  taskId: ObjectId,                    // Referencia a Task
  taskAnswerId: ObjectId,              // Referencia a TaskAnswer
  taskAnswers: Object,                 // Copia completa de respuesta
  markdown: String,                    // Respuesta formateada
  markdownEmbedding: Array<Number>,    // Vector 1536 dim
  analisis: String,                    // Análisis generado por IA
  analisis_cost: Object,               // Uso de tokens
  analisisEmbedding: Array<Number>     // Vector 1536 dim
}
```

#### Índices:

- **vector_analisis**: Índice vectorial en `analisisEmbedding`
  - Tipo: MongoDB Atlas Vector Search
  - NumDimensions: 1536
  - Similaridad: cosine

---

### Colección: ai_politicas

**Propósito**: Almacenar políticas de Snuuper con embeddings

#### Estructura:

```javascript
{
  _id: ObjectId,
  text: String,           // Contenido de la política
  loc: String,            // Ubicación en documentación
  embedding: Array<Number> // Vector 1536 dim
}
```

#### Índices:

- **poli_vector**: Índice vectorial en `embedding`

---

### Colección: Task

**Propósito**: Tareas con campos generados por IA

#### Campos Relevantes:

```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  // ... otros campos ...

  // Campos generados por IA:
  manual_ai: String,              // Manual Sherpa (Gemini)
  definicion_ejecutiva: String,   // Especificación (GPT-4-turbo)
  resumen_ejecutiva: String       // Reporte (GPT-4o-mini)
}
```

---

## Variables de Entorno Requeridas

```bash
# OpenAI
OPENAI_API_KEY=sk-...

# Google Gemini
GEMINI_API_KEY=...

# MongoDB
MONGODB_USERNAME=...
MONGODB_PASSWORD=...
MONGODB_HOST=...           # Cluster principal
MONGODB_HOST_QA=...        # Cluster para analytics (embeddings)
```

---

## Endpoints de IA Disponibles

| Endpoint | Método | Función | Modelo |
|----------|--------|---------|--------|
| `/openai` | POST | Chat con contexto | GPT-4.1-mini |
| `/flowiseChat` | POST | Chat vía Flowise | Flowise |
| `/gtyui6t7_lk/data/createSherpa` | POST | Manual de instrucciones | Gemini 2.5-pro |
| `/gtyui6t7_lk/data/createTaskSummary` | POST | Especificación ejecutiva | GPT-4-turbo |
| `/gtyui6t7_lk/data/createTaskReport` | POST | Reporte ejecutivo | GPT-4o-mini |
| `/gtyui6t7_lk/data/createTaskEmbedingV2` | POST | Análisis + embeddings | GPT-5-mini + embeddings |
| `/gtyui6t7_lk/data/PoblarStepAnswerDetails` | POST | Análisis de sentimiento | GPT-4o-mini |
| `/gtyui6t7_lk/data/createTaskAnswersEmbeddings` | POST | Embeddings simples | embeddings |
| `/gtyui6t7_lk/data/buscaPoliticas` | POST | Búsqueda de políticas | N/A (vectorial) |

---

## Características Avanzadas

### 1. RAG (Retrieval-Augmented Generation)

- **Búsqueda vectorial** de respuestas similares
- **Contexto dinámico** basado en similaridad semántica
- **Límite de 30 resultados** más relevantes
- **Filtrado por tarea** para mantener relevancia

### 2. Streaming en Tiempo Real

- **Server-Sent Events (SSE)** para chat
- **Respuestas progresivas** (palabra por palabra)
- **Experiencia fluida** para el usuario

### 3. Procesamiento Paralelo

- **Chunks de 4-10 respuestas** por operación
- **Hasta 30 operaciones simultáneas**
- **Rate limiting controlado** (15s delay entre lotes)

### 4. Control de Calidad

- **Moderación automática** de contenido (OpenAI)
- **Validación de JSON** en respuestas estructuradas
- **Manejo de errores** robusto con reintentos
- **Upsert para evitar duplicados**

---

## Costos y Optimización

### Estrategias de Optimización:

1. **Uso de modelos mini**: GPT-4o-mini y GPT-4.1-mini para balance costo/calidad
2. **Embeddings eficientes**: text-embedding-3-small (más económico)
3. **Procesamiento incremental**: Solo respuestas nuevas
4. **Filtrado de duplicados**: Verificación antes de procesar
5. **Rate limiting**: Control de requests para evitar sobrecostos

---

## Conclusión

El sistema de IA de Snuuper está diseñado como una **plataforma modular y escalable** que integra múltiples proveedores y modelos para proporcionar:

- ✅ **Análisis automático** de miles de respuestas de encuestas
- ✅ **Generación de documentación** profesional sin intervención humana
- ✅ **Asistencia conversacional** contextual y personalizada
- ✅ **Búsqueda semántica** de información relevante
- ✅ **Procesamiento paralelo** para optimizar tiempos

La arquitectura permite agregar nuevos modelos y proveedores fácilmente, y escala horizontalmente gracias al procesamiento por chunks y MongoDB Atlas Vector Search.

---

**Fecha de Documentación**: 2025-11-20
**Versión**: 1.0
**Mantenedor**: Equipo de Desarrollo Snuuper
