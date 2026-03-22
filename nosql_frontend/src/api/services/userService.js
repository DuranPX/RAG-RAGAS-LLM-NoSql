import { get, post, patch } from '@/api/api';

export const userService = {
  getAll: () => get('/usuarios'),
  getById: (id) => get(`/usuarios/${id}`),
  create: (data) => post('/usuarios', data),
  incrementListenTime: (id, minutos) => patch(`/usuarios/${id}/tiempo-escucha`, { minutos }),
  getDominantEmotions: (id, dias = 365) => get(`/usuarios/${id}/emociones-dominantes`, { dias }),
  getTopArtists: (id, limit = 10) => get(`/usuarios/${id}/top-artistas`, { limit }),
};