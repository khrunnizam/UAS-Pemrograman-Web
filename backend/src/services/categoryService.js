const { eq, like } = require('drizzle-orm');
const { getDatabase } = require('../database/connection');
const { categories, books } = require('../schema/schema');

// Ambil semua kategori, opsional filter nama
async function getAllCategoriesService({ search = '' } = {}) {
  const db = getDatabase();

  const query = db.select().from(categories);

  let result;
  if (search && search.trim()) {
    result = await query.where(like(categories.nama, `%${search.trim()}%`));
  } else {
    result = await query;
  }

  return result;
}

// Ambil satu kategori berdasarkan ID
async function getCategoryByIdService(id) {
  const db = getDatabase();

  const result = await db
    .select()
    .from(categories)
    .where(eq(categories.id, id))
    .limit(1);

  if (result.length === 0) {
    const error = new Error('Kategori tidak ditemukan');
    error.statusCode = 404;
    throw error;
  }

  return result[0];
}

// Tambah kategori baru
async function createCategoryService({ nama }) {
  const db = getDatabase();

  // Cek duplikat nama
  const existing = await db
    .select()
    .from(categories)
    .where(like(categories.nama, nama.trim()))
    .limit(1);

  if (existing.length > 0) {
    const error = new Error('Kategori dengan nama tersebut sudah ada');
    error.statusCode = 409;
    throw error;
  }

  const result = await db.insert(categories).values({ nama: nama.trim() });
  const newId = result[0].insertId;
  return await getCategoryByIdService(newId);
}

// Update kategori berdasarkan ID
async function updateCategoryService(id, { nama }) {
  const db = getDatabase();

  // Pastikan kategori ada
  await getCategoryByIdService(id);

  await db.update(categories).set({ nama: nama.trim() }).where(eq(categories.id, id));

  return await getCategoryByIdService(id);
}

// Hapus kategori berdasarkan ID
async function deleteCategoryService(id) {
  const db = getDatabase();

  // Pastikan kategori ada
  const category = await getCategoryByIdService(id);

  // Cek apakah ada buku yang menggunakan kategori ini
  const usedByBooks = await db
    .select()
    .from(books)
    .where(eq(books.category_id, id))
    .limit(1);

  if (usedByBooks.length > 0) {
    const error = new Error('Kategori tidak bisa dihapus karena masih digunakan oleh buku');
    error.statusCode = 409;
    throw error;
  }

  await db.delete(categories).where(eq(categories.id, id));

  return category;
}

module.exports = {
  getAllCategoriesService,
  getCategoryByIdService,
  createCategoryService,
  updateCategoryService,
  deleteCategoryService,
};
