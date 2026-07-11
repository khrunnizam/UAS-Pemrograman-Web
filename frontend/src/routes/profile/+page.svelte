<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth.js';
  import { toastStore } from '$lib/stores/toast.js';
  import { authService } from '$lib/services/authService.js';

  // Auth guard
  let auth = $state({ user: null, token: null, isAuthenticated: false });
  authStore.subscribe((value) => {
    auth = value;
  });

  let isLoggingOut = $state(false);

  onMount(() => {
    if (!auth.isAuthenticated) {
      toastStore.error('Anda harus login untuk mengakses halaman ini');
      goto('/login');
    }
  });

  async function handleLogout() {
    isLoggingOut = true;
    try {
      if (auth.token) {
        await authService.logout();
      }
    } catch {
      // logout tetap dilanjutkan meski request gagal
    } finally {
      authStore.logout();
      toastStore.success('Logout berhasil. Sampai jumpa! 👋');
      isLoggingOut = false;
      goto('/login');
    }
  }
</script>

<svelte:head>
  <title>Profil Saya – Perpustakaan Umum Daerah</title>
  <meta name="description" content="Halaman profil pengguna sistem Perpustakaan Umum Daerah." />
</svelte:head>

<div class="page">
  <div class="page-bg" aria-hidden="true">
    <div class="bg-orb bg-orb--1"></div>
    <div class="bg-orb bg-orb--2"></div>
  </div>

  <div class="page-container">
    {#if auth.isAuthenticated && auth.user}
      <!-- Profile Card -->
      <div class="profile-card">
        <div class="profile-card__header">
          <div class="profile-avatar">
            {auth.user?.nama?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <div class="profile-badge">👤 Akun Pengguna</div>
            <h1 class="profile-name">{auth.user.nama}</h1>
            <p class="profile-email">{auth.user.email}</p>
          </div>
        </div>

        <div class="profile-divider"></div>

        <div class="profile-info">
          <div class="info-row">
            <span class="info-label">👤 Nama Lengkap</span>
            <span class="info-value">{auth.user.nama}</span>
          </div>
          <div class="info-row">
            <span class="info-label">📧 Alamat Email</span>
            <span class="info-value">{auth.user.email}</span>
          </div>
          <div class="info-row">
            <span class="info-label">🔑 Status Akun</span>
            <span class="info-value">
              <span class="status-badge">✅ Aktif</span>
            </span>
          </div>
        </div>

        <div class="profile-divider"></div>

        <!-- Quick Links -->
        <div class="quick-links">
          <h3 class="quick-links__title">Navigasi Cepat</h3>
          <div class="quick-links__grid">
            <a href="/books" class="quick-link" id="profile-link-books">
              <span class="quick-link__icon">📖</span>
              <span>Manajemen Buku</span>
            </a>
            <a href="/authors" class="quick-link" id="profile-link-authors">
              <span class="quick-link__icon">✍️</span>
              <span>Manajemen Penulis</span>
            </a>
            <a href="/categories" class="quick-link" id="profile-link-categories">
              <span class="quick-link__icon">🏷️</span>
              <span>Manajemen Kategori</span>
            </a>
          </div>
        </div>

        <div class="profile-divider"></div>

        <div class="profile-footer">
          <button
            class="btn btn--danger"
            id="profile-logout-btn"
            onclick={handleLogout}
            disabled={isLoggingOut}
          >
            {#if isLoggingOut}
              <span class="btn-spinner" aria-hidden="true"></span>
              <span>Keluar...</span>
            {:else}
              <span>🚪 Logout</span>
            {/if}
          </button>
        </div>
      </div>
    {:else}
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Memuat profil...</p>
      </div>
    {/if}
  </div>
</div>

<style>
  .page {
    flex: 1;
    position: relative;
    overflow: hidden;
    padding: 3rem 1.5rem 5rem;
    display: flex;
    align-items: flex-start;
    justify-content: center;
  }

  .page-bg {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;
  }

  .bg-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(100px);
    opacity: 0.08;
  }

  .bg-orb--1 {
    width: 700px;
    height: 700px;
    background: radial-gradient(circle, #818cf8, transparent);
    top: -200px;
    left: -200px;
  }

  .bg-orb--2 {
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, #c084fc, transparent);
    bottom: -200px;
    right: -100px;
  }

  .page-container {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 560px;
    animation: fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes fade-up {
    from { opacity: 0; transform: translateY(24px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* Profile Card */
  .profile-card {
    background: rgba(15, 23, 42, 0.75);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 1.75rem;
    overflow: hidden;
    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(20px);
  }

  .profile-card__header {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    padding: 2rem 2rem 1.75rem;
  }

  .profile-avatar {
    width: 5rem;
    height: 5rem;
    border-radius: 50%;
    background: linear-gradient(135deg, #818cf8, #c084fc);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    font-weight: 800;
    color: white;
    flex-shrink: 0;
    box-shadow: 0 8px 24px rgba(129, 140, 248, 0.35);
  }

  .profile-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.25rem 0.75rem;
    background: rgba(129, 140, 248, 0.15);
    border: 1px solid rgba(129, 140, 248, 0.3);
    border-radius: 9999px;
    color: #a5b4fc;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    margin-bottom: 0.375rem;
  }

  .profile-name {
    font-size: 1.625rem;
    font-weight: 800;
    color: #f1f5f9;
    letter-spacing: -0.02em;
    margin-bottom: 0.2rem;
  }

  .profile-email {
    font-size: 0.9rem;
    color: #64748b;
  }

  .profile-divider {
    height: 1px;
    background: rgba(255, 255, 255, 0.07);
    margin: 0;
  }

  /* Info Rows */
  .profile-info {
    padding: 1.5rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.125rem;
  }

  .info-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .info-label {
    font-size: 0.875rem;
    color: #64748b;
    font-weight: 500;
    flex-shrink: 0;
  }

  .info-value {
    font-size: 0.925rem;
    color: #e2e8f0;
    font-weight: 600;
    text-align: right;
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.2rem 0.75rem;
    background: rgba(52, 211, 153, 0.12);
    border: 1px solid rgba(52, 211, 153, 0.25);
    border-radius: 9999px;
    color: #6ee7b7;
    font-size: 0.8rem;
    font-weight: 600;
  }

  /* Quick Links */
  .quick-links {
    padding: 1.5rem 2rem;
  }

  .quick-links__title {
    font-size: 0.8rem;
    font-weight: 700;
    color: #64748b;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 1rem;
  }

  .quick-links__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
  }

  .quick-link {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 1rem 0.5rem;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 1rem;
    text-decoration: none;
    color: #94a3b8;
    font-size: 0.8rem;
    font-weight: 600;
    transition: all 0.2s ease;
    text-align: center;
  }

  .quick-link:hover {
    background: rgba(129, 140, 248, 0.1);
    border-color: rgba(129, 140, 248, 0.3);
    color: #a5b4fc;
    transform: translateY(-2px);
  }

  .quick-link__icon {
    font-size: 1.5rem;
  }

  /* Footer */
  .profile-footer {
    padding: 1.5rem 2rem 2rem;
    display: flex;
    justify-content: flex-end;
  }

  /* Buttons */
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    border-radius: 0.75rem;
    font-size: 0.95rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
    white-space: nowrap;
  }

  .btn--danger {
    background: rgba(239, 68, 68, 0.15);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #fca5a5;
  }

  .btn--danger:hover:not(:disabled) {
    background: rgba(239, 68, 68, 0.25);
    border-color: rgba(239, 68, 68, 0.5);
    color: #ef4444;
    transform: translateY(-1px);
  }

  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }

  /* Loading */
  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 5rem 1rem;
    color: #64748b;
  }

  .spinner {
    width: 2.5rem;
    height: 2.5rem;
    border: 3px solid rgba(129, 140, 248, 0.2);
    border-top-color: #818cf8;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  .btn-spinner {
    width: 1rem;
    height: 1rem;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    flex-shrink: 0;
  }
</style>
