const express = require('express');
const { register, login, logout, getProfile } = require('../controllers/authController');
const { authMiddleware } = require('../middlewares/auth');

const router = express.Router();

// POST /api/auth/register — Daftar akun baru
router.post('/register', register);

// POST /api/auth/login — Masuk ke akun
router.post('/login', login);

// POST /api/auth/logout — Keluar (protected)
router.post('/logout', authMiddleware, logout);

// GET /api/auth/profile — Lihat profil sendiri (protected)
router.get('/profile', authMiddleware, getProfile);

module.exports = router;
