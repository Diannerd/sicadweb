require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcrypt');
const cors = require('cors'); // Tambahkan require cors kalau belum

const app = express();
const PORT = process.env.PORT || 10000; // Render biasanya pakai port 10000

/* ===================== TRUST PROXY (WAJIB DI RENDER) ===================== */
app.set('trust proxy', 1);

/* ===================== CORS FIX (ANTI ERROR LOGIN) ===================== */
// Render butuh CORS yang lebih fleksibel saat development/testing
app.use(cors({
  origin: true, // Atau masukkan URL frontend kamu nanti
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

/* ===================== BODY PARSER ===================== */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

/* ===================== SESSION ===================== */
// PENTING: MemoryStore (default) akan reset setiap deploy di Render.
// Tapi untuk tugas malam ini, ini cukup.
app.use(
  session({
    name: 'sicad_session',
    secret: process.env.SESSION_SECRET || 'sicad_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // True jika di Render (HTTPS)
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Penting buat Cross-Site
      maxAge: 1000 * 60 * 60 * 24 // 1 Hari
    }
  })
);

/* ===================== DATABASE (NEON.TECH READY) ===================== */
// HAPUS DB_HOST, DB_USER dll yang terpisah. Ganti pakai connectionString.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Wajib true/false objek ini untuk Neon.tech!
  }
});

/* ===================== ROUTE: LOGIN ===================== */
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Pastikan nama kolom di database Neon sesuai (username atau email?)
    const { rows } = await pool.query(
      'SELECT id, nama, role, password FROM users WHERE username = $1',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'User tidak ditemukan' });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ error: 'Password salah' });
    }

    req.session.user = {
      id: user.id,
      nama: user.nama,
      role: user.role
    };

    req.session.save(() => {
      res.json({
        message: 'Login berhasil',
        user: req.session.user
      });
    });
  } catch (err) {
    console.error('LOGIN ERROR:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ===================== ROUTE: KHS (DARI APP.JS LAMA) ===================== */
// Jika kamu punya file routes/khs.js, pastikan file itu export router
const khsRoutes = require('./routes/khs'); 
app.use('/api/khs', khsRoutes);

/* ===================== TEST ROUTE (WAJIB UNTUK DEBUG) ===================== */
app.get('/api/health', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    res.json({ status: 'OK', db_time: result.rows[0].now });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'ERROR', message: err.message });
  }
});

/* ===================== START SERVER ===================== */
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SICAD server running on port ${PORT}`);
});
