const { Pool } = require('pg');
require('dotenv').config();

// Konfigurasi koneksi menggunakan Connection String dari Neon.tech
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    // SSL wajib disetel seperti ini agar bisa terhubung ke Neon dari Render
    rejectUnauthorized: false
  }
});

// Menangani error koneksi yang tak terduga
pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
  process.exit(-1);
});

module.exports = pool;