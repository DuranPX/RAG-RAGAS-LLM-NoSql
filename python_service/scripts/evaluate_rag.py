

import json
import math
import os
import sys
from datetime import datetime
from typing import List, Dict, Any
import logging
from pathlib import Path

import numpy as np
import pymongo
from pymongo import MongoClient
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Cargar variables de entorno
load_dotenv()

# Configuración
MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017')
DB_NAME = os.getenv('DB_NAME', 'spotifyRAG')

# Rutas relativas al script
SCRIPT_DIR = Path(__file__).parent.absolute()
DATASET_PATH = SCRIPT_DIR.parent / 'datasets' / 'evaluation_dataset.json'


def cargar_dataset() -> List[Dict[str, str]]:
    """
    Carga el dataset de evaluación desde el archivo JSON.
    
    Returns:
        List[Dict[str, str]]: Lista de pares (question, ground_truth)
    """
    logger.info(f"Cargando dataset desde: {DATASET_PATH}")
    
    if not DATASET_PATH.exists():
        raise FileNotFoundError(f"Dataset no encontrado en: {DATASET_PATH}")
    
    with open(DATASET_PATH, 'r', encoding='utf-8') as f:
        dataset = json.load(f)
    
    logger.info(f"Dataset cargado: {len(dataset)} ejemplos")
    return dataset


def cargar_consultas_guardadas(dataset: List[Dict[str, str]]) -> Dict[str, Dict[str, Any]]:
    """
    Carga las consultas guardadas en MongoDB para las preguntas del dataset.
    """
    preguntas = [item['question'] for item in dataset]
    client = MongoClient(MONGODB_URI)
    db = client[DB_NAME]
    consultas = db['consultas']

    cursor = consultas.find({
        'texto_pregunta': {'$in': preguntas},
        'respuesta_llm': {'$ne': None}
    }).sort([('fecha', -1)])

    consultas_map: Dict[str, Dict[str, Any]] = {}
    for doc in cursor:
        question = doc.get('texto_pregunta')
        if question and question not in consultas_map:
            consultas_map[question] = doc

    client.close()
    logger.info(f"Consultas guardadas cargadas: {len(consultas_map)}")
    return consultas_map


def normalizar_texto(texto: str) -> str:
    if not texto:
        return ''
    normalized = ''.join(ch.lower() if ch.isalnum() else ' ' for ch in texto)
    return ' '.join(normalized.split())


def extraer_texto_documento(resultado: Dict[str, Any]) -> str:
    parts = []
    tipo = resultado.get('tipo_fuente') or resultado.get('tipo')
    if tipo:
        parts.append(tipo)
    if resultado.get('titulo'):
        parts.append(resultado['titulo'])
    if resultado.get('nombre_artista'):
        parts.append(resultado['nombre_artista'])
    return ' - '.join(parts)


def es_resultado_relevante(ground_truth: str, texto_documento: str) -> bool:
    if not ground_truth or not texto_documento:
        return False

    gt = normalizar_texto(ground_truth)
    doc = normalizar_texto(texto_documento)
    if not gt or not doc:
        return False

    if doc in gt:
        return True

    tokens = [token for token in doc.split() if len(token) >= 4]
    return any(token in gt for token in tokens)


def construir_dataset_desde_mongo(
    dataset: List[Dict[str, str]],
    consultas_map: Dict[str, Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """
    Construye el dataset de evaluación usando las consultas ya guardadas.
    """
    ragas_dataset = []
    missing_questions = []

    for item in dataset:
        question = item['question']
        query_doc = consultas_map.get(question)

        if not query_doc or not query_doc.get('respuesta_llm'):
            missing_questions.append(question)
            continue

        answer_text = query_doc['respuesta_llm'].get('texto')
        retrieved_documents = query_doc.get('resultados', [])
        contexts = [extraer_texto_documento(doc) for doc in retrieved_documents]

        if not answer_text:
            missing_questions.append(question)
            continue

        ragas_dataset.append({
            'question': question,
            'answer': answer_text,
            'contexts': contexts,
            'ground_truth': item['ground_truth'],
            'retrieved': retrieved_documents
        })

    if missing_questions:
        logger.warning(
            f"No se encontraron consultas originales para {len(missing_questions)} preguntas: {missing_questions}"
        )

    logger.info(f"Dataset de evaluación construido desde MongoDB: {len(ragas_dataset)} ejemplos")
    return ragas_dataset


def evaluar_retrieval(ragas_dataset: List[Dict[str, Any]], top_k: int = 5) -> Dict[str, Any]:
    """
    Evalúa retrieval usando los documentos recuperados almacenados en MongoDB.
    """
    total = 0
    hit_rate = 0.0
    mrr = 0.0
    precision_at_k = 0.0
    recall_at_k = 0.0

    for item in ragas_dataset:
        retrieved = item.get('retrieved', [])[:top_k]
        if not retrieved:
            continue

        total += 1
        relevant_positions = []
        for idx, resultado in enumerate(retrieved):
            texto_doc = extraer_texto_documento(resultado)
            if es_resultado_relevante(item['ground_truth'], texto_doc):
                relevant_positions.append(idx + 1)

        if relevant_positions:
            hit_rate += 1.0
            mrr += 1.0 / relevant_positions[0]
            precision_at_k += len(relevant_positions) / len(retrieved)
            recall_at_k += 1.0

    if total == 0:
        return {
            'retrieval_hit_rate': None,
            'retrieval_mrr': None,
            'retrieval_precision_at_k': None,
            'retrieval_recall_at_k': None
        }

    return {
        'retrieval_hit_rate': hit_rate / total,
        'retrieval_mrr': mrr / total,
        'retrieval_precision_at_k': precision_at_k / total,
        'retrieval_recall_at_k': recall_at_k / total
    }


def evaluar_respuesta(ragas_dataset: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Evalúa la calidad de la respuesta usando similitud semántica entre la respuesta y el ground truth.
    """
    answers = [item['answer'] for item in ragas_dataset]
    truths = [item['ground_truth'] for item in ragas_dataset]

    if len(answers) == 0:
        return {'answer_relevancy': None}

    logger.info('Cargando modelo de embeddings para evaluación de respuestas...')
    model = SentenceTransformer('all-MiniLM-L6-v2')
    answer_embeddings = model.encode(answers, convert_to_numpy=True, normalize_embeddings=True)
    truth_embeddings = model.encode(truths, convert_to_numpy=True, normalize_embeddings=True)

    similarities = np.sum(answer_embeddings * truth_embeddings, axis=1)
    average_similarity = float(np.mean(similarities)) if similarities.size > 0 else None

    logger.info(f"Similitud media respuesta-ground_truth: {average_similarity:.4f}")
    return {
        'answer_relevancy': average_similarity
    }


def guardar_resultados_mongodb(
    resultados: Dict[str, Any],
    ragas_dataset: List[Dict[str, Any]]
) -> bool:
    """
    Guarda los resultados en la colección de MongoDB.
    
    Args:
        resultados: Resultados de la evaluación
        ragas_dataset: Dataset evaluado
        
    Returns:
        True si se guardó correctamente, False en caso contrario
    """
    logger.info("Guardando resultados en MongoDB...")
    
    try:
        client = MongoClient(MONGODB_URI)
        db = client[DB_NAME]
        collection = db['evaluaciones_ragas']
        
        # Preparar documento de evaluación
        doc_evaluacion = {
            'fecha_evaluacion': datetime.now(),
            'modelo_evaluado': 'mongo-evaluation-ragas',
            'total_consultas': len(ragas_dataset)
        }
        
        if resultados.get('success'):
            metrics = resultados.get('metrics', {})
            doc_evaluacion['metricas'] = {
                'answer_relevancy': metrics.get('answer_relevancy'),
                'context_precision': None,
                'retrieval_hit_rate': metrics.get('retrieval_hit_rate'),
                'retrieval_mrr': metrics.get('retrieval_mrr'),
                'retrieval_precision_at_k': metrics.get('retrieval_precision_at_k'),
                'retrieval_recall_at_k': metrics.get('retrieval_recall_at_k')
            }
        else:
            doc_evaluacion['error'] = resultados.get('error', 'Error desconocido')
            doc_evaluacion['metricas'] = {
                'answer_relevancy': None,
                'context_precision': None,
                'retrieval_hit_rate': None,
                'retrieval_mrr': None,
                'retrieval_precision_at_k': None,
                'retrieval_recall_at_k': None
            }
        
        # Insertar documento
        result = collection.insert_one(doc_evaluacion)
        logger.info(f"Evaluación guardada con ID: {result.inserted_id}")
        
        # Guardar detalles de cada consulta
        consultas_collection = db['consultas_evaluacion']
        for i, item in enumerate(ragas_dataset):
            doc_consulta = {
                'id_evaluacion': result.inserted_id,
                'indice': i,
                'question': item['question'],
                'ground_truth': item['ground_truth'],
                'answer': item['answer'],
                'contexts': item['contexts'],
                'fecha': datetime.now()
            }
            consultas_collection.insert_one(doc_consulta)
        
        logger.info(f"Se guardaron {len(ragas_dataset)} detalles de consultas")
        client.close()
        
        return True
        
    except Exception as e:
        logger.error(f"Error guardando en MongoDB: {e}")
        return False


def ejecutar_evaluacion_completa() -> Dict[str, Any]:
    """
    Ejecuta el flujo completo de evaluación usando los datos ya guardados en MongoDB.
    
    Returns:
        Resumen de la evaluación
    """
    logger.info("=" * 60)
    logger.info("Iniciando evaluación completa del sistema RAG")
    logger.info("=" * 60)
    
    try:
        # 1. Cargar dataset
        dataset = cargar_dataset()
        
        # 2. Cargar las consultas originales guardadas en MongoDB
        consultas_map = cargar_consultas_guardadas(dataset)
        
        # 3. Construir dataset de evaluación desde MongoDB
        ragas_dataset = construir_dataset_desde_mongo(dataset, consultas_map)
        if len(ragas_dataset) == 0:
            raise ValueError("No se encontraron consultas originales para las preguntas del dataset.")
        
        # 4. Evaluar retrieval y generación usando datos guardados
        retrieval_metrics = evaluar_retrieval(ragas_dataset)
        generation_metrics = evaluar_respuesta(ragas_dataset)
        resultados = {
            'success': True,
            'metrics': {
                'answer_relevancy': generation_metrics.get('answer_relevancy'),
                'context_precision': None,
                **retrieval_metrics
            },
            'total_samples': len(ragas_dataset)
        }
        
        # 5. Guardar en MongoDB
        guardado_exitoso = guardar_resultados_mongodb(resultados, ragas_dataset)
        
        # 6. Resumen
        logger.info("=" * 60)
        logger.info("Evaluación completada")
        logger.info("=" * 60)
        
        resumen = {
            'status': 'success' if resultados.get('success') else 'partial',
            'evaluaciones_generadas': len(ragas_dataset),
            'guardado_exitoso': guardado_exitoso,
            'metricas': resultados.get('metrics'),
            'error': resultados.get('error') if not resultados.get('success') else None
        }
        
        logger.info(json.dumps(resumen, indent=2, ensure_ascii=False))
        
        return resumen
        
    except Exception as e:
        logger.error(f"Error fatal: {e}", exc_info=True)
        return {
            'status': 'error',
            'error': str(e)
        }


if __name__ == '__main__':
    logger.info(f"Sistema de Evaluación RAGAS iniciado")
    logger.info("Evaluación basada en consultas guardadas en MongoDB")
    
    # Ejecutar evaluación
    resultado = ejecutar_evaluacion_completa()
    
    # Salir con código apropiado
    sys.exit(0 if resultado.get('status') in ['success', 'partial'] else 1)
