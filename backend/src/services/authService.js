const { eq } = require('drizzle-orm');
const { getDatabase } = require('../database/connection');
const { users } = require('../schema/schema');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');

async function registerService({ nama, email, password }) {
  const db = getDatabase();

  // Cek apakah email sudah terdaftar
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    const error = new Error('Email sudah terdaftar');
    error.statusCode = 409;
    throw error;
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Simpan user baru
  const result = await db.insert(users).values({
    nama,
    email,
    password: hashedPassword,
  });

  const newUserId = result[0].insertId;

  return {
    id: newUserId,
    nama,
    email,
  };
}

async function loginService({ email, password }) {
  const db = getDatabase();

  // Cari user berdasarkan email
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (result.length === 0) {
    const error = new Error('Email atau password salah');
    error.statusCode = 401;
    throw error;
  }

  const user = result[0];

  // Verifikasi password
  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    const error = new Error('Email atau password salah');
    error.statusCode = 401;
    throw error;
  }

  // Generate JWT token
  const token = generateToken({ id: user.id, nama: user.nama, email: user.email });

  return {
    token,
    user: {
      id: user.id,
      nama: user.nama,
      email: user.email,
    },
  };
}

async function getProfileService(userId) {
  const db = getDatabase();

  const result = await db
    .select({
      id: users.id,
      nama: users.nama,
      email: users.email,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (result.length === 0) {
    const error = new Error('Pengguna tidak ditemukan');
    error.statusCode = 404;
    throw error;
  }

  return result[0];
}

module.exports = { registerService, loginService, getProfileService };
