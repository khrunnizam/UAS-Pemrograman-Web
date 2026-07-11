import { api } from './api.js';

export const categoryService = {
  /**
   * Ambil semua kategori, opsional filter nama
   * @param {{ search?: string }} params
   */
  getAll: ({ search = '' } = {}) => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return api.get(`/categories${query}`);
  },

  /**
   * Ambil detail kategori berdasarkan ID
   * @param {number} id
   */
  getById: (id) => api.get(`/categories/${id}`),

  /**
   * Tambah kategori baru
   * @param {{ nama: string }} data
   */
  create: (data) => api.post('/categories', data),

  /**
   * Update kategori berdasarkan ID
   * @param {number} id
   * @param {{ nama: string }} data
   */
  update: (id, data) => api.put(`/categories/${id}`, data),

  /**
   * Hapus kategori berdasarkan ID
   * @param {number} id
   */
  delete: (id) => api.delete(`/categories/${id}`),
};
