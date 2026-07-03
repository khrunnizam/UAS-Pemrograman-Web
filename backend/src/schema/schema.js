const { mysqlTable, int, varchar, year } = require('drizzle-orm/mysql-core');

const users = mysqlTable('users', {
  id: int('id').primaryKey().autoincrement(),
  nama: varchar('nama', { length: 100 }).notNull(),
  email: varchar('email', { length: 100 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
});

const authors = mysqlTable('authors', {
  id: int('id').primaryKey().autoincrement(),
  nama: varchar('nama', { length: 100 }).notNull(),
});

const categories = mysqlTable('categories', {
  id: int('id').primaryKey().autoincrement(),
  nama: varchar('nama', { length: 100 }).notNull(),
});

const books = mysqlTable('books', {
  id: int('id').primaryKey().autoincrement(),
  judul: varchar('judul', { length: 255 }).notNull(),
  tahun_terbit: year('tahun_terbit').notNull(),
  stok: int('stok').notNull().default(0),
  author_id: int('author_id').notNull().references(() => authors.id),
  category_id: int('category_id').notNull().references(() => categories.id),
});

module.exports = { users, authors, categories, books };
