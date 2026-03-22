import { get, post, put, del } from '@/api/api';

export const artistService = {
  getAll: () => get('/artists'),
  getById: (id) => get(`/artists/${id}`),
  create: (data) => post('/artists', data),
  update: (id, data) => put(`/artists/${id}`, data),
  delete: (id) => del(`/artists/${id}`),
};