const express = require('express');
const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { authMiddleware } = require('../middlewares/auth');

const router = express.Router();

// GET /api/categories — Daftar semua kategori (protected, opsional: ?search=nama)
router.get('/', authMiddleware, getAllCategories);

// GET /api/categories/:id — Detail kategori (protected)
router.get('/:id', authMiddleware, getCategoryById);

// POST /api/categories — Tambah kategori baru (protected)
router.post('/', authMiddleware, createCategory);

// PUT /api/categories/:id — Edit kategori (protected)
router.put('/:id', authMiddleware, updateCategory);

// DELETE /api/categories/:id — Hapus kategori (protected)
router.delete('/:id', authMiddleware, deleteCategory);

module.exports = router;
