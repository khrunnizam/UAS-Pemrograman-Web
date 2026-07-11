<script>
  import { authStore } from '$lib/stores/auth.js';

  let auth = $state({ user: null, token: null, isAuthenticated: false });

  authStore.subscribe((value) => {
    auth = value;
  });
</script>

<svelte:head>
  <title>Perpustakaan Umum Daerah</title>
  <meta name="description" content="Sistem informasi Perpustakaan Umum Daerah — kelola koleksi buku, penulis, dan kategori dengan mudah." />
</svelte:head>

<div class="home">
  <!-- Hero Section -->
  <section class="hero">
    <div class="hero__bg" aria-hidden="true">
      <div class="bg-orb bg-orb--1"></div>
      <div class="bg-orb bg-orb--2"></div>
    </div>

    <div class="hero__content">
      <div class="hero__badge">📚 Sistem Informasi Perpustakaan</div>

      <h1 class="hero__title">
        Perpustakaan Umum
        <span class="hero__title-accent">Daerah</span>
      </h1>

      <p class="hero__description">
        Platform digital untuk mengelola koleksi buku, penulis, dan kategori
        perpustakaan dengan mudah dan efisien.
      </p>

      <div class="hero__actions">
        {#if auth.isAuthenticated}
          <div class="hero__welcome">
            <div class="hero__welcome-avatar">
              {auth.user?.nama?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <p class="hero__welcome-text">Selamat datang kembali,</p>
              <p class="hero__welcome-name">{auth.user?.nama}</p>
            </div>
          </div>
          <a href="/profile" class="btn btn--primary" id="goto-profile">
            Lihat Profil →
          </a>
        {:else}
          <a href="/register" class="btn btn--primary" id="hero-register-btn">
            Mulai Sekarang ✨
          </a>
          <a href="/login" class="btn btn--ghost" id="hero-login-btn">
            Sudah punya akun?
          </a>
        {/if}
      </div>
    </div>
  </section>

  <!-- Features Section -->
  <section class="features">
    <div class="features__container">
      <h2 class="features__title">Fitur Unggulan</h2>
      <p class="features__subtitle">Semua yang Anda butuhkan dalam satu platform</p>

      <div class="features__grid">
        <div class="feature-card" id="feature-auth">
          <div class="feature-card__icon">🔐</div>
          <h3 class="feature-card__title">Autentikasi Aman</h3>
          <p class="feature-card__desc">
            Sistem login dan registrasi dengan enkripsi bcrypt dan JWT token untuk keamanan data Anda.
          </p>
        </div>

        <div class="feature-card" id="feature-books">
          {#if auth.isAuthenticated}
            <a href="/books" class="feature-card__link" aria-label="Pergi ke manajemen buku">
              <div class="feature-card__icon">📖</div>
              <h3 class="feature-card__title">Manajemen Buku</h3>
              <p class="feature-card__desc">
                Kelola koleksi buku perpustakaan dengan data judul, tahun terbit, stok, penulis, dan kategori.
              </p>
            </a>
          {:else}
            <div class="feature-card__icon">📖</div>
            <h3 class="feature-card__title">Manajemen Buku</h3>
            <p class="feature-card__desc">
              Kelola koleksi buku perpustakaan dengan data judul, tahun terbit, stok, penulis, dan kategori.
            </p>
          {/if}
        </div>

        <div class="feature-card" id="feature-authors">
          <div class="feature-card__icon">✍️</div>
          <h3 class="feature-card__title">Data Penulis</h3>
          <p class="feature-card__desc">
            Simpan dan kelola informasi lengkap para penulis koleksi perpustakaan.
          </p>
        </div>

        <div class="feature-card" id="feature-categories">
          <div class="feature-card__icon">🏷️</div>
          <h3 class="feature-card__title">Kategori Buku</h3>
          <p class="feature-card__desc">
            Organisasi koleksi buku berdasarkan kategori untuk pencarian yang lebih mudah.
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- Tech Stack Section -->
  <section class="tech-stack">
    <div class="tech-stack__container">
      <p class="tech-stack__label">Dibangun dengan teknologi modern</p>
      <div class="tech-stack__items">
        <div class="tech-item">
          <span class="tech-item__icon">⚡</span>
          <span>SvelteKit</span>
        </div>
        <div class="tech-item">
          <span class="tech-item__icon">🚀</span>
          <span>Express.js</span>
        </div>
        <div class="tech-item">
          <span class="tech-item__icon">🗄️</span>
          <span>MariaDB</span>
        </div>
        <div class="tech-item">
          <span class="tech-item__icon">🔑</span>
          <span>JWT + bcrypt</span>
        </div>
        <div class="tech-item">
          <span class="tech-item__icon">🛠️</span>
          <span>Drizzle ORM</span>
        </div>
      </div>
    </div>
  </section>
</div>

<style>
  .home {
    flex: 1;
  }

  /* Hero Section */
  .hero {
    position: relative;
    overflow: hidden;
    padding: 6rem 1.5rem;
    text-align: center;
    min-height: 70vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .hero__bg {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .bg-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(100px);
    opacity: 0.15;
  }

  .bg-orb--1 {
    width: 700px;
    height: 700px;
    background: radial-gradient(circle, #818cf8, transparent);
    top: -300px;
    left: -200px;
  }

  .bg-orb--2 {
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, #c084fc, transparent);
    bottom: -200px;
    right: -100px;
  }

  .hero__content {
    position: relative;
    z-index: 1;
    max-width: 700px;
    margin: 0 auto;
    animation: fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes fade-up {
    from {
      opacity: 0;
      transform: translateY(32px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .hero__badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1.25rem;
    background: rgba(129, 140, 248, 0.15);
    border: 1px solid rgba(129, 140, 248, 0.3);
    border-radius: 9999px;
    color: #a5b4fc;
    font-size: 0.875rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .hero__title {
    font-size: clamp(2.5rem, 6vw, 4.5rem);
    font-weight: 800;
    line-height: 1.1;
    color: #f1f5f9;
    margin-bottom: 1.25rem;
    letter-spacing: -0.02em;
  }

  .hero__title-accent {
    background: linear-gradient(135deg, #818cf8, #c084fc, #06b6d4);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .hero__description {
    font-size: 1.15rem;
    color: #94a3b8;
    line-height: 1.7;
    max-width: 560px;
    margin: 0 auto 2.5rem;
  }

  .hero__actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 1rem;
  }

  .hero__welcome {
    display: flex;
    align-items: center;
    gap: 0.875rem;
    background: rgba(30, 41, 59, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 0.75rem 1.25rem;
    border-radius: 1rem;
    backdrop-filter: blur(12px);
    text-align: left;
  }

  .hero__welcome-avatar {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    background: linear-gradient(135deg, #818cf8, #c084fc);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 1rem;
    color: white;
    flex-shrink: 0;
  }

  .hero__welcome-text {
    font-size: 0.8rem;
    color: #64748b;
  }

  .hero__welcome-name {
    font-size: 1rem;
    font-weight: 700;
    color: #f1f5f9;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.875rem 2rem;
    border-radius: 0.875rem;
    font-size: 1rem;
    font-weight: 700;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
  }

  .btn--primary {
    background: linear-gradient(135deg, #818cf8, #c084fc);
    color: white;
    box-shadow: 0 4px 20px rgba(129, 140, 248, 0.3);
  }

  .btn--primary:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 32px rgba(129, 140, 248, 0.45);
  }

  .btn--ghost {
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: #94a3b8;
  }

  .btn--ghost:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #f1f5f9;
    transform: translateY(-2px);
  }

  /* Features Section */
  .features {
    padding: 5rem 1.5rem;
    background: rgba(15, 23, 42, 0.5);
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  .features__container {
    max-width: 1100px;
    margin: 0 auto;
  }

  .features__title {
    text-align: center;
    font-size: 2rem;
    font-weight: 800;
    color: #f1f5f9;
    margin-bottom: 0.5rem;
  }

  .features__subtitle {
    text-align: center;
    color: #64748b;
    margin-bottom: 3rem;
    font-size: 1rem;
  }

  .features__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1.5rem;
  }

  .feature-card {
    background: rgba(30, 41, 59, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 1.25rem;
    padding: 2rem;
    transition: all 0.3s ease;
    cursor: default;
  }

  .feature-card:hover {
    transform: translateY(-4px);
    border-color: rgba(129, 140, 248, 0.3);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
    background: rgba(30, 41, 59, 0.8);
  }

  .feature-card__link {
    display: block;
    text-decoration: none;
    color: inherit;
  }

  .feature-card__icon {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    display: block;
  }

  .feature-card__title {
    font-size: 1.125rem;
    font-weight: 700;
    color: #f1f5f9;
    margin-bottom: 0.625rem;
  }

  .feature-card__desc {
    font-size: 0.9rem;
    color: #64748b;
    line-height: 1.6;
  }

  /* Tech Stack Section */
  .tech-stack {
    padding: 3rem 1.5rem;
    text-align: center;
  }

  .tech-stack__container {
    max-width: 900px;
    margin: 0 auto;
  }

  .tech-stack__label {
    color: #475569;
    font-size: 0.875rem;
    font-weight: 500;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    margin-bottom: 1.25rem;
  }

  .tech-stack__items {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.75rem;
  }

  .tech-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: rgba(30, 41, 59, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 0.625rem;
    color: #94a3b8;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .tech-item:hover {
    border-color: rgba(129, 140, 248, 0.3);
    color: #c7d2fe;
    transform: translateY(-2px);
  }

  .tech-item__icon {
    font-size: 1rem;
  }
</style>
