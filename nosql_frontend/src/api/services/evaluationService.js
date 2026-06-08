import axiosInstance from '@/api/axiosInterceptor';

const API_BASE = '/api/evaluation';

export const evaluationService = {
  /**
   * Inicia una evaluación completa del sistema RAG
   */
  async runEvaluation() {
    try {
      const response = await axiosInstance.post(`${API_BASE}/run`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Obtiene los resultados históricos de evaluaciones
   */
  async getResults() {
    try {
      const response = await axiosInstance.get(`${API_BASE}/results`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Obtiene los detalles de una evaluación específica
   */
  async getEvaluationDetails(evaluationId) {
    try {
      const response = await axiosInstance.get(`${API_BASE}/results/${evaluationId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Obtiene un resumen estadístico de todas las evaluaciones
   */
  async getSummary() {
    try {
      const response = await axiosInstance.get(`${API_BASE}/summary`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};
