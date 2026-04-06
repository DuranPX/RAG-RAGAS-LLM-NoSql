import { get, post } from '@/api/api';

export const eventService = {
  register: (data) => post('/eventos', data),
  getByUser: (userId, limit = 50, dias = 30) => get(`/eventos/usuario/${userId}`, { limit, dias }),
  getEmotionsBySong: (songId) => get(`/eventos/cancion/${songId}/emociones`),
};