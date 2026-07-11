<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { bookService } from '$lib/services/bookService.js';
  import { authStore } from '$lib/stores/auth.js';
  import { toastStore } from '$lib/stores/toast.js';

  // Auth guard
  let auth = $state({ user: null, token: null, isAuthenticated: false });
  authStore.subscribe((value) => {
    auth = value;
  });

  // State utama
  let books = $state([]);
  let authors = $state([]);
  let categories = $state([]);
  let isLoading = $state(true);
  let searchQuery = $state('');
  let searchTimeout = null;

  // Modal state
  let showModal = $state(false);
  let isEditMode = $state(false);
  let isSubmitting = $state(false);
  let showDeleteConfirm = $state(false);
  let bookToDelete = $state(null);

  // Form state
  let form = $state({
    id: null,
    judul: '',
    tahun_terbit: '',
    stok: '',
    author_id: '',
    category_id: '',
  });
  let formErrors = $state({});

  // State untuk detail modal
  let showDetail = $state(false);
  let selectedBook = $state(null);

  onMount(async () => {
    if (!auth.isAuthenticated) {
      toastStore.error('Anda harus login untuk mengakses halaman ini');
      goto('/login');
      return;
    }
    await fetchData();
  });

  async function fetchData() {
    isLoading = true;
    try {
      const [booksRes, authorsRes, categoriesRes] = await Promise.all([
        bookService.getAll({ search: searchQuery }),
        bookService.getAuthors(),
        bookService.getCategories(),
      ]);
      books = booksRes.data;
      authors = authorsRes.data;
      categories = categoriesRes.data;
    } catch (err) {
      toastStore.error(err.message || 'Gagal memuat data');
    } finally {
      isLoading = false;
    }
  }

  async function fetchBooks() {
    try {
      const res = await bookService.getAll({ search: searchQuery });
      books = res.data;
    } catch (err) {
      toastStore.error(err.message || 'Gagal memuat buku');
    }
  }

  function handleSearchInput() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      fetchBooks();
    }, 400);
  }

  // ─── Modal Form ───────────────────────────────────────────────────────────────

  function openAddModal() {
    isEditMode = false;
    form = { id: null, judul: '', tahun_terbit: '', stok: '', author_id: '', category_id: '' };
    formErrors = {};
    showModal = true;
  }

  function openEditModal(book) {
    isEditMode = true;
    form = {
      id: book.id,
      judul: book.judul,
      tahun_terbit: String(book.tahun_terbit),
      stok: String(book.stok),
      author_id: String(book.author_id),
      category_id: String(book.category_id),
    };
    formErrors = {};
    showModal = true;
  }

  function closeModal() {
    showModal = false;
    formErrors = {};
  }

  function validateForm() {
    const errors = {};
    if (!form.judul.trim()) {
      errors.judul = 'Judul wajib diisi';
    } else if (form.judul.trim().length < 2) {
      errors.judul = 'Judul minimal 2 karakter';
    }

    const tahun = Number(form.tahun_terbit);
    const currentYear = new Date().getFullYear();
    if (!form.tahun_terbit) {
      errors.tahun_terbit = 'Tahun terbit wajib diisi';
    } else if (isNaN(tahun) || tahun < 1000 || tahun > currentYear) {
      errors.tahun_terbit = `Tahun terbit harus antara 1000 dan ${currentYear}`;
    }

    const stok = Number(form.stok);
    if (form.stok === '') {
      errors.stok = 'Stok wajib diisi';
    } else if (isNaN(stok) || stok < 0) {
      errors.stok = 'Stok tidak boleh negatif';
    }

    if (!form.author_id) errors.author_id = 'Penulis wajib dipilih';
    if (!form.category_id) errors.category_id = 'Kategori wajib dipilih';

    formErrors = errors;
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validateForm()) return;

    isSubmitting = true;
    try {
      const payload = {
        judul: form.judul.trim(),
        tahun_terbit: Number(form.tahun_terbit),
        stok: Number(form.stok),
        author_id: Number(form.author_id),
        category_id: Number(form.category_id),
      };

      if (isEditMode) {
        await bookService.update(form.id, payload);
        toastStore.success('Buku berhasil diperbarui ✅');
      } else {
        await bookService.create(payload);
        toastStore.success('Buku berhasil ditambahkan ✅');
      }

      closeModal();
      await fetchBooks();
    } catch (err) {
      toastStore.error(err.message || 'Gagal menyimpan buku');
    } finally {
      isSubmitting = false;
    }
  }

  // ─── Delete ───────────────────────────────────────────────────────────────────

  function openDeleteConfirm(book) {
    bookToDelete = book;
    showDeleteConfirm = true;
  }

  function closeDeleteConfirm() {
    showDeleteConfirm = false;
    bookToDelete = null;
  }

  async function handleDelete() {
    if (!bookToDelete) return;
    isSubmitting = true;
    try {
      await bookService.delete(bookToDelete.id);
      toastStore.success(`Buku "${bookToDelete.judul}" berhasil dihapus`);
      closeDeleteConfirm();
      await fetchBooks();
    } catch (err) {
      toastStore.error(err.message || 'Gagal menghapus buku');
    } finally {
      isSubmitting = false;
    }
  }

  // ─── Detail ───────────────────────────────────────────────────────────────────

  function openDetail(book) {
    selectedBook = book;
    showDetail = true;
  }

  function closeDetail() {
    showDetail = false;
    selectedBook = null;
  }
</script>

<svelte:head>
  <title>Daftar Buku – Perpustakaan Umum Daerah</title>
  <meta name="description" content="Kelola koleksi buku perpustakaan: tambah, edit, hapus, dan cari buku dengan mudah." />
</svelte:head>

<div class="books-page">
  <!-- Background -->
  <div class="page-bg" aria-hidden="true">
    <div class="bg-orb bg-orb--1"></div>
    <div class="bg-orb bg-orb--2"></div>
  </div>

  <div class="page-container">
    <!-- Header -->
    <div class="page-header">
      <div class="page-header__left">
        <div class="page-header__badge">📖 Koleksi Perpustakaan</div>
        <h1 class="page-header__title">Manajemen Buku</h1>
        <p class="page-header__subtitle">Kelola seluruh koleksi buku perpustakaan</p>
      </div>
      <button class="btn btn--primary" id="add-book-btn" onclick={openAddModal}>
        <span>+ Tambah Buku</span>
      </button>
    </div>

    <!-- Nav Tabs -->
    <div class="nav-tabs">
      <a href="/books" class="nav-tab nav-tab--active" id="tab-books">📖 Buku</a>
      <a href="/authors" class="nav-tab" id="tab-authors">✍️ Penulis</a>
      <a href="/categories" class="nav-tab" id="tab-categories">🏷️ Kategori</a>
    </div>

    <!-- Search Bar -->
    <div class="search-bar">
      <span class="search-bar__icon" aria-hidden="true">🔍</span>
      <input
        id="search-book-input"
        type="text"
        class="search-bar__input"
        placeholder="Cari judul buku..."
        bind:value={searchQuery}
        oninput={handleSearchInput}
      />
      {#if searchQuery}
        <button
          class="search-bar__clear"
          onclick={() => { searchQuery = ''; fetchBooks(); }}
          aria-label="Hapus pencarian"
        >×</button>
      {/if}
    </div>

    <!-- Books Table / List -->
    {#if isLoading}
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Memuat data buku...</p>
      </div>
    {:else if books.length === 0}
      <div class="empty-state">
        <div class="empty-state__icon">📚</div>
        <h2 class="empty-state__title">
          {searchQuery ? 'Buku tidak ditemukan' : 'Belum ada buku'}
        </h2>
        <p class="empty-state__desc">
          {searchQuery
            ? `Tidak ada buku dengan judul "${searchQuery}". Coba kata kunci lain.`
            : 'Tambahkan buku pertama ke koleksi perpustakaan.'}
        </p>
        {#if !searchQuery}
          <button class="btn btn--primary" onclick={openAddModal}>+ Tambah Buku Pertama</button>
        {/if}
      </div>
    {:else}
      <div class="books-info">
        <span class="books-info__count">
          {books.length} buku ditemukan {searchQuery ? `untuk "${searchQuery}"` : ''}
        </span>
      </div>

      <div class="books-table-wrapper">
        <table class="books-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Judul</th>
              <th>Penulis</th>
              <th>Kategori</th>
              <th>Tahun</th>
              <th>Stok</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {#each books as book, i (book.id)}
              <tr class="books-table__row">
                <td class="books-table__num">{i + 1}</td>
                <td class="books-table__title">
                  <button
                    class="book-title-btn"
                    onclick={() => openDetail(book)}
                    id="book-detail-btn-{book.id}"
                  >
                    {book.judul}
                  </button>
                </td>
                <td class="books-table__author">
                  <span class="tag tag--author">✍️ {book.author_nama}</span>
                </td>
                <td class="books-table__category">
                  <span class="tag tag--category">🏷️ {book.category_nama}</span>
                </td>
                <td class="books-table__year">{book.tahun_terbit}</td>
                <td class="books-table__stock">
                  <span class="stock-badge" class:stock-badge--low={book.stok <= 2} class:stock-badge--empty={book.stok === 0}>
                    {book.stok}
                  </span>
                </td>
                <td class="books-table__actions">
                  <button
                    class="action-btn action-btn--detail"
                    onclick={() => openDetail(book)}
                    id="detail-btn-{book.id}"
                    title="Lihat Detail"
                    aria-label="Lihat detail buku"
                  >👁️</button>
                  <button
                    class="action-btn action-btn--edit"
                    onclick={() => openEditModal(book)}
                    id="edit-btn-{book.id}"
                    title="Edit Buku"
                    aria-label="Edit buku"
                  >✏️</button>
                  <button
                    class="action-btn action-btn--delete"
                    onclick={() => openDeleteConfirm(book)}
                    id="delete-btn-{book.id}"
                    title="Hapus Buku"
                    aria-label="Hapus buku"
                  >🗑️</button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</div>

<!-- ─── Modal Tambah / Edit Buku ──────────────────────────────────────────────── -->
{#if showModal}
  <div class="modal-overlay" onclick={closeModal} role="dialog" aria-modal="true" aria-label={isEditMode ? 'Edit buku' : 'Tambah buku'}>
    <div class="modal" onclick={(e) => e.stopPropagation()}>
      <div class="modal__header">
        <h2 class="modal__title">{isEditMode ? '✏️ Edit Buku' : '📖 Tambah Buku'}</h2>
        <button class="modal__close" onclick={closeModal} aria-label="Tutup modal">×</button>
      </div>

      <form class="modal__form" id="book-form" onsubmit={handleSubmit} novalidate>
        <!-- Judul -->
        <div class="form-group">
          <label for="book-judul" class="form-label">Judul Buku</label>
          <input
            id="book-judul"
            type="text"
            class="form-input"
            class:form-input--error={formErrors.judul}
            placeholder="Masukkan judul buku"
            bind:value={form.judul}
          />
          {#if formErrors.judul}
            <span class="form-error" role="alert">{formErrors.judul}</span>
          {/if}
        </div>

        <!-- Penulis -->
        <div class="form-group">
          <label for="book-author" class="form-label">Penulis</label>
          <select
            id="book-author"
            class="form-select"
            class:form-input--error={formErrors.author_id}
            bind:value={form.author_id}
          >
            <option value="">-- Pilih Penulis --</option>
            {#each authors as author (author.id)}
              <option value={String(author.id)}>{author.nama}</option>
            {/each}
          </select>
          {#if formErrors.author_id}
            <span class="form-error" role="alert">{formErrors.author_id}</span>
          {/if}
        </div>

        <!-- Kategori -->
        <div class="form-group">
          <label for="book-category" class="form-label">Kategori</label>
          <select
            id="book-category"
            class="form-select"
            class:form-input--error={formErrors.category_id}
            bind:value={form.category_id}
          >
            <option value="">-- Pilih Kategori --</option>
            {#each categories as category (category.id)}
              <option value={String(category.id)}>{category.nama}</option>
            {/each}
          </select>
          {#if formErrors.category_id}
            <span class="form-error" role="alert">{formErrors.category_id}</span>
          {/if}
        </div>

        <!-- Tahun & Stok -->
        <div class="form-row">
          <div class="form-group">
            <label for="book-tahun" class="form-label">Tahun Terbit</label>
            <input
              id="book-tahun"
              type="number"
              class="form-input"
              class:form-input--error={formErrors.tahun_terbit}
              placeholder="contoh: 2020"
              bind:value={form.tahun_terbit}
              min="1000"
              max={new Date().getFullYear()}
            />
            {#if formErrors.tahun_terbit}
              <span class="form-error" role="alert">{formErrors.tahun_terbit}</span>
            {/if}
          </div>

          <div class="form-group">
            <label for="book-stok" class="form-label">Stok</label>
            <input
              id="book-stok"
              type="number"
              class="form-input"
              class:form-input--error={formErrors.stok}
              placeholder="contoh: 5"
              bind:value={form.stok}
              min="0"
            />
            {#if formErrors.stok}
              <span class="form-error" role="alert">{formErrors.stok}</span>
            {/if}
          </div>
        </div>

        <div class="modal__footer">
          <button type="button" class="btn btn--ghost" onclick={closeModal} disabled={isSubmitting}>
            Batal
          </button>
          <button
            type="submit"
            class="btn btn--primary"
            id="book-submit-btn"
            disabled={isSubmitting}
          >
            {#if isSubmitting}
              <span class="btn-spinner" aria-hidden="true"></span>
              <span>Menyimpan...</span>
            {:else}
              <span>{isEditMode ? 'Simpan Perubahan' : 'Tambah Buku'}</span>
            {/if}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<!-- ─── Modal Konfirmasi Hapus ─────────────────────────────────────────────────── -->
{#if showDeleteConfirm && bookToDelete}
  <div class="modal-overlay" role="dialog" aria-modal="true" aria-label="Konfirmasi hapus buku">
    <div class="modal modal--sm">
      <div class="modal__header">
        <h2 class="modal__title">🗑️ Hapus Buku</h2>
        <button class="modal__close" onclick={closeDeleteConfirm} aria-label="Tutup">×</button>
      </div>
      <div class="delete-confirm__body">
        <p>Apakah Anda yakin ingin menghapus buku:</p>
        <p class="delete-confirm__book-title">"{bookToDelete.judul}"</p>
        <p class="delete-confirm__warning">Tindakan ini tidak dapat dibatalkan.</p>
      </div>
      <div class="modal__footer">
        <button class="btn btn--ghost" onclick={closeDeleteConfirm} disabled={isSubmitting}>
          Batal
        </button>
        <button
          class="btn btn--danger"
          id="confirm-delete-btn"
          onclick={handleDelete}
          disabled={isSubmitting}
        >
          {#if isSubmitting}
            <span class="btn-spinner" aria-hidden="true"></span>
            <span>Menghapus...</span>
          {:else}
            <span>Ya, Hapus</span>
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- ─── Modal Detail Buku ─────────────────────────────────────────────────────── -->
{#if showDetail && selectedBook}
  <div class="modal-overlay" onclick={closeDetail} role="dialog" aria-modal="true" aria-label="Detail buku">
    <div class="modal" onclick={(e) => e.stopPropagation()}>
      <div class="modal__header">
        <h2 class="modal__title">📖 Detail Buku</h2>
        <button class="modal__close" onclick={closeDetail} aria-label="Tutup">×</button>
      </div>
      <div class="detail__body">
        <h3 class="detail__title">{selectedBook.judul}</h3>

        <div class="detail__grid">
          <div class="detail__item">
            <span class="detail__label">✍️ Penulis</span>
            <span class="detail__value">{selectedBook.author_nama}</span>
          </div>
          <div class="detail__item">
            <span class="detail__label">🏷️ Kategori</span>
            <span class="detail__value">{selectedBook.category_nama}</span>
          </div>
          <div class="detail__item">
            <span class="detail__label">📅 Tahun Terbit</span>
            <span class="detail__value">{selectedBook.tahun_terbit}</span>
          </div>
          <div class="detail__item">
            <span class="detail__label">📦 Stok</span>
            <span class="detail__value">
              <span class="stock-badge"
                class:stock-badge--low={selectedBook.stok <= 2}
                class:stock-badge--empty={selectedBook.stok === 0}
              >
                {selectedBook.stok} eksemplar
              </span>
            </span>
          </div>
          <div class="detail__item">
            <span class="detail__label">🆔 ID Buku</span>
            <span class="detail__value">#{ selectedBook.id}</span>
          </div>
        </div>
      </div>
      <div class="modal__footer">
        <button class="btn btn--ghost" onclick={closeDetail}>Tutup</button>
        <button
          class="btn btn--primary"
          onclick={() => { closeDetail(); openEditModal(selectedBook); }}
        >
          ✏️ Edit Buku
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .books-page {
    flex: 1;
    position: relative;
    overflow: hidden;
    padding: 2rem 1.5rem 4rem;
  }

  /* Background orbs */
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
    max-width: 1100px;
    margin: 0 auto;
  }

  /* Header */
  .page-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1.5rem;
    margin-bottom: 2rem;
    animation: fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes fade-up {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .page-header__badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.35rem 1rem;
    background: rgba(129, 140, 248, 0.15);
    border: 1px solid rgba(129, 140, 248, 0.3);
    border-radius: 9999px;
    color: #a5b4fc;
    font-size: 0.8rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    margin-bottom: 0.5rem;
  }

  .page-header__title {
    font-size: 2rem;
    font-weight: 800;
    color: #f1f5f9;
    letter-spacing: -0.02em;
    margin-bottom: 0.25rem;
  }

  .page-header__subtitle {
    color: #64748b;
    font-size: 0.95rem;
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
    text-decoration: none;
  }

  .btn--primary {
    background: linear-gradient(135deg, #818cf8, #c084fc);
    color: white;
    box-shadow: 0 4px 16px rgba(129, 140, 248, 0.3);
  }

  .btn--primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(129, 140, 248, 0.45);
  }

  .btn--ghost {
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: #94a3b8;
  }

  .btn--ghost:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
    color: #f1f5f9;
  }

  .btn--danger {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: white;
    box-shadow: 0 4px 16px rgba(239, 68, 68, 0.3);
  }

  .btn--danger:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(239, 68, 68, 0.45);
  }

  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }

  /* Search */
  .search-bar {
    position: relative;
    display: flex;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .search-bar__icon {
    position: absolute;
    left: 1rem;
    font-size: 1rem;
    pointer-events: none;
    z-index: 1;
  }

  .search-bar__input {
    width: 100%;
    max-width: 480px;
    padding: 0.75rem 2.5rem 0.75rem 2.75rem;
    background: rgba(30, 41, 59, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 0.875rem;
    color: #f1f5f9;
    font-size: 0.95rem;
    font-family: inherit;
    outline: none;
    transition: all 0.2s ease;
    backdrop-filter: blur(12px);
  }

  .search-bar__input::placeholder {
    color: #475569;
  }

  .search-bar__input:focus {
    border-color: #818cf8;
    box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.15);
    background: rgba(30, 41, 59, 0.9);
  }

  .search-bar__clear {
    position: absolute;
    left: calc(480px - 2rem);
    background: none;
    border: none;
    color: #64748b;
    font-size: 1.25rem;
    cursor: pointer;
    padding: 0;
    line-height: 1;
    transition: color 0.15s ease;
  }

  .search-bar__clear:hover {
    color: #94a3b8;
  }

  /* Books Info */
  .books-info {
    margin-bottom: 1rem;
  }

  .books-info__count {
    font-size: 0.875rem;
    color: #64748b;
  }

  /* Table */
  .books-table-wrapper {
    overflow-x: auto;
    border-radius: 1.25rem;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(15, 23, 42, 0.4);
    backdrop-filter: blur(12px);
    animation: fade-up 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .books-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
  }

  .books-table thead tr {
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .books-table th {
    padding: 1rem 1.25rem;
    text-align: left;
    font-size: 0.75rem;
    font-weight: 700;
    color: #64748b;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .books-table td {
    padding: 1rem 1.25rem;
    color: #cbd5e1;
    vertical-align: middle;
  }

  .books-table__row {
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    transition: background 0.15s ease;
  }

  .books-table__row:last-child {
    border-bottom: none;
  }

  .books-table__row:hover {
    background: rgba(129, 140, 248, 0.05);
  }

  .books-table__num {
    color: #475569;
    font-size: 0.8rem;
    min-width: 2.5rem;
  }

  .books-table__title {
    min-width: 180px;
  }

  .book-title-btn {
    background: none;
    border: none;
    color: #c7d2fe;
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    text-align: left;
    padding: 0;
    font-family: inherit;
    transition: color 0.15s ease;
    text-decoration: none;
  }

  .book-title-btn:hover {
    color: #818cf8;
    text-decoration: underline;
  }

  .tag {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.625rem;
    border-radius: 9999px;
    font-size: 0.8rem;
    font-weight: 500;
    white-space: nowrap;
  }

  .tag--author {
    background: rgba(129, 140, 248, 0.12);
    color: #a5b4fc;
    border: 1px solid rgba(129, 140, 248, 0.2);
  }

  .tag--category {
    background: rgba(192, 132, 252, 0.12);
    color: #d8b4fe;
    border: 1px solid rgba(192, 132, 252, 0.2);
  }

  .books-table__year {
    color: #94a3b8;
    white-space: nowrap;
  }

  .stock-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 2rem;
    padding: 0.25rem 0.625rem;
    border-radius: 9999px;
    font-size: 0.8rem;
    font-weight: 700;
    background: rgba(16, 185, 129, 0.15);
    color: #6ee7b7;
    border: 1px solid rgba(16, 185, 129, 0.25);
  }

  .stock-badge--low {
    background: rgba(245, 158, 11, 0.15);
    color: #fcd34d;
    border-color: rgba(245, 158, 11, 0.25);
  }

  .stock-badge--empty {
    background: rgba(239, 68, 68, 0.15);
    color: #fca5a5;
    border-color: rgba(239, 68, 68, 0.25);
  }

  .books-table__actions {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    white-space: nowrap;
  }

  .action-btn {
    width: 2rem;
    height: 2rem;
    border-radius: 0.5rem;
    border: none;
    cursor: pointer;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;
    background: rgba(255, 255, 255, 0.06);
  }

  .action-btn:hover {
    transform: translateY(-1px);
  }

  .action-btn--detail:hover {
    background: rgba(129, 140, 248, 0.2);
  }

  .action-btn--edit:hover {
    background: rgba(245, 158, 11, 0.2);
  }

  .action-btn--delete:hover {
    background: rgba(239, 68, 68, 0.2);
  }

  /* States */
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

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 5rem 1rem;
    gap: 0.75rem;
  }

  .empty-state__icon {
    font-size: 4rem;
    filter: grayscale(0.5);
    margin-bottom: 0.5rem;
  }

  .empty-state__title {
    font-size: 1.25rem;
    font-weight: 700;
    color: #f1f5f9;
  }

  .empty-state__desc {
    color: #64748b;
    font-size: 0.9rem;
    max-width: 360px;
    line-height: 1.6;
    margin-bottom: 0.5rem;
  }

  /* ─── Modals ─────────────────────────────────────────────────── */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.65);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    animation: overlay-in 0.2s ease;
  }

  @keyframes overlay-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .modal {
    background: rgba(15, 23, 42, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 1.5rem;
    width: 100%;
    max-width: 520px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5);
    animation: modal-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .modal--sm {
    max-width: 420px;
  }

  @keyframes modal-in {
    from { opacity: 0; transform: scale(0.92) translateY(20px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }

  .modal__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem 1.75rem 0;
  }

  .modal__title {
    font-size: 1.25rem;
    font-weight: 800;
    color: #f1f5f9;
  }

  .modal__close {
    background: none;
    border: none;
    color: #64748b;
    font-size: 1.5rem;
    cursor: pointer;
    line-height: 1;
    padding: 0.25rem;
    transition: color 0.15s ease;
    border-radius: 0.5rem;
  }

  .modal__close:hover {
    color: #f1f5f9;
    background: rgba(255, 255, 255, 0.08);
  }

  .modal__form {
    padding: 1.5rem 1.75rem;
    display: flex;
    flex-direction: column;
    gap: 1.125rem;
  }

  .modal__footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.75rem;
    padding: 1.25rem 1.75rem 1.75rem;
    border-top: 1px solid rgba(255, 255, 255, 0.07);
    margin-top: 0.5rem;
  }

  /* Form elements */
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .form-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: #94a3b8;
  }

  .form-input,
  .form-select {
    width: 100%;
    padding: 0.75rem 1rem;
    background: rgba(30, 41, 59, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 0.75rem;
    color: #f1f5f9;
    font-size: 0.95rem;
    font-family: inherit;
    transition: all 0.2s ease;
    outline: none;
    appearance: none;
  }

  .form-select {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748b' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 1rem center;
    padding-right: 2.5rem;
    cursor: pointer;
  }

  .form-select option {
    background: #1e293b;
    color: #f1f5f9;
  }

  .form-input::placeholder {
    color: #475569;
  }

  .form-input:focus,
  .form-select:focus {
    border-color: #818cf8;
    background: rgba(30, 41, 59, 0.9);
    box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.15);
  }

  .form-input--error {
    border-color: rgba(239, 68, 68, 0.5) !important;
  }

  .form-input--error:focus {
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15) !important;
  }

  .form-error {
    font-size: 0.8rem;
    color: #fca5a5;
  }

  /* Delete Confirm */
  .delete-confirm__body {
    padding: 1.25rem 1.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    color: #94a3b8;
    font-size: 0.95rem;
  }

  .delete-confirm__book-title {
    color: #f1f5f9;
    font-weight: 700;
    font-size: 1rem;
  }

  .delete-confirm__warning {
    color: #fca5a5;
    font-size: 0.85rem;
    margin-top: 0.25rem;
  }

  /* Detail */
  .detail__body {
    padding: 1.25rem 1.75rem;
  }

  .detail__title {
    font-size: 1.25rem;
    font-weight: 800;
    color: #f1f5f9;
    margin-bottom: 1.5rem;
    line-height: 1.3;
  }

  .detail__grid {
    display: flex;
    flex-direction: column;
    gap: 0.875rem;
  }

  .detail__item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem 1rem;
    background: rgba(30, 41, 59, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 0.75rem;
  }

  .detail__label {
    font-size: 0.85rem;
    color: #64748b;
    font-weight: 500;
    min-width: 110px;
  }

  .detail__value {
    font-size: 0.95rem;
    color: #e2e8f0;
    font-weight: 600;
  }

  /* Spinner in button */
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
