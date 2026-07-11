import { api } from './api.js';

export const authorService = {
  /**
   * Ambil semua penulis, opsional filter nama
   * @param {{ search?: string }} params
   */
  getAll: ({ search = '' } = {}) => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return api.get(`/authors${query}`);
  },

  /**
   * Ambil detail penulis berdasarkan ID
   * @param {number} id
   */
  getById: (id) => api.get(`/authors/${id}`),

  /**
   * Tambah penulis baru
   * @param {{ nama: string }} data
   */
  create: (data) => api.post('/authors', data),

  /**
   * Update penulis berdasarkan ID
   * @param {number} id
   * @param {{ nama: string }} data
   */
  update: (id, data) => api.put(`/authors/${id}`, data),

  /**
   * Hapus penulis berdasarkan ID
   * @param {number} id
   */
  delete: (id) => api.delete(`/authors/${id}`),
};
