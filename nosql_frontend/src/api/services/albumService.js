import { get, post, put, del } from '@/api/api';

export const albumService = {
  getAll: () => get('/albums'),
  getById: (id) => get(`/albums/${id}`),
  create: (data) => post('/albums', data),
  update: (id, data) => put(`/albums/${id}`, data),
  delete: (id) => del(`/albums/${id}`),
};