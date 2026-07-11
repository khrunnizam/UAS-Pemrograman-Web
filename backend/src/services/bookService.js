const { eq, like, and } = require('drizzle-orm');
const { getDatabase } = require('../database/connection');
const { books, authors, categories } = require('../schema/schema');

// Ambil semua buku dengan join penulis & kategori, opsional filter judul
async function getAllBooksService({ search = '' } = {}) {
  const db = getDatabase();

  const query = db
    .select({
      id: books.id,
      judul: books.judul,
      tahun_terbit: books.tahun_terbit,
      stok: books.stok,
      author_id: books.author_id,
      category_id: books.category_id,
      author_nama: authors.nama,
      category_nama: categories.nama,
    })
    .from(books)
    .innerJoin(authors, eq(books.author_id, authors.id))
    .innerJoin(categories, eq(books.category_id, categories.id));

  let result;
  if (search && search.trim()) {
    result = await query.where(like(books.judul, `%${search.trim()}%`));
  } else {
    result = await query;
  }

  return result;
}

// Ambil satu buku berdasarkan ID
async function getBookByIdService(id) {
  const db = getDatabase();

  const result = await db
    .select({
      id: books.id,
      judul: books.judul,
      tahun_terbit: books.tahun_terbit,
      stok: books.stok,
      author_id: books.author_id,
      category_id: books.category_id,
      author_nama: authors.nama,
      category_nama: categories.nama,
    })
    .from(books)
    .innerJoin(authors, eq(books.author_id, authors.id))
    .innerJoin(categories, eq(books.category_id, categories.id))
    .where(eq(books.id, id))
    .limit(1);

  if (result.length === 0) {
    const error = new Error('Buku tidak ditemukan');
    error.statusCode = 404;
    throw error;
  }

  return result[0];
}

// Tambah buku baru
async function createBookService({ judul, tahun_terbit, stok, author_id, category_id }) {
  const db = getDatabase();

  // Pastikan author dan category ada
  const authorExists = await db.select().from(authors).where(eq(authors.id, author_id)).limit(1);
  if (authorExists.length === 0) {
    const error = new Error('Penulis tidak ditemukan');
    error.statusCode = 404;
    throw error;
  }

  const categoryExists = await db.select().from(categories).where(eq(categories.id, category_id)).limit(1);
  if (categoryExists.length === 0) {
    const error = new Error('Kategori tidak ditemukan');
    error.statusCode = 404;
    throw error;
  }

  const result = await db.insert(books).values({
    judul: judul.trim(),
    tahun_terbit: Number(tahun_terbit),
    stok: Number(stok),
    author_id: Number(author_id),
    category_id: Number(category_id),
  });

  const newId = result[0].insertId;
  return await getBookByIdService(newId);
}

// Update buku berdasarkan ID
async function updateBookService(id, { judul, tahun_terbit, stok, author_id, category_id }) {
  const db = getDatabase();

  // Pastikan buku ada
  await getBookByIdService(id);

  // Pastikan author dan category ada jika diberikan
  if (author_id !== undefined) {
    const authorExists = await db.select().from(authors).where(eq(authors.id, author_id)).limit(1);
    if (authorExists.length === 0) {
      const error = new Error('Penulis tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }
  }

  if (category_id !== undefined) {
    const categoryExists = await db.select().from(categories).where(eq(categories.id, category_id)).limit(1);
    if (categoryExists.length === 0) {
      const error = new Error('Kategori tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }
  }

  const updateData = {};
  if (judul !== undefined) updateData.judul = judul.trim();
  if (tahun_terbit !== undefined) updateData.tahun_terbit = Number(tahun_terbit);
  if (stok !== undefined) updateData.stok = Number(stok);
  if (author_id !== undefined) updateData.author_id = Number(author_id);
  if (category_id !== undefined) updateData.category_id = Number(category_id);

  await db.update(books).set(updateData).where(eq(books.id, id));

  return await getBookByIdService(id);
}

// Hapus buku berdasarkan ID
async function deleteBookService(id) {
  const db = getDatabase();

  // Pastikan buku ada
  const book = await getBookByIdService(id);

  await db.delete(books).where(eq(books.id, id));

  return book;
}

// Ambil semua penulis (untuk dropdown form)
async function getAllAuthorsService() {
  const db = getDatabase();
  return await db.select().from(authors);
}

// Ambil semua kategori (untuk dropdown form)
async function getAllCategoriesService() {
  const db = getDatabase();
  return await db.select().from(categories);
}

module.exports = {
  getAllBooksService,
  getBookByIdService,
  createBookService,
  updateBookService,
  deleteBookService,
  getAllAuthorsService,
  getAllCategoriesService,
};
