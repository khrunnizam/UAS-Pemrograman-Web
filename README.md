# 📚 Perpustakaan Umum Daerah

Aplikasi Full Stack untuk mengelola data perpustakaan.

## Tech Stack

| Layer      | Teknologi    |
| ---------- | ------------ |
| Frontend   | SvelteKit    |
| Backend    | Express.js   |
| Database   | MariaDB      |
| ORM        | Drizzle ORM  |
| Auth       | JWT + bcrypt |

## Cara Menjalankan

### 1. Database

Pastikan MariaDB sudah berjalan dan buat database:

```sql
CREATE DATABASE perpustakaan;
```

### 2. Backend

```bash
cd backend
cp .env.example .env   # sesuaikan konfigurasi database
npm install
npm run db:push         # buat tabel di database
npm run dev             # jalankan server di port 3000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev             # jalankan di port 5173
```

## Struktur Folder

```
├── frontend/              # SvelteKit
│   └── src/
│       ├── lib/
│       │   ├── components/    # Komponen UI
│       │   ├── stores/        # State management
│       │   └── services/      # API services
│       └── routes/            # Halaman aplikasi
│
├── backend/               # Express.js
│   └── src/
│       ├── routes/            # Route definitions
│       ├── controllers/       # Request handlers
│       ├── services/          # Business logic
│       ├── middlewares/       # Auth & error handler
│       ├── database/          # Koneksi database
│       ├── schema/            # Drizzle ORM schema
│       └── utils/             # JWT & password helpers
```
