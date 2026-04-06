import { get, post, put, del } from '@/api/api';

export const artistService = {
  getAll: () => get('/artistas'),
  getById: (id) => get(`/artistas/${id}`),
  create: (data) => post('/artistas', data),
  update: (id, data) => put(`/artistas/${id}`, data),
  delete: (id) => del(`/artistas/${id}`),
};