import api from '@/api/api';

const API_BASE = '/evaluation';

export const evaluationService = {
  /**
   * Inicia una evaluación completa del sistema RAG
   */
  async runEvaluation() {
    try {
      const response = await api.post(`${API_BASE}/run`);
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
      const response = await api.get(`${API_BASE}/results`);
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
      const response = await api.get(`${API_BASE}/summary`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};
