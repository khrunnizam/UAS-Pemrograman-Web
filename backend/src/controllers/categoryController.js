const {
  getAllCategoriesService,
  getCategoryByIdService,
  createCategoryService,
  updateCategoryService,
  deleteCategoryService,
} = require('../services/categoryService');

// GET /api/categories — Daftar kategori (opsional: ?search=nama)
async function getAllCategories(req, res, next) {
  try {
    const { search } = req.query;
    const data = await getAllCategoriesService({ search });

    return res.status(200).json({
      message: 'Berhasil mengambil daftar kategori',
      data,
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/categories/:id — Detail kategori
async function getCategoryById(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: 'ID kategori tidak valid' });
    }

    const data = await getCategoryByIdService(id);

    return res.status(200).json({
      message: 'Berhasil mengambil data kategori',
      data,
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/categories — Tambah kategori baru
async function createCategory(req, res, next) {
  try {
    const { nama } = req.body;

    if (!nama || !nama.trim()) {
      return res.status(400).json({ message: 'Nama kategori wajib diisi' });
    }

    if (nama.trim().length < 2) {
      return res.status(400).json({ message: 'Nama kategori minimal 2 karakter' });
    }

    if (nama.trim().length > 100) {
      return res.status(400).json({ message: 'Nama kategori maksimal 100 karakter' });
    }

    const data = await createCategoryService({ nama });

    return res.status(201).json({
      message: 'Kategori berhasil ditambahkan',
      data,
    });
  } catch (error) {
    next(error);
  }
}

// PUT /api/categories/:id — Edit kategori
async function updateCategory(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: 'ID kategori tidak valid' });
    }

    const { nama } = req.body;

    if (!nama || !nama.trim()) {
      return res.status(400).json({ message: 'Nama kategori wajib diisi' });
    }

    if (nama.trim().length < 2) {
      return res.status(400).json({ message: 'Nama kategori minimal 2 karakter' });
    }

    if (nama.trim().length > 100) {
      return res.status(400).json({ message: 'Nama kategori maksimal 100 karakter' });
    }

    const data = await updateCategoryService(id, { nama });

    return res.status(200).json({
      message: 'Kategori berhasil diperbarui',
      data,
    });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/categories/:id — Hapus kategori
async function deleteCategory(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: 'ID kategori tidak valid' });
    }

    const data = await deleteCategoryService(id);

    return res.status(200).json({
      message: 'Kategori berhasil dihapus',
      data,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
