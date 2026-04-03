import { post } from '@/api/api';

export const searchService = {
  search: (filters) => post('/search', filters),
};