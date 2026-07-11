const { count } = require('drizzle-orm');
const { getDatabase } = require('../database/connection');
const { books, authors, categories } = require('../schema/schema');

// GET /api/dashboard/stats — Statistik ringkas
async function getDashboardStats(req, res, next) {
  try {
    const db = getDatabase();

    const [totalBuku] = await db.select({ count: count() }).from(books);
    const [totalPenulis] = await db.select({ count: count() }).from(authors);
    const [totalKategori] = await db.select({ count: count() }).from(categories);

    return res.status(200).json({
      message: 'Berhasil mengambil statistik dashboard',
      data: {
        totalBuku: totalBuku.count,
        totalPenulis: totalPenulis.count,
        totalKategori: totalKategori.count,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getDashboardStats };
