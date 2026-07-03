<script>
  import { authService } from '$lib/services/authService.js';
  import { authStore } from '$lib/stores/auth.js';
  import { toastStore } from '$lib/stores/toast.js';
  import { goto } from '$app/navigation';

  let email = $state('');
  let password = $state('');
  let showPassword = $state(false);
  let isLoading = $state(false);
  let errors = $state({ email: '', password: '', general: '' });

  function validateForm() {
    errors = { email: '', password: '', general: '' };
    let valid = true;

    if (!email.trim()) {
      errors.email = 'Email wajib diisi';
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Format email tidak valid';
      valid = false;
    }

    if (!password) {
      errors.password = 'Password wajib diisi';
      valid = false;
    }

    return valid;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validateForm()) return;

    isLoading = true;
    errors.general = '';

    try {
      const response = await authService.login({ email: email.toLowerCase().trim(), password });
      authStore.login(response.data.user, response.data.token);
      toastStore.success(`Selamat datang, ${response.data.user.nama}! 🎉`);
      goto('/');
    } catch (err) {
      errors.general = err.message || 'Login gagal. Coba lagi.';
      toastStore.error(errors.general);
    } finally {
      isLoading = false;
    }
  }
</script>

<svelte:head>
  <title>Login – Perpustakaan Umum Daerah</title>
  <meta name="description" content="Masuk ke akun Perpustakaan Umum Daerah Anda untuk mengakses layanan perpustakaan digital." />
</svelte:head>

<div class="auth-page">
  <!-- Decorative background -->
  <div class="auth-page__bg" aria-hidden="true">
    <div class="bg-orb bg-orb--1"></div>
    <div class="bg-orb bg-orb--2"></div>
    <div class="bg-orb bg-orb--3"></div>
  </div>

  <div class="auth-card">
    <!-- Header -->
    <div class="auth-card__header">
      <div class="auth-card__icon" aria-hidden="true">📚</div>
      <h1 class="auth-card__title">Masuk ke Akun</h1>
      <p class="auth-card__subtitle">Perpustakaan Umum Daerah</p>
    </div>

    <!-- Form -->
    <form class="auth-form" onsubmit={handleSubmit} novalidate id="login-form">
      {#if errors.general}
        <div class="auth-form__alert auth-form__alert--error" role="alert">
          <span>⚠️</span>
          <span>{errors.general}</span>
        </div>
      {/if}

      <!-- Email Field -->
      <div class="form-group">
        <label for="login-email" class="form-label">Alamat Email</label>
        <div class="form-input-wrapper">
          <span class="form-input-icon" aria-hidden="true">✉️</span>
          <input
            id="login-email"
            type="email"
            class="form-input"
            class:form-input--error={errors.email}
            placeholder="nama@email.com"
            bind:value={email}
            autocomplete="email"
            required
          />
        </div>
        {#if errors.email}
          <span class="form-error" role="alert">{errors.email}</span>
        {/if}
      </div>

      <!-- Password Field -->
      <div class="form-group">
        <label for="login-password" class="form-label">Password</label>
        <div class="form-input-wrapper">
          <span class="form-input-icon" aria-hidden="true">🔒</span>
          <input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            class="form-input"
            class:form-input--error={errors.password}
            placeholder="Masukkan password Anda"
            bind:value={password}
            autocomplete="current-password"
            required
          />
          <button
            type="button"
            class="form-input-toggle"
            onclick={() => (showPassword = !showPassword)}
            aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>
        {#if errors.password}
          <span class="form-error" role="alert">{errors.password}</span>
        {/if}
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        id="login-submit-btn"
        class="auth-form__submit"
        disabled={isLoading}
      >
        {#if isLoading}
          <span class="btn-spinner" aria-hidden="true"></span>
          <span>Memproses...</span>
        {:else}
          <span>Masuk</span>
          <span aria-hidden="true">→</span>
        {/if}
      </button>
    </form>

    <!-- Footer -->
    <div class="auth-card__footer">
      <p>Belum punya akun? <a href="/register" class="auth-link" id="goto-register">Daftar sekarang</a></p>
    </div>
  </div>
</div>

<style>
  .auth-page {
    min-height: calc(100vh - 4rem);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem;
    position: relative;
    overflow: hidden;
  }

  /* Decorative background orbs */
  .auth-page__bg {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .bg-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.12;
  }

  .bg-orb--1 {
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, #818cf8, transparent);
    top: -200px;
    left: -200px;
  }

  .bg-orb--2 {
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, #c084fc, transparent);
    bottom: -150px;
    right: -150px;
  }

  .bg-orb--3 {
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, #06b6d4, transparent);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  /* Auth Card */
  .auth-card {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 440px;
    background: rgba(30, 41, 59, 0.8);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 1.5rem;
    padding: 2.5rem;
    box-shadow:
      0 25px 50px rgba(0, 0, 0, 0.4),
      0 0 0 1px rgba(255, 255, 255, 0.05) inset;
    animation: card-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes card-in {
    from {
      opacity: 0;
      transform: translateY(24px) scale(0.96);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  /* Auth Card Header */
  .auth-card__header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .auth-card__icon {
    font-size: 3rem;
    margin-bottom: 0.75rem;
    display: block;
    filter: drop-shadow(0 4px 12px rgba(129, 140, 248, 0.4));
    animation: float 3s ease-in-out infinite;
  }

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-6px); }
  }

  .auth-card__title {
    font-size: 1.75rem;
    font-weight: 800;
    color: #f1f5f9;
    margin-bottom: 0.25rem;
    background: linear-gradient(135deg, #f1f5f9, #94a3b8);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .auth-card__subtitle {
    color: #64748b;
    font-size: 0.9rem;
  }

  /* Auth Form */
  .auth-form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .auth-form__alert {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.875rem 1rem;
    border-radius: 0.75rem;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .auth-form__alert--error {
    background: rgba(239, 68, 68, 0.12);
    border: 1px solid rgba(239, 68, 68, 0.25);
    color: #fca5a5;
  }

  /* Form Group */
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .form-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: #94a3b8;
    letter-spacing: 0.02em;
  }

  .form-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .form-input-icon {
    position: absolute;
    left: 0.875rem;
    font-size: 1rem;
    pointer-events: none;
    z-index: 1;
  }

  .form-input {
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 2.75rem;
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 0.75rem;
    color: #f1f5f9;
    font-size: 0.95rem;
    transition: all 0.2s ease;
    outline: none;
  }

  .form-input::placeholder {
    color: #475569;
  }

  .form-input:focus {
    border-color: #818cf8;
    background: rgba(15, 23, 42, 0.8);
    box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.15);
  }

  .form-input--error {
    border-color: rgba(239, 68, 68, 0.5);
  }

  .form-input--error:focus {
    border-color: #ef4444;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
  }

  .form-input-toggle {
    position: absolute;
    right: 0.875rem;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1rem;
    color: #64748b;
    transition: color 0.15s ease;
    padding: 0;
    line-height: 1;
  }

  .form-input-toggle:hover {
    color: #94a3b8;
  }

  .form-error {
    font-size: 0.8rem;
    color: #fca5a5;
    padding-left: 0.25rem;
  }

  /* Submit Button */
  .auth-form__submit {
    width: 100%;
    padding: 0.875rem 1.5rem;
    background: linear-gradient(135deg, #818cf8, #c084fc);
    border: none;
    border-radius: 0.75rem;
    color: white;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: all 0.2s ease;
    margin-top: 0.5rem;
    position: relative;
    overflow: hidden;
  }

  .auth-form__submit::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .auth-form__submit:hover:not(:disabled)::before {
    opacity: 1;
  }

  .auth-form__submit:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(129, 140, 248, 0.4);
  }

  .auth-form__submit:active:not(:disabled) {
    transform: translateY(0);
  }

  .auth-form__submit:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }

  .btn-spinner {
    width: 1rem;
    height: 1rem;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* Auth Card Footer */
  .auth-card__footer {
    text-align: center;
    margin-top: 1.5rem;
    color: #64748b;
    font-size: 0.875rem;
  }

  .auth-link {
    color: #818cf8;
    text-decoration: none;
    font-weight: 600;
    transition: color 0.15s ease;
  }

  .auth-link:hover {
    color: #c084fc;
    text-decoration: underline;
  }
</style>
