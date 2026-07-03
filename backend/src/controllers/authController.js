const { registerService, loginService, getProfileService } = require('../services/authService');

async function register(req, res, next) {
  try {
    const { nama, email, password } = req.body;

    // Validasi input
    if (!nama || !email || !password) {
      return res.status(400).json({ message: 'Nama, email, dan password wajib diisi' });
    }

    if (nama.trim().length < 2) {
      return res.status(400).json({ message: 'Nama minimal 2 karakter' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Format email tidak valid' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password minimal 6 karakter' });
    }

    const user = await registerService({ nama: nama.trim(), email: email.toLowerCase(), password });

    return res.status(201).json({
      message: 'Registrasi berhasil',
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Validasi input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email dan password wajib diisi' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Format email tidak valid' });
    }

    const result = await loginService({ email: email.toLowerCase(), password });

    return res.status(200).json({
      message: 'Login berhasil',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

async function logout(req, res) {
  // JWT adalah stateless — logout cukup dihapus di sisi client
  // Endpoint ini memberi konfirmasi ke client untuk menghapus token
  return res.status(200).json({
    message: 'Logout berhasil',
  });
}

async function getProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const user = await getProfileService(userId);

    return res.status(200).json({
      message: 'Berhasil mengambil data profil',
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { register, login, logout, getProfile };
