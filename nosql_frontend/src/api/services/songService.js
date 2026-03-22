import { get, post, put, del } from '@/api/api';

export const songService = {
  getAll: () => get('/canciones'),
  getById: (id) => get(`/canciones/${id}`),
  create: (data) => post('/canciones', data),
  update: (id, data) => put(`/canciones/${id}`, data),
  delete: (id) => del(`/canciones/${id}`),
};
