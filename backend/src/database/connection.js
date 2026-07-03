const mysql = require('mysql2/promise');
const { drizzle } = require('drizzle-orm/mysql2');
const schema = require('../schema/schema');

let db;

async function connectDatabase() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || undefined,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
  });

  db = drizzle(pool, { schema, mode: 'default' });

  // Test connection
  const connection = await pool.getConnection();
  console.log('✅ Database terhubung');
  connection.release();

  return db;
}

function getDatabase() {
  if (!db) {
    throw new Error('Database belum terhubung. Panggil connectDatabase() terlebih dahulu.');
  }
  return db;
}

module.exports = { connectDatabase, getDatabase };
