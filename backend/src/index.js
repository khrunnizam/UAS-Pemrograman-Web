require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { connectDatabase } = require('./database/connection');
const { errorHandler } = require('./middlewares/errorHandler');

const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server berjalan dengan baik' });
});

// Routes
app.use('/api/auth', authRoutes);

// Error handler
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    await connectDatabase();

    app.listen(PORT, () => {
      console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Gagal menjalankan server:', error.message);
    process.exit(1);
  }
}

startServer();
