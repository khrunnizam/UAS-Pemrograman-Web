import { writable } from 'svelte/store';

function createToastStore() {
  const { subscribe, update } = writable([]);

  let id = 0;

  function addToast(message, type = 'success', duration = 3000) {
    const toastId = ++id;

    update((toasts) => [...toasts, { id: toastId, message, type }]);

    setTimeout(() => {
      removeToast(toastId);
    }, duration);
  }

  function removeToast(toastId) {
    update((toasts) => toasts.filter((t) => t.id !== toastId));
  }

  return {
    subscribe,
    success: (message) => addToast(message, 'success'),
    error: (message) => addToast(message, 'error'),
    info: (message) => addToast(message, 'info'),
    remove: removeToast,
  };
}

export const toastStore = createToastStore();
