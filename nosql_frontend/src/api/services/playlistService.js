import { get, post, del } from '@/api/api';

export const playlistService = {
  getByUser: (userId) => get(`/playlists/usuario/${userId}`),
  getById: (id) => get(`/playlists/${id}`),
  getTopByUser: (userId, limit = 10) => get(`/playlists/usuario/${userId}/top`, { limit }),
  create: (data) => post('/playlists', data),
  addSong: (playlistId, songId) => post(`/playlists/${playlistId}/canciones`, { id_cancion: songId }),
  removeSong: (playlistId, songId) => del(`/playlists/${playlistId}/canciones/${songId}`),
};