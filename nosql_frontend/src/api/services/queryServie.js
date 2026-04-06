import { get, post, patch } from '@/api/api';

export const queryService = {
  create: (data) => post('/consultas', data),
  getByUser: (userId, limit = 50) => get(`/consultas/usuario/${userId}`, { limit }),
  getById: (id) => get(`/consultas/${id}`),
  saveLLMResponse: (id, data) => patch(`/consultas/${id}/respuesta-llm`, data),
};