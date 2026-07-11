const { eq, like } = require('drizzle-orm');
const { getDatabase } = require('../database/connection');
const { authors, books } = require('../schema/schema');

// Ambil semua penulis, opsional filter nama
async function getAllAuthorsService({ search = '' } = {}) {
  const db = getDatabase();

  const query = db.select().from(authors);

  let result;
  if (search && search.trim()) {
    result = await query.where(like(authors.nama, `%${search.trim()}%`));
  } else {
    result = await query;
  }

  return result;
}

// Ambil satu penulis berdasarkan ID
async function getAuthorByIdService(id) {
  const db = getDatabase();

  const result = await db
    .select()
    .from(authors)
    .where(eq(authors.id, id))
    .limit(1);

  if (result.length === 0) {
    const error = new Error('Penulis tidak ditemukan');
    error.statusCode = 404;
    throw error;
  }

  return result[0];
}

// Tambah penulis baru
async function createAuthorService({ nama }) {
  const db = getDatabase();

  // Cek duplikat nama (case-insensitive)
  const existing = await db
    .select()
    .from(authors)
    .where(like(authors.nama, nama.trim()))
    .limit(1);

  if (existing.length > 0) {
    const error = new Error('Penulis dengan nama tersebut sudah ada');
    error.statusCode = 409;
    throw error;
  }

  const result = await db.insert(authors).values({ nama: nama.trim() });
  const newId = result[0].insertId;
  return await getAuthorByIdService(newId);
}

// Update penulis berdasarkan ID
async function updateAuthorService(id, { nama }) {
  const db = getDatabase();

  // Pastikan penulis ada
  await getAuthorByIdService(id);

  await db.update(authors).set({ nama: nama.trim() }).where(eq(authors.id, id));

  return await getAuthorByIdService(id);
}

// Hapus penulis berdasarkan ID
async function deleteAuthorService(id) {
  const db = getDatabase();

  // Pastikan penulis ada
  const author = await getAuthorByIdService(id);

  // Cek apakah ada buku yang menggunakan penulis ini
  const usedByBooks = await db
    .select()
    .from(books)
    .where(eq(books.author_id, id))
    .limit(1);

  if (usedByBooks.length > 0) {
    const error = new Error('Penulis tidak bisa dihapus karena masih digunakan oleh buku');
    error.statusCode = 409;
    throw error;
  }

  await db.delete(authors).where(eq(authors.id, id));

  return author;
}

module.exports = {
  getAllAuthorsService,
  getAuthorByIdService,
  createAuthorService,
  updateAuthorService,
  deleteAuthorService,
};
