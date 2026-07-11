<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { authorService } from '$lib/services/authorService.js';
  import { authStore } from '$lib/stores/auth.js';
  import { toastStore } from '$lib/stores/toast.js';

  // Auth guard
  let auth = $state({ user: null, token: null, isAuthenticated: false });
  authStore.subscribe((value) => {
    auth = value;
  });

  // State utama
  let authors = $state([]);
  let isLoading = $state(true);
  let searchQuery = $state('');
  let searchTimeout = null;

  // Modal state
  let showModal = $state(false);
  let isEditMode = $state(false);
  let isSubmitting = $state(false);
  let showDeleteConfirm = $state(false);
  let itemToDelete = $state(null);

  // Form state
  let form = $state({ id: null, nama: '' });
  let formErrors = $state({});

  onMount(async () => {
    if (!auth.isAuthenticated) {
      toastStore.error('Anda harus login untuk mengakses halaman ini');
      goto('/login');
      return;
    }
    await fetchAuthors();
  });

  async function fetchAuthors() {
    isLoading = true;
    try {
      const res = await authorService.getAll({ search: searchQuery });
      authors = res.data;
    } catch (err) {
      toastStore.error(err.message || 'Gagal memuat data penulis');
    } finally {
      isLoading = false;
    }
  }

  function handleSearchInput() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      fetchAuthors();
    }, 400);
  }

  // ─── Modal ────────────────────────────────────────────────────────────────────

  function openAddModal() {
    isEditMode = false;
    form = { id: null, nama: '' };
    formErrors = {};
    showModal = true;
  }

  function openEditModal(author) {
    isEditMode = true;
    form = { id: author.id, nama: author.nama };
    formErrors = {};
    showModal = true;
  }

  function closeModal() {
    showModal = false;
    formErrors = {};
  }

  function validateForm() {
    const errors = {};
    if (!form.nama.trim()) {
      errors.nama = 'Nama penulis wajib diisi';
    } else if (form.nama.trim().length < 2) {
      errors.nama = 'Nama penulis minimal 2 karakter';
    } else if (form.nama.trim().length > 100) {
      errors.nama = 'Nama penulis maksimal 100 karakter';
    }
    formErrors = errors;
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validateForm()) return;

    isSubmitting = true;
    try {
      if (isEditMode) {
        await authorService.update(form.id, { nama: form.nama.trim() });
        toastStore.success('Penulis berhasil diperbarui ✅');
      } else {
        await authorService.create({ nama: form.nama.trim() });
        toastStore.success('Penulis berhasil ditambahkan ✅');
      }
      closeModal();
      await fetchAuthors();
    } catch (err) {
      toastStore.error(err.message || 'Gagal menyimpan penulis');
    } finally {
      isSubmitting = false;
    }
  }

  // ─── Delete ───────────────────────────────────────────────────────────────────

  function openDeleteConfirm(author) {
    itemToDelete = author;
    showDeleteConfirm = true;
  }

  function closeDeleteConfirm() {
    showDeleteConfirm = false;
    itemToDelete = null;
  }

  async function handleDelete() {
    if (!itemToDelete) return;
    isSubmitting = true;
    try {
      await authorService.delete(itemToDelete.id);
      toastStore.success(`Penulis "${itemToDelete.nama}" berhasil dihapus`);
      closeDeleteConfirm();
      await fetchAuthors();
    } catch (err) {
      toastStore.error(err.message || 'Gagal menghapus penulis');
    } finally {
      isSubmitting = false;
    }
  }
</script>

<svelte:head>
  <title>Daftar Penulis – Perpustakaan Umum Daerah</title>
  <meta name="description" content="Kelola data penulis buku perpustakaan: tambah, edit, dan hapus penulis." />
</svelte:head>

<div class="page">
  <div class="page-bg" aria-hidden="true">
    <div class="bg-orb bg-orb--1"></div>
    <div class="bg-orb bg-orb--2"></div>
  </div>

  <div class="page-container">
    <!-- Header -->
    <div class="page-header">
      <div class="page-header__left">
        <div class="page-header__badge">✍️ Data Master</div>
        <h1 class="page-header__title">Manajemen Penulis</h1>
        <p class="page-header__subtitle">Kelola data penulis koleksi perpustakaan</p>
      </div>
      <button class="btn btn--primary" id="add-author-btn" onclick={openAddModal}>
        + Tambah Penulis
      </button>
    </div>

    <!-- Nav Tabs -->
    <div class="nav-tabs">
      <a href="/books" class="nav-tab" id="tab-books">📖 Buku</a>
      <a href="/authors" class="nav-tab nav-tab--active" id="tab-authors">✍️ Penulis</a>
      <a href="/categories" class="nav-tab" id="tab-categories">🏷️ Kategori</a>
    </div>

    <!-- Search -->
    <div class="search-bar">
      <span class="search-bar__icon" aria-hidden="true">🔍</span>
      <input
        id="search-author-input"
        type="text"
        class="search-bar__input"
        placeholder="Cari nama penulis..."
        bind:value={searchQuery}
        oninput={handleSearchInput}
      />
      {#if searchQuery}
        <button
          class="search-bar__clear"
          onclick={() => { searchQuery = ''; fetchAuthors(); }}
          aria-label="Hapus pencarian"
        >×</button>
      {/if}
    </div>

    <!-- Content -->
    {#if isLoading}
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Memuat data penulis...</p>
      </div>
    {:else if authors.length === 0}
      <div class="empty-state">
        <div class="empty-state__icon">✍️</div>
        <h2 class="empty-state__title">
          {searchQuery ? 'Penulis tidak ditemukan' : 'Belum ada penulis'}
        </h2>
        <p class="empty-state__desc">
          {searchQuery
            ? `Tidak ada penulis dengan nama "${searchQuery}".`
            : 'Tambahkan penulis pertama ke sistem perpustakaan.'}
        </p>
        {#if !searchQuery}
          <button class="btn btn--primary" onclick={openAddModal}>+ Tambah Penulis Pertama</button>
        {/if}
      </div>
    {:else}
      <div class="list-info">
        <span class="list-info__count">
          {authors.length} penulis {searchQuery ? `ditemukan untuk "${searchQuery}"` : 'terdaftar'}
        </span>
      </div>

      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>No</th>
              <th>ID</th>
              <th>Nama Penulis</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {#each authors as author, i (author.id)}
              <tr class="data-table__row">
                <td class="data-table__num">{i + 1}</td>
                <td class="data-table__id">
                  <span class="id-badge">#{author.id}</span>
                </td>
                <td class="data-table__name">
                  <span class="name-text">✍️ {author.nama}</span>
                </td>
                <td class="data-table__actions">
                  <button
                    class="action-btn action-btn--edit"
                    onclick={() => openEditModal(author)}
                    id="edit-author-btn-{author.id}"
                    title="Edit Penulis"
                    aria-label="Edit penulis"
                  >✏️</button>
                  <button
                    class="action-btn action-btn--delete"
                    onclick={() => openDeleteConfirm(author)}
                    id="delete-author-btn-{author.id}"
                    title="Hapus Penulis"
                    aria-label="Hapus penulis"
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

<!-- ─── Modal Tambah / Edit Penulis ──────────────────────────────────────── -->
{#if showModal}
  <div class="modal-overlay" onclick={closeModal} role="dialog" aria-modal="true" aria-label={isEditMode ? 'Edit penulis' : 'Tambah penulis'}>
    <div class="modal" onclick={(e) => e.stopPropagation()}>
      <div class="modal__header">
        <h2 class="modal__title">{isEditMode ? '✏️ Edit Penulis' : '✍️ Tambah Penulis'}</h2>
        <button class="modal__close" onclick={closeModal} aria-label="Tutup">×</button>
      </div>

      <form class="modal__form" id="author-form" onsubmit={handleSubmit} novalidate>
        <div class="form-group">
          <label for="author-nama" class="form-label">Nama Penulis</label>
          <input
            id="author-nama"
            type="text"
            class="form-input"
            class:form-input--error={formErrors.nama}
            placeholder="Masukkan nama penulis"
            bind:value={form.nama}
            autofocus
          />
          {#if formErrors.nama}
            <span class="form-error" role="alert">{formErrors.nama}</span>
          {/if}
        </div>

        <div class="modal__footer">
          <button type="button" class="btn btn--ghost" onclick={closeModal} disabled={isSubmitting}>
            Batal
          </button>
          <button
            type="submit"
            class="btn btn--primary"
            id="author-submit-btn"
            disabled={isSubmitting}
          >
            {#if isSubmitting}
              <span class="btn-spinner" aria-hidden="true"></span>
              <span>Menyimpan...</span>
            {:else}
              <span>{isEditMode ? 'Simpan Perubahan' : 'Tambah Penulis'}</span>
            {/if}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<!-- ─── Modal Konfirmasi Hapus ────────────────────────────────────────────── -->
{#if showDeleteConfirm && itemToDelete}
  <div class="modal-overlay" role="dialog" aria-modal="true" aria-label="Konfirmasi hapus penulis">
    <div class="modal modal--sm">
      <div class="modal__header">
        <h2 class="modal__title">🗑️ Hapus Penulis</h2>
        <button class="modal__close" onclick={closeDeleteConfirm} aria-label="Tutup">×</button>
      </div>
      <div class="delete-confirm__body">
        <p>Apakah Anda yakin ingin menghapus penulis:</p>
        <p class="delete-confirm__name">"{itemToDelete.nama}"</p>
        <p class="delete-confirm__warning">
          ⚠️ Penulis tidak dapat dihapus jika masih memiliki buku terdaftar.
        </p>
      </div>
      <div class="modal__footer">
        <button class="btn btn--ghost" onclick={closeDeleteConfirm} disabled={isSubmitting}>
          Batal
        </button>
        <button
          class="btn btn--danger"
          id="confirm-delete-author-btn"
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

<style>
  .page {
    flex: 1;
    position: relative;
    overflow: hidden;
    padding: 2rem 1.5rem 4rem;
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
    background: radial-gradient(circle, #34d399, transparent);
    bottom: -200px;
    right: -100px;
  }

  .page-container {
    position: relative;
    z-index: 1;
    max-width: 900px;
    margin: 0 auto;
  }

  /* Header */
  .page-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
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
    background: rgba(52, 211, 153, 0.12);
    border: 1px solid rgba(52, 211, 153, 0.25);
    border-radius: 9999px;
    color: #6ee7b7;
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

  /* Nav Tabs */
  .nav-tabs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
    padding-bottom: 0;
  }

  .nav-tab {
    padding: 0.625rem 1.25rem;
    border-radius: 0.625rem 0.625rem 0 0;
    font-size: 0.875rem;
    font-weight: 600;
    color: #64748b;
    text-decoration: none;
    transition: all 0.2s ease;
    border: 1px solid transparent;
    border-bottom: none;
    position: relative;
    bottom: -1px;
  }

  .nav-tab:hover {
    color: #94a3b8;
    background: rgba(255, 255, 255, 0.04);
  }

  .nav-tab--active {
    color: #6ee7b7;
    background: rgba(52, 211, 153, 0.08);
    border-color: rgba(52, 211, 153, 0.2);
    border-bottom-color: #0f172a;
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
    background: linear-gradient(135deg, #34d399, #059669);
    color: white;
    box-shadow: 0 4px 16px rgba(52, 211, 153, 0.3);
  }

  .btn--primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(52, 211, 153, 0.45);
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
    max-width: 420px;
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

  .search-bar__input::placeholder { color: #475569; }

  .search-bar__input:focus {
    border-color: #34d399;
    box-shadow: 0 0 0 3px rgba(52, 211, 153, 0.15);
    background: rgba(30, 41, 59, 0.9);
  }

  .search-bar__clear {
    position: absolute;
    left: calc(420px - 2rem);
    background: none;
    border: none;
    color: #64748b;
    font-size: 1.25rem;
    cursor: pointer;
    padding: 0;
    line-height: 1;
    transition: color 0.15s ease;
  }

  .search-bar__clear:hover { color: #94a3b8; }

  /* List info */
  .list-info { margin-bottom: 1rem; }

  .list-info__count {
    font-size: 0.875rem;
    color: #64748b;
  }

  /* Table */
  .table-wrapper {
    overflow-x: auto;
    border-radius: 1.25rem;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(15, 23, 42, 0.4);
    backdrop-filter: blur(12px);
    animation: fade-up 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .data-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
  }

  .data-table thead tr {
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .data-table th {
    padding: 1rem 1.25rem;
    text-align: left;
    font-size: 0.75rem;
    font-weight: 700;
    color: #64748b;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .data-table td {
    padding: 1rem 1.25rem;
    color: #cbd5e1;
    vertical-align: middle;
  }

  .data-table__row {
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    transition: background 0.15s ease;
  }

  .data-table__row:last-child { border-bottom: none; }

  .data-table__row:hover { background: rgba(52, 211, 153, 0.04); }

  .data-table__num {
    color: #475569;
    font-size: 0.8rem;
    min-width: 2.5rem;
  }

  .id-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.2rem 0.625rem;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 9999px;
    font-size: 0.78rem;
    color: #64748b;
    font-weight: 600;
    font-family: monospace;
  }

  .name-text {
    font-weight: 600;
    color: #e2e8f0;
  }

  .data-table__actions {
    display: flex;
    align-items: center;
    gap: 0.375rem;
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

  .action-btn:hover { transform: translateY(-1px); }

  .action-btn--edit:hover { background: rgba(245, 158, 11, 0.2); }
  .action-btn--delete:hover { background: rgba(239, 68, 68, 0.2); }

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
    border: 3px solid rgba(52, 211, 153, 0.2);
    border-top-color: #34d399;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 5rem 1rem;
    gap: 0.75rem;
  }

  .empty-state__icon { font-size: 4rem; margin-bottom: 0.5rem; }
  .empty-state__title { font-size: 1.25rem; font-weight: 700; color: #f1f5f9; }
  .empty-state__desc { color: #64748b; font-size: 0.9rem; max-width: 360px; line-height: 1.6; margin-bottom: 0.5rem; }

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

  @keyframes overlay-in { from { opacity: 0; } to { opacity: 1; } }

  .modal {
    background: rgba(15, 23, 42, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 1.5rem;
    width: 100%;
    max-width: 460px;
    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5);
    animation: modal-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .modal--sm { max-width: 400px; }

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
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .form-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: #94a3b8;
  }

  .form-input {
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
  }

  .form-input::placeholder { color: #475569; }

  .form-input:focus {
    border-color: #34d399;
    background: rgba(30, 41, 59, 0.9);
    box-shadow: 0 0 0 3px rgba(52, 211, 153, 0.15);
  }

  .form-input--error { border-color: rgba(239, 68, 68, 0.5) !important; }
  .form-input--error:focus { box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15) !important; }

  .form-error { font-size: 0.8rem; color: #fca5a5; }

  .delete-confirm__body {
    padding: 1.25rem 1.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    color: #94a3b8;
    font-size: 0.95rem;
  }

  .delete-confirm__name {
    color: #f1f5f9;
    font-weight: 700;
    font-size: 1rem;
  }

  .delete-confirm__warning {
    color: #fcd34d;
    font-size: 0.85rem;
    margin-top: 0.25rem;
  }

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
