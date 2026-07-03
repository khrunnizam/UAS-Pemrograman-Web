import { writable } from 'svelte/store';

function createThemeStore() {
  const { subscribe, set } = writable('light');

  return {
    subscribe,
    initialize: () => {
      if (typeof window !== 'undefined') {
        const savedTheme = localStorage.getItem('theme') || 'light';
        set(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
      }
    },
    toggle: () => {
      let currentTheme;
      subscribe((value) => (currentTheme = value))();
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      set(newTheme);
      localStorage.setItem('theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
    },
  };
}

export const themeStore = createThemeStore();
