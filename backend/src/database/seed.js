require('dotenv').config();

const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || undefined,
    database: process.env.DB_NAME,
  });

  console.log('✅ Terhubung ke database');

  try {
    // 1. Seed users
    console.log('\n📌 Menambahkan data users...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    await connection.execute(
      'INSERT IGNORE INTO users (id, nama, email, password) VALUES (?, ?, ?, ?)',
      [1, 'Administrator', 'admin@perpustakaan.com', hashedPassword]
    );
    await connection.execute(
      'INSERT IGNORE INTO users (id, nama, email, password) VALUES (?, ?, ?, ?)',
      [2, 'Budi Santoso', 'budi@perpustakaan.com', hashedPassword]
    );
    console.log('  ✓ 2 user ditambahkan (password: password123)');

    // 2. Seed authors
    console.log('\n📌 Menambahkan data penulis...');
    const authors = [
      [1, 'Andrea Hirata'],
      [2, 'Pramoedya Ananta Toer'],
      [3, 'Habiburrahman El Shirazy'],
      [4, 'Tere Liye'],
      [5, 'Dee Lestari'],
    ];
    for (const [id, nama] of authors) {
      await connection.execute(
        'INSERT IGNORE INTO authors (id, nama) VALUES (?, ?)',
        [id, nama]
      );
    }
    console.log(`  ✓ ${authors.length} penulis ditambahkan`);

    // 3. Seed categories
    console.log('\n📌 Menambahkan data kategori...');
    const categories = [
      [1, 'Novel'],
      [2, 'Fiksi Ilmiah'],
      [3, 'Sejarah'],
      [4, 'Pendidikan'],
      [5, 'Biografi'],
    ];
    for (const [id, nama] of categories) {
      await connection.execute(
        'INSERT IGNORE INTO categories (id, nama) VALUES (?, ?)',
        [id, nama]
      );
    }
    console.log(`  ✓ ${categories.length} kategori ditambahkan`);

    // 4. Seed books
    console.log('\n📌 Menambahkan data buku...');
    const books = [
      [1, 'Laskar Pelangi', 2005, 10, 1, 1],
      [2, 'Sang Pemimpi', 2006, 8, 1, 1],
      [3, 'Bumi Manusia', 1980, 5, 2, 3],
      [4, 'Anak Semua Bangsa', 1981, 4, 2, 3],
      [5, 'Ayat-Ayat Cinta', 2004, 12, 3, 1],
      [6, 'Bumi', 2014, 7, 4, 2],
      [7, 'Hujan', 2016, 9, 4, 1],
      [8, 'Perahu Kertas', 2009, 6, 5, 1],
    ];
    for (const [id, judul, tahun_terbit, stok, author_id, category_id] of books) {
      await connection.execute(
        'INSERT IGNORE INTO books (id, judul, tahun_terbit, stok, author_id, category_id) VALUES (?, ?, ?, ?, ?, ?)',
        [id, judul, tahun_terbit, stok, author_id, category_id]
      );
    }
    console.log(`  ✓ ${books.length} buku ditambahkan`);

    // 5. Verifikasi data
    console.log('\n📊 Verifikasi data:');
    const [userCount] = await connection.execute('SELECT COUNT(*) as total FROM users');
    const [authorCount] = await connection.execute('SELECT COUNT(*) as total FROM authors');
    const [categoryCount] = await connection.execute('SELECT COUNT(*) as total FROM categories');
    const [bookCount] = await connection.execute('SELECT COUNT(*) as total FROM books');
    console.log(`  Users     : ${userCount[0].total}`);
    console.log(`  Penulis   : ${authorCount[0].total}`);
    console.log(`  Kategori  : ${categoryCount[0].total}`);
    console.log(`  Buku      : ${bookCount[0].total}`);

    console.log('\n✅ Seed data berhasil!');
  } catch (error) {
    console.error('❌ Error saat seed:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
