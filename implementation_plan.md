# Plan de Implementación Experimental de RAGAS

## Descripción del Objetivo

El objetivo de esta implementación es medir la calidad del sistema RAG de forma objetiva y reproducible utilizando el framework RAGAS.

La evaluación calculará las métricas:
* Faithfulness
* Answer Relevancy
* Context Recall

siguiendo las recomendaciones planteadas en el proyecto académico.

Para garantizar que se evalúe exactamente el mismo flujo utilizado por los usuarios finales, las respuestas serán obtenidas mediante llamadas al pipeline RAG real implementado en el backend Node.js (`nosql_backend`). 

El servicio de evaluación utilizará la misma clave `HUGGINGFACE_API_KEY` empleada por el sistema principal. Esta variable deberá estar disponible tanto para `nosql_backend` como para `python_service` mediante sus respectivos archivos `.env`.

Los resultados serán almacenados en MongoDB dentro de la colección `evaluaciones`, permitiendo comparar futuras versiones del sistema.

---

# Arquitectura Propuesta

## Componentes Involucrados

### nosql_frontend
Responsable de permitir al usuario iniciar la ejecución del experimento y visualizar resultados.

### nosql_backend
Responsable de exponer los endpoints necesarios para:
* ejecutar consultas RAG;
* iniciar evaluaciones;
* consultar resultados históricos.

### python_service
Responsable de ejecutar RAGAS y calcular las métricas.

### MongoDB
Responsable de almacenar:
* consultas generadas;
* resultados de evaluación.

---

# Flujo de Evaluación

```text
Frontend
    │
    ▼
POST /evaluation/run
    │
    ▼
Node.js Backend
    │
    ▼
Python Evaluation Service
           │
           ├── Carga evaluation_dataset.json
           ├── Ejecuta consultas al RAG
           ├── Ejecuta RAGAS
           └── Guarda resultados en MongoDB
```

---

# Dataset de Evaluación

## Nuevo recurso

### `evaluation_dataset.json`
Se creará un dataset dedicado para evaluación.

Ubicación sugerida:
```text
python_service/datasets/evaluation_dataset.json
```

Formato:
```json
[
  {
    "question": "¿Quién interpreta Bohemian Rhapsody?",
    "ground_truth": "Queen interpreta Bohemian Rhapsody."
  },
  {
    "question": "¿A qué álbum pertenece Imagine?",
    "ground_truth": "Imagine pertenece al álbum Imagine de John Lennon."
  }
]
```

Requisitos:
* mínimo 20 preguntas;
* respuestas verificables;
* preguntas relacionadas con el dominio musical del proyecto;
* respuestas basadas en información existente en MongoDB.

Esto cumple directamente con el requisito:
> Preparar un dataset con al menos 20 pares (pregunta, ground_truth).

---

# Cambios en `python_service`

## Nuevo archivo

### `python_service/scripts/evaluate_rag.py`
Responsabilidades:
1. Cargar el dataset desde `python_service/datasets/evaluation_dataset.json`.
2. Ejecutar preguntas sobre el pipeline RAG real (`nosql_backend`).
3. Recuperar respuestas y evidencias (incluyendo explícitamente los `contexts` pre-formateados).
4. Construir el dataset requerido por RAGAS.
5. Ejecutar evaluación usando el LLM de HuggingFace.
6. Guardar resultados en MongoDB respetando el esquema validado.

---

## Dependencias

Modificar:
```text
python_service/requirements.txt
```

Agregar:
```text
ragas>=0.2
datasets
requests
pymongo
```

---

# Cambios en `nosql_backend`

## Nuevo Endpoint

### `POST /evaluation/run`
Permite iniciar una evaluación completa.

Flujo:
1. Recibe solicitud desde frontend.
2. Ejecuta `evaluate_rag.py`.
3. Espera finalización.
4. Retorna resumen de resultados.

Ejemplo:
```json
{
  "status": "success",
  "evaluaciones_generadas": 20
}
```

---

## Nuevo Endpoint

### `GET /evaluation/results`
Obtiene resultados históricos almacenados en MongoDB.

Ejemplo:
```json
[
  {
    "fecha_evaluacion": "2026-06-07",
    "faithfulness_promedio": 0.89,
    "answer_relevancy_promedio": 0.92,
    "context_recall_promedio": 0.81
  }
]
```

---

# Cambios en `nosql_frontend`

## Nueva Vista

### Evaluación RAGAS
Pantalla administrativa para:
* ejecutar experimento;
* visualizar estado de ejecución;
* consultar resultados previos.

Elementos sugeridos:

### Botón
```text
Ejecutar Evaluación RAGAS
```
Invoca:
```http
POST /evaluation/run
```

---

### Tabla de Resultados
Columnas:
* Fecha
* Faithfulness
* Answer Relevancy
* Context Recall

---

### Tarjetas Resumen
Mostrar:
* Faithfulness promedio
* Answer Relevancy promedio
* Context Recall promedio

---

# Almacenamiento en MongoDB

Se utilizará la colección existente:
```text
evaluaciones
```

Cada evaluación almacenará:
```json
{
  "id_consulta": ObjectId("..."),
  "metricas": {
    "faithfulness": 0.91,
    "answer_relevancy": 0.88,
    "context_recall": 0.79
  },
  "modelo_evaluado": "meta-llama/Meta-Llama-3-8B-Instruct",
  "fecha_evaluacion": ISODate("...")
}
```
La estructura respeta el esquema de validación ya definido en `mongo_shell_setup.js`.

---

# Implementación de Contextos para RAGAS

Las evidencias recuperadas por el pipeline pueden provenir de:
* canciones;
* chunks;
* artistas;
* álbumes;
* álbumes visuales.

Por esta razón el backend deberá construir y retornar explícitamente un arreglo en la ruta RAG actual:
```json
{
  "respuesta": "...",
  "contexts": [
    "...",
    "...",
    "..."
  ]
}
```
evitando depender de campos específicos como `chunk_texto`. Esto garantiza compatibilidad con RAGAS independientemente del tipo de evidencia recuperada.

---

# Verification Plan

## Automated Tests

### Evaluación Completa
Ejecutar:
```http
POST /evaluation/run
```
Verificar:
* respuesta HTTP 200;
* ejecución exitosa del script;
* generación de documentos en MongoDB.

---

## Dataset
Verificar:
* existencia del archivo `evaluation_dataset.json`;
* mínimo 20 registros válidos.

---

## Manual Verification

### MongoDB
Consultar:
```text
evaluaciones
```
Verificar:
* mínimo 20 documentos;
* métricas válidas;
* fecha de evaluación registrada.

---

### Frontend
Verificar:
* ejecución desde interfaz gráfica;
* visualización de métricas;
* consulta de resultados históricos.

---

# Resultado Esperado

El sistema contará con un módulo completo de evaluación automática del pipeline RAG utilizando RAGAS, integrado con la arquitectura existente del proyecto y alineado con los requisitos académicos establecidos para la nota adicional.
