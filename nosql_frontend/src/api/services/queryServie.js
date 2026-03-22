import { get, post, patch } from '@/api/api';

export const queryService = {
  create: (data) => post('/queries', data),
  getByUser: (userId, limit = 50) => get(`/queries/usuario/${userId}`, { limit }),
  getById: (id) => get(`/queries/${id}`),
  saveLLMResponse: (id, data) => patch(`/queries/${id}/respuesta-llm`, data),
};