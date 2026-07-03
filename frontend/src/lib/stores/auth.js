import { writable } from 'svelte/store';

function createAuthStore() {
  const { subscribe, set } = writable({
    user: null,
    token: null,
    isAuthenticated: false,
  });

  return {
    subscribe,
    login: (user, token) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, token, isAuthenticated: true });
    },
    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ user: null, token: null, isAuthenticated: false });
    },
    initialize: () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        if (token && user) {
          set({ user: JSON.parse(user), token, isAuthenticated: true });
        }
      }
    },
  };
}

export const authStore = createAuthStore();
