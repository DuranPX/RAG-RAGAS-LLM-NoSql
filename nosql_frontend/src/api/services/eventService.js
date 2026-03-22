import { get, post } from '@/api/api';

export const eventService = {
  register: (data) => post('/events', data),
  getByUser: (userId, limit = 50, dias = 30) => get(`/events/usuario/${userId}`, { limit, dias }),
  getEmotionsBySong: (songId) => get(`/events/cancion/${songId}/emociones`),
};