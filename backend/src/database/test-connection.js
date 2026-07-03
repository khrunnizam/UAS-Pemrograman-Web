require('dotenv').config();

const mysql = require('mysql2/promise');

async function testConnection() {
  let connection;

  try {
    console.log('🔍 Menguji koneksi database...\n');

    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD || undefined,
      database: process.env.DB_NAME,
    });

    console.log(`✅ Terhubung ke: ${process.env.DB_NAME} @ ${process.env.DB_HOST}:${process.env.DB_PORT}\n`);

    // Cek semua tabel
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 Tabel yang tersedia:');
    tables.forEach((t) => console.log(`  ✓ ${Object.values(t)[0]}`));

    // Cek data buku dengan JOIN
    console.log('\n📚 Daftar Buku (dengan penulis & kategori):');
    const [books] = await connection.execute(`
      SELECT
        b.id,
        b.judul,
        b.tahun_terbit,
        b.stok,
        a.nama AS penulis,
        c.nama AS kategori
      FROM books b
      JOIN authors a ON b.author_id = a.id
      JOIN categories c ON b.category_id = c.id
      ORDER BY b.id
    `);
    books.forEach((b) => {
      console.log(`  [${b.id}] ${b.judul} (${b.tahun_terbit}) — ${b.penulis} — ${b.kategori} — Stok: ${b.stok}`);
    });

    // Statistik
    console.log('\n📊 Statistik:');
    const [[{ total_buku }]] = await connection.execute('SELECT COUNT(*) as total_buku FROM books');
    const [[{ total_penulis }]] = await connection.execute('SELECT COUNT(*) as total_penulis FROM authors');
    const [[{ total_kategori }]] = await connection.execute('SELECT COUNT(*) as total_kategori FROM categories');
    const [[{ total_users }]] = await connection.execute('SELECT COUNT(*) as total_users FROM users');
    console.log(`  Total Buku     : ${total_buku}`);
    console.log(`  Total Penulis  : ${total_penulis}`);
    console.log(`  Total Kategori : ${total_kategori}`);
    console.log(`  Total Users    : ${total_users}`);

    // Cek relasi foreign key
    console.log('\n🔗 Verifikasi Relasi:');
    const [fks] = await connection.execute(`
      SELECT
        TABLE_NAME,
        COLUMN_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM information_schema.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = '${process.env.DB_NAME}'
        AND REFERENCED_TABLE_NAME IS NOT NULL
    `);
    fks.forEach((fk) => {
      console.log(`  ✓ ${fk.TABLE_NAME}.${fk.COLUMN_NAME} → ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`);
    });

    console.log('\n✅ Semua uji koneksi berhasil!');
  } catch (error) {
    console.error('❌ Uji koneksi gagal:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

testConnection();
