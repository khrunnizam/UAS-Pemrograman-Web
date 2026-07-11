import { api } from './api.js';

export const bookService = {
  /**
   * Ambil semua buku, opsional filter by judul
   * @param {{ search?: string }} params
   */
  getAll: ({ search = '' } = {}) => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return api.get(`/books${query}`);
  },

  /**
   * Ambil detail buku berdasarkan ID
   * @param {number} id
   */
  getById: (id) => api.get(`/books/${id}`),

  /**
   * Tambah buku baru
   * @param {{ judul: string, tahun_terbit: number, stok: number, author_id: number, category_id: number }} data
   */
  create: (data) => api.post('/books', data),

  /**
   * Update buku berdasarkan ID
   * @param {number} id
   * @param {{ judul?: string, tahun_terbit?: number, stok?: number, author_id?: number, category_id?: number }} data
   */
  update: (id, data) => api.put(`/books/${id}`, data),

  /**
   * Hapus buku berdasarkan ID
   * @param {number} id
   */
  delete: (id) => api.delete(`/books/${id}`),

  /**
   * Ambil daftar semua penulis (untuk dropdown)
   */
  getAuthors: () => api.get('/books/meta/authors'),

  /**
   * Ambil daftar semua kategori (untuk dropdown)
   */
  getCategories: () => api.get('/books/meta/categories'),
};
