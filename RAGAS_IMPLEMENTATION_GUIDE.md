# Guía de Implementación: Evaluación RAGAS para SpotifyRAG

## Resumen Ejecutivo

Se ha completado la implementación del módulo de evaluación automática RAGAS para el sistema RAG de SpotifyRAG. Este módulo permite evaluar objetivamente la calidad del pipeline mediante tres métricas clave:

- **Faithfulness**: Fidelidad de la respuesta respecto al contexto recuperado
- **Answer Relevancy**: Relevancia de la respuesta a la pregunta formulada
- **Context Recall**: Efectividad en la recuperación de contextos relevantes

---

## Cambios Realizados

### 1. Python Service (`python_service/`)

#### Nuevos Archivos
- **`datasets/evaluation_dataset.json`**
  - Dataset con 20 pares pregunta-respuesta esperada
  - Dominio musical (canciones, artistas, géneros)
  - Base para evaluación reproducible

- **`scripts/evaluate_rag.py`**
  - Script principal de evaluación RAGAS
  - Funciones clave:
    - `cargar_dataset()`: Lee dataset de evaluación
    - `obtener_respuesta_rag()`: Consulta el backend RAG
    - `construir_dataset_ragas()`: Formatea datos para RAGAS
    - `ejecutar_ragas()`: Ejecuta framework RAGAS
    - `guardar_resultados_mongodb()`: Persiste resultados

#### Modificaciones
- **`requirements.txt`**
  - Agregados: `ragas>=0.2`, `datasets`, `pymongo`

### 2. Backend Node.js (`nosql_backend/`)

#### Nuevos Archivos
- **`src/controllers/evaluation.controller.js`**
  - Controlador con 4 funciones:
    - `ejecutarEvaluacion()`: Dispara script Python
    - `obtenerResultadosHistoricos()`: Historial de evaluaciones
    - `obtenerDetallesEvaluacion()`: Detalles de evaluación específica
    - `obtenerResumenEvaluaciones()`: Estadísticas agregadas

- **`src/routes/evaluation.js`**
  - Rutas REST:
    - `POST /evaluation/run` - Iniciar evaluación
    - `GET /evaluation/results` - Historial
    - `GET /evaluation/results/:id` - Detalles
    - `GET /evaluation/summary` - Resumen

#### Modificaciones
- **`src/routes/index.js`**
  - Integración de rutas de evaluación

### 3. Frontend NextJS (`nosql_frontend/`)

#### Nuevos Archivos
- **`src/api/services/evaluationService.js`**
  - Cliente HTTP para endpoints de evaluación
  - 4 métodos: runEvaluation, getResults, getEvaluationDetails, getSummary

- **`src/app/evaluation/layout.tsx`**
  - Layout para sección de evaluación

- **`src/app/evaluation/page.tsx`**
  - Página principal de evaluación
  - Gestiona estado y coordinación de componentes

- **`src/components/evaluation/EvaluationMetrics.tsx`**
  - Tarjetas con métricas promedio
  - Visualización de estadísticas generales

- **`src/components/evaluation/EvaluationRunner.tsx`**
  - Panel de control para ejecutar evaluación
  - Información técnica y estimaciones de tiempo

- **`src/components/evaluation/EvaluationHistory.tsx`**
  - Historial expandible de evaluaciones
  - Detalles de cada consulta y su respuesta

---

## Flujo de Funcionamiento

```
Usuario abre /evaluation en Frontend
    ↓
Frontend carga métricas y historial (GET /evaluation/summary, /results)
    ↓
Usuario hace clic en "Ejecutar Evaluación RAGAS"
    ↓
POST /evaluation/run → Backend
    ↓
Backend dispara: python_service/scripts/evaluate_rag.py
    ↓
Script Python:
  1. Carga evaluation_dataset.json (20 preguntas)
  2. Para cada pregunta:
     - Consulta POST /rag/texto-texto en Backend
     - Obtiene respuesta + contextos
  3. Ejecuta RAGAS con métricas (Faithfulness, Answer Relevancy, Context Recall)
  4. Guarda resultados en MongoDB (colecciones: evaluaciones, consultas_evaluacion)
    ↓
Backend retorna OK al Frontend
    ↓
Frontend actualiza visualización con nuevos resultados
```

---

## Instalación y Configuración

### Prerrequisitos
- Python 3.8+
- Node.js 18+
- MongoDB conectado
- `HUGGINGFACE_API_KEY` configurada en `.env`

### Paso 1: Python Service
```bash
cd python_service
pip install -r requirements.txt
# Verificar: python scripts/evaluate_rag.py (test)
```

### Paso 2: Backend
```bash
cd nosql_backend
npm install
# El backend ya está listo con las nuevas rutas
```

### Paso 3: Frontend
```bash
cd nosql_frontend
npm install
# Acceder a http://localhost:3000/evaluation
```

---

## Uso

### Ejecutar Evaluación desde Frontend
1. Navegar a `/evaluation`
2. Hacer clic en "Ejecutar Evaluación RAGAS"
3. Esperar 2-5 minutos (según recursos)
4. Visualizar resultados automáticamente

### Ejecutar Evaluación manualmente (Python)
```bash
cd python_service
python scripts/evaluate_rag.py
```

### Consultar Resultados vía API
```bash
# Obtener resumen
curl http://localhost:3000/api/evaluation/summary

# Obtener historial
curl http://localhost:3000/api/evaluation/results

# Obtener detalles de una evaluación
curl http://localhost:3000/api/evaluation/results/<EVALUATION_ID>
```

---

## Almacenamiento en MongoDB

### Colección: `evaluaciones`
```javascript
{
  _id: ObjectId,
  fecha_evaluacion: ISODate,
  modelo_evaluado: "meta-llama/Meta-Llama-3-8B-Instruct",
  total_consultas: 20,
  metricas: {
    faithfulness: 0.89,
    answer_relevancy: 0.92,
    context_recall: 0.81
  }
}
```

### Colección: `consultas_evaluacion`
```javascript
{
  _id: ObjectId,
  id_evaluacion: ObjectId,
  indice: 0,
  question: "¿Quién interpreta Bohemian Rhapsody?",
  ground_truth: "Bohemian Rhapsody es interpretada por Queen.",
  answer: "Bohemian Rhapsody es interpretada por Queen.",
  contexts: ["Canción: Bohemian Rhapsody - Artista: Queen"],
  fecha: ISODate
}
```

---

## Estructura del Dataset

El archivo `datasets/evaluation_dataset.json` contiene 20 pares:

```json
{
  "question": "¿Quién interpreta Bohemian Rhapsody?",
  "ground_truth": "Bohemian Rhapsody es interpretada por Queen."
}
```

Características:
- ✓ Preguntas variadas (intérpretes, álbumes, géneros)
- ✓ Respuestas verificables y específicas
- ✓ Alineadas con datos disponibles en MongoDB
- ✓ Dominio musical coherente

---

## Métricas RAGAS

### Faithfulness
- **Definición**: ¿Qué tan fiel es la respuesta a los contextos recuperados?
- **Rango**: 0-1 (1 = perfectamente fiel)
- **Interpretación**: Valor > 0.8 indica respuestas bien fundamentadas

### Answer Relevancy
- **Definición**: ¿Qué tan relevante es la respuesta a la pregunta?
- **Rango**: 0-1 (1 = perfectamente relevante)
- **Interpretación**: Valor > 0.8 indica buena alineación pregunta-respuesta

### Context Recall
- **Definición**: ¿Qué tan bien el sistema recuperó contextos necesarios?
- **Rango**: 0-1 (1 = recuperó todos los contextos relevantes)
- **Interpretación**: Valor > 0.8 indica buena recuperación de información

---

## Troubleshooting

### Error: "HUGGINGFACE_API_KEY no está configurada"
- Solución: Agregar a `.env`: `HUGGINGFACE_API_KEY=tu_clave_aqui`

### Error: "Script falló con código X"
- Verificar: Python 3.8+, dependencias instaladas, backend disponible
- Revisar logs en MongoDB en colección `evaluaciones` (campo `error`)

### Evaluación tarda mucho
- Normal: Primera ejecución ~5 min
- Causas: Recursos limitados, HuggingFace API lenta
- Solución: Ejecutar en horarios de bajo uso

### No se ven métricas en Frontend
- Verificar: MongoDB conectado, colecciones creadas
- Revisar: Logs del backend en terminal

---

## Validación de Implementación

Verificar que todos los componentes estén presentes:

```
✓ python_service/datasets/evaluation_dataset.json (20 items)
✓ python_service/scripts/evaluate_rag.py
✓ python_service/requirements.txt (ragas, datasets)
✓ nosql_backend/src/controllers/evaluation.controller.js
✓ nosql_backend/src/routes/evaluation.js
✓ nosql_backend/src/routes/index.js (integración)
✓ nosql_frontend/src/api/services/evaluationService.js
✓ nosql_frontend/src/app/evaluation/layout.tsx
✓ nosql_frontend/src/app/evaluation/page.tsx
✓ nosql_frontend/src/components/evaluation/*.tsx (3 componentes)
```

---

## Próximos Pasos Opcionales

1. **Mejorar Dataset**: Agregar más preguntas o categorías
2. **Extensión de Métricas**: Agregar más métricas RAGAS (ContextPrecision, etc.)
3. **Automatización**: Programar evaluaciones periódicas
4. **Reportes**: Generar reportes en PDF
5. **Alertas**: Notificar si métricas caen bajo umbral

---

## Referencias

- [RAGAS Documentation](https://github.com/explodinggradients/ragas)
- [Implementation Plan](./implementation_plan.md)
- [Proyecto SpotifyRAG](https://github.com/tu-repo/bdnr-spotify-rag)
