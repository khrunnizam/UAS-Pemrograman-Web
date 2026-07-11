const express = require('express');
const {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getAllAuthors,
  getAllCategories,
} = require('../controllers/bookController');
const { authMiddleware } = require('../middlewares/auth');

const router = express.Router();

// GET /api/books/meta/authors — Daftar penulis (protected)
router.get('/meta/authors', authMiddleware, getAllAuthors);

// GET /api/books/meta/categories — Daftar kategori (protected)
router.get('/meta/categories', authMiddleware, getAllCategories);

// GET /api/books — Daftar semua buku (protected, opsional: ?search=judul)
router.get('/', authMiddleware, getAllBooks);

// GET /api/books/:id — Detail buku (protected)
router.get('/:id', authMiddleware, getBookById);

// POST /api/books — Tambah buku baru (protected)
router.post('/', authMiddleware, createBook);

// PUT /api/books/:id — Edit buku (protected)
router.put('/:id', authMiddleware, updateBook);

// DELETE /api/books/:id — Hapus buku (protected)
router.delete('/:id', authMiddleware, deleteBook);

module.exports = router;
