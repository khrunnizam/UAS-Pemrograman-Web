const {
  getAllAuthorsService,
  getAuthorByIdService,
  createAuthorService,
  updateAuthorService,
  deleteAuthorService,
} = require('../services/authorService');

// GET /api/authors — Daftar penulis (opsional: ?search=nama)
async function getAllAuthors(req, res, next) {
  try {
    const { search } = req.query;
    const data = await getAllAuthorsService({ search });

    return res.status(200).json({
      message: 'Berhasil mengambil daftar penulis',
      data,
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/authors/:id — Detail penulis
async function getAuthorById(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: 'ID penulis tidak valid' });
    }

    const data = await getAuthorByIdService(id);

    return res.status(200).json({
      message: 'Berhasil mengambil data penulis',
      data,
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/authors — Tambah penulis baru
async function createAuthor(req, res, next) {
  try {
    const { nama } = req.body;

    if (!nama || !nama.trim()) {
      return res.status(400).json({ message: 'Nama penulis wajib diisi' });
    }

    if (nama.trim().length < 2) {
      return res.status(400).json({ message: 'Nama penulis minimal 2 karakter' });
    }

    if (nama.trim().length > 100) {
      return res.status(400).json({ message: 'Nama penulis maksimal 100 karakter' });
    }

    const data = await createAuthorService({ nama });

    return res.status(201).json({
      message: 'Penulis berhasil ditambahkan',
      data,
    });
  } catch (error) {
    next(error);
  }
}

// PUT /api/authors/:id — Edit penulis
async function updateAuthor(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: 'ID penulis tidak valid' });
    }

    const { nama } = req.body;

    if (!nama || !nama.trim()) {
      return res.status(400).json({ message: 'Nama penulis wajib diisi' });
    }

    if (nama.trim().length < 2) {
      return res.status(400).json({ message: 'Nama penulis minimal 2 karakter' });
    }

    if (nama.trim().length > 100) {
      return res.status(400).json({ message: 'Nama penulis maksimal 100 karakter' });
    }

    const data = await updateAuthorService(id, { nama });

    return res.status(200).json({
      message: 'Penulis berhasil diperbarui',
      data,
    });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/authors/:id — Hapus penulis
async function deleteAuthor(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: 'ID penulis tidak valid' });
    }

    const data = await deleteAuthorService(id);

    return res.status(200).json({
      message: 'Penulis berhasil dihapus',
      data,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor,
};
