const express = require('express');
const {
  getAllAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor,
} = require('../controllers/authorController');
const { authMiddleware } = require('../middlewares/auth');

const router = express.Router();

// GET /api/authors — Daftar semua penulis (protected, opsional: ?search=nama)
router.get('/', authMiddleware, getAllAuthors);

// GET /api/authors/:id — Detail penulis (protected)
router.get('/:id', authMiddleware, getAuthorById);

// POST /api/authors — Tambah penulis baru (protected)
router.post('/', authMiddleware, createAuthor);

// PUT /api/authors/:id — Edit penulis (protected)
router.put('/:id', authMiddleware, updateAuthor);

// DELETE /api/authors/:id — Hapus penulis (protected)
router.delete('/:id', authMiddleware, deleteAuthor);

module.exports = router;
