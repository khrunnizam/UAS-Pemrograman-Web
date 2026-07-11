const {
  getAllBooksService,
  getBookByIdService,
  createBookService,
  updateBookService,
  deleteBookService,
  getAllAuthorsService,
  getAllCategoriesService,
} = require('../services/bookService');

// GET /api/books — Daftar buku (opsional: ?search=judul)
async function getAllBooks(req, res, next) {
  try {
    const { search } = req.query;
    const data = await getAllBooksService({ search });

    return res.status(200).json({
      message: 'Berhasil mengambil daftar buku',
      data,
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/books/:id — Detail buku
async function getBookById(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: 'ID buku tidak valid' });
    }

    const data = await getBookByIdService(id);

    return res.status(200).json({
      message: 'Berhasil mengambil data buku',
      data,
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/books — Tambah buku baru
async function createBook(req, res, next) {
  try {
    const { judul, tahun_terbit, stok, author_id, category_id } = req.body;

    // Validasi input
    if (!judul || !tahun_terbit || stok === undefined || !author_id || !category_id) {
      return res.status(400).json({ message: 'Judul, tahun terbit, stok, penulis, dan kategori wajib diisi' });
    }

    if (judul.trim().length < 2) {
      return res.status(400).json({ message: 'Judul buku minimal 2 karakter' });
    }

    const tahunNum = Number(tahun_terbit);
    const currentYear = new Date().getFullYear();
    if (isNaN(tahunNum) || tahunNum < 1000 || tahunNum > currentYear) {
      return res.status(400).json({ message: `Tahun terbit harus antara 1000 dan ${currentYear}` });
    }

    const stokNum = Number(stok);
    if (isNaN(stokNum) || stokNum < 0) {
      return res.status(400).json({ message: 'Stok tidak boleh negatif' });
    }

    const data = await createBookService({ judul, tahun_terbit, stok, author_id, category_id });

    return res.status(201).json({
      message: 'Buku berhasil ditambahkan',
      data,
    });
  } catch (error) {
    next(error);
  }
}

// PUT /api/books/:id — Edit buku
async function updateBook(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: 'ID buku tidak valid' });
    }

    const { judul, tahun_terbit, stok, author_id, category_id } = req.body;

    // Validasi opsional (hanya jika field ada dalam request)
    if (judul !== undefined && judul.trim().length < 2) {
      return res.status(400).json({ message: 'Judul buku minimal 2 karakter' });
    }

    if (tahun_terbit !== undefined) {
      const tahunNum = Number(tahun_terbit);
      const currentYear = new Date().getFullYear();
      if (isNaN(tahunNum) || tahunNum < 1000 || tahunNum > currentYear) {
        return res.status(400).json({ message: `Tahun terbit harus antara 1000 dan ${currentYear}` });
      }
    }

    if (stok !== undefined) {
      const stokNum = Number(stok);
      if (isNaN(stokNum) || stokNum < 0) {
        return res.status(400).json({ message: 'Stok tidak boleh negatif' });
      }
    }

    const data = await updateBookService(id, { judul, tahun_terbit, stok, author_id, category_id });

    return res.status(200).json({
      message: 'Buku berhasil diperbarui',
      data,
    });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/books/:id — Hapus buku
async function deleteBook(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: 'ID buku tidak valid' });
    }

    const data = await deleteBookService(id);

    return res.status(200).json({
      message: 'Buku berhasil dihapus',
      data,
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/books/meta/authors — Ambil semua penulis
async function getAllAuthors(req, res, next) {
  try {
    const data = await getAllAuthorsService();
    return res.status(200).json({
      message: 'Berhasil mengambil daftar penulis',
      data,
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/books/meta/categories — Ambil semua kategori
async function getAllCategories(req, res, next) {
  try {
    const data = await getAllCategoriesService();
    return res.status(200).json({
      message: 'Berhasil mengambil daftar kategori',
      data,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getAllAuthors,
  getAllCategories,
};
