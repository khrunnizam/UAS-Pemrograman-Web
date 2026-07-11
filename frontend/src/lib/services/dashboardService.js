import { api } from './api.js';

export const dashboardService = {
  /**
   * Ambil statistik dashboard (total buku, penulis, kategori)
   */
  getStats: () => api.get('/dashboard/stats'),
};
