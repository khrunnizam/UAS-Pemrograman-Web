<script>
  import { toastStore } from '$lib/stores/toast.js';

  let toasts = $state([]);

  toastStore.subscribe((value) => {
    toasts = value;
  });
</script>

<div class="toast-container" aria-live="polite" aria-atomic="false">
  {#each toasts as toast (toast.id)}
    <div class="toast toast--{toast.type}" role="alert">
      <span class="toast__icon">
        {#if toast.type === 'success'}✅{:else if toast.type === 'error'}❌{:else}ℹ️{/if}
      </span>
      <span class="toast__message">{toast.message}</span>
      <button class="toast__close" onclick={() => toastStore.remove(toast.id)} aria-label="Tutup notifikasi">×</button>
    </div>
  {/each}
</div>

<style>
  .toast-container {
    position: fixed;
    top: 1.5rem;
    right: 1.5rem;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    max-width: 24rem;
    pointer-events: none;
  }

  .toast {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.875rem 1.25rem;
    border-radius: 0.75rem;
    backdrop-filter: blur(12px);
    box-shadow:
      0 8px 32px rgba(0, 0, 0, 0.15),
      0 2px 8px rgba(0, 0, 0, 0.1);
    pointer-events: all;
    animation: toast-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    font-size: 0.9rem;
    font-weight: 500;
    border: 1px solid rgba(255, 255, 255, 0.15);
  }

  .toast--success {
    background: rgba(16, 185, 129, 0.9);
    color: #ffffff;
  }

  .toast--error {
    background: rgba(239, 68, 68, 0.9);
    color: #ffffff;
  }

  .toast--info {
    background: rgba(59, 130, 246, 0.9);
    color: #ffffff;
  }

  .toast__icon {
    font-size: 1rem;
    flex-shrink: 0;
  }

  .toast__message {
    flex: 1;
    line-height: 1.4;
  }

  .toast__close {
    background: none;
    border: none;
    color: inherit;
    font-size: 1.25rem;
    cursor: pointer;
    padding: 0;
    line-height: 1;
    opacity: 0.8;
    transition: opacity 0.15s ease;
    flex-shrink: 0;
  }

  .toast__close:hover {
    opacity: 1;
  }

  @keyframes toast-in {
    from {
      opacity: 0;
      transform: translateX(100%) scale(0.8);
    }
    to {
      opacity: 1;
      transform: translateX(0) scale(1);
    }
  }
</style>
