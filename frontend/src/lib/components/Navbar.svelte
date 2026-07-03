<script>
  import { authStore } from '$lib/stores/auth.js';
  import { toastStore } from '$lib/stores/toast.js';
  import { authService } from '$lib/services/authService.js';
  import { goto } from '$app/navigation';

  let auth = $state({ user: null, token: null, isAuthenticated: false });

  authStore.subscribe((value) => {
    auth = value;
  });

  let isLoading = $state(false);

  async function handleLogout() {
    isLoading = true;
    try {
      if (auth.token) {
        await authService.logout();
      }
    } catch {
      // logout tetap dilanjutkan meski request gagal
    } finally {
      authStore.logout();
      toastStore.success('Logout berhasil. Sampai jumpa!');
      isLoading = false;
      goto('/login');
    }
  }
</script>

<nav class="navbar">
  <div class="navbar__container">
    <a href="/" class="navbar__brand">
      <span class="navbar__brand-icon">📚</span>
      <span class="navbar__brand-text">Perpustakaan Umum</span>
    </a>

    <div class="navbar__actions">
      {#if auth.isAuthenticated}
        <span class="navbar__user">
          <span class="navbar__user-avatar">{auth.user?.nama?.charAt(0)?.toUpperCase() || 'U'}</span>
          <span class="navbar__user-name">{auth.user?.nama || 'Pengguna'}</span>
        </span>
        <button
          class="navbar__btn navbar__btn--logout"
          onclick={handleLogout}
          disabled={isLoading}
        >
          {isLoading ? 'Keluar...' : 'Logout'}
        </button>
      {:else}
        <a href="/login" class="navbar__btn navbar__btn--ghost">Login</a>
        <a href="/register" class="navbar__btn navbar__btn--primary">Daftar</a>
      {/if}
    </div>
  </div>
</nav>

<style>
  .navbar {
    position: sticky;
    top: 0;
    z-index: 100;
    background: rgba(15, 23, 42, 0.85);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    padding: 0 1.5rem;
  }

  .navbar__container {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 4rem;
  }

  .navbar__brand {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    text-decoration: none;
    color: #f1f5f9;
    font-weight: 700;
    font-size: 1.125rem;
    transition: opacity 0.15s ease;
  }

  .navbar__brand:hover {
    opacity: 0.85;
  }

  .navbar__brand-icon {
    font-size: 1.375rem;
  }

  .navbar__brand-text {
    background: linear-gradient(135deg, #818cf8, #c084fc);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .navbar__actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .navbar__user {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #cbd5e1;
    font-size: 0.875rem;
  }

  .navbar__user-avatar {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background: linear-gradient(135deg, #818cf8, #c084fc);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.8rem;
    color: white;
  }

  .navbar__user-name {
    display: none;
  }

  @media (min-width: 480px) {
    .navbar__user-name {
      display: inline;
    }
  }

  .navbar__btn {
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.15s ease;
    border: none;
    display: inline-flex;
    align-items: center;
  }

  .navbar__btn--primary {
    background: linear-gradient(135deg, #818cf8, #c084fc);
    color: white;
  }

  .navbar__btn--primary:hover {
    opacity: 0.9;
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(129, 140, 248, 0.4);
  }

  .navbar__btn--ghost {
    background: transparent;
    color: #94a3b8;
    border: 1px solid rgba(255, 255, 255, 0.12);
  }

  .navbar__btn--ghost:hover {
    background: rgba(255, 255, 255, 0.08);
    color: #f1f5f9;
  }

  .navbar__btn--logout {
    background: rgba(239, 68, 68, 0.15);
    color: #fca5a5;
    border: 1px solid rgba(239, 68, 68, 0.3);
  }

  .navbar__btn--logout:hover:not(:disabled) {
    background: rgba(239, 68, 68, 0.25);
    color: #ef4444;
  }

  .navbar__btn--logout:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
</style>
