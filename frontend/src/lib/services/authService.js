import { api } from './api.js';

export const authService = {
  /**
   * Register user baru
   * @param {{ nama: string, email: string, password: string }} data
   */
  register: (data) => api.post('/auth/register', data),

  /**
   * Login dengan email & password
   * @param {{ email: string, password: string }} data
   */
  login: (data) => api.post('/auth/login', data),

  /**
   * Logout (membutuhkan token)
   */
  logout: () => api.post('/auth/logout', {}),

  /**
   * Ambil profil user yang sedang login
   */
  getProfile: () => api.get('/auth/profile'),
};
