/* ================================
   AUTH HELPERS — SICAD (PRODUCTION READY)
   ================================ */

// Kosongkan agar otomatis ikut domain (localhost atau vercel)
const API_BASE = ''; 

/**
 * LOGIN
 */
async function login(role, username, password, redirectUrl) {
  try {
    const params = new URLSearchParams();
    params.append('email', username);
    params.append('password', password);

    const res = await fetch(`${API_BASE}/api/login`, {
      method: 'POST',
      credentials: 'include', // Penting untuk session
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded' 
      },
      body: params
    });

    if (!res.ok) {
      let msg = 'Login gagal';
      try {
        const errData = await res.json();
        msg = errData.error || msg;
      } catch (_) {}
      alert(msg);
      return;
    }

    const data = await res.json();

    // Simpan info user di client
    localStorage.setItem('role', data.user.role);
    localStorage.setItem('user', data.user.nama);

    console.log('✅ LOGIN BERHASIL:', data.user);
    window.location.href = redirectUrl;

  } catch (err) {
    console.error('❌ ERROR LOGIN:', err);
    alert('Gagal terhubung ke server. Cek koneksi internet atau status server.');
  }
}

/**
 * LOGOUT
 */
async function logout() {
  try {
    await fetch(`${API_BASE}/api/logout`, {
      method: 'POST',
      credentials: 'include'
    });
  } catch (err) {
    console.warn('Logout warning:', err);
  }

  localStorage.clear();
  window.location.href = '/';
}

/**
 * PROTECT PAGE BY ROLE
 */
function requireRole(role) {
  const currentRole = localStorage.getItem('role');

  if (!currentRole || currentRole !== role) {
    localStorage.clear();
    window.location.href = '/'; // Kembali ke login jika role salah
  }
}