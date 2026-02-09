// 1. Keamanan Frontend
const role = localStorage.getItem('role');
if (role !== 'dosen') {
    alert("Akses ditolak! Halaman ini hanya untuk Dosen.");
    window.location.href = '/'; // Kembali ke root/login
}

const tableBody = document.getElementById('studentTableBody');
// Gunakan path relatif
const API_URL = '/api/students'; 

// 2. Fungsi untuk mengambil data (Read)
async function loadMahasiswa() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) throw new Error(`Status: ${response.status}`);

        const data = await response.json();

        if (!tableBody) return;
        tableBody.innerHTML = '';

        if (!Array.isArray(data) || data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" class="text-center p-4">Belum ada data mahasiswa</td></tr>`;
            return;
        }

        data.forEach(item => {
            tableBody.innerHTML += `
                <tr class="border-t">
                    <td class="p-4">${item.nim}</td>
                    <td class="p-4">${item.nama}</td>
                    <td class="p-4 text-center">${item.semester}</td>
                    <td class="p-4 text-center">${item.kelas || '-'}</td>
                    <td class="p-4 text-center">
                        <button onclick="hapusMahasiswa('${item.id}', '${item.nama}')" class="text-red-500 hover:text-red-700">
                            Hapus
                        </button>
                    </td>
                </tr>
            `;
        });
    } catch (err) {
        console.error("Gagal memuat data:", err);
        if (tableBody) tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-red-500">Gagal memuat data.</td></tr>`;
    }
}

// 3. Fungsi Tambah Mahasiswa
const studentForm = document.getElementById('studentForm');
if (studentForm) {
    studentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const payload = {
            nim: document.getElementById('nim').value,
            nama: document.getElementById('nama').value,
            semester: parseInt(document.getElementById('semester').value, 10),
            kelas: document.getElementById('kelas').value,
            email: document.getElementById('email').value
        };

        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert("Mahasiswa berhasil ditambahkan!");
                studentForm.reset();
                // Tutup modal jika ada (sesuaikan ID modal kamu)
                const modal = document.getElementById('modalMahasiswa');
                if(modal) modal.style.display = 'none'; 
                loadMahasiswa();
            } else {
                alert("Gagal menambahkan data.");
            }
        } catch (err) {
            alert("Error koneksi server.");
        }
    });
}

// 4. Fungsi Hapus
async function hapusMahasiswa(id, nama) {
    if (confirm(`Hapus mahasiswa ${nama}?`)) {
        try {
            const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (res.ok) {
                loadMahasiswa();
            } else {
                alert("Gagal menghapus.");
            }
        } catch (err) {
            alert("Error koneksi.");
        }
    }
}

document.addEventListener('DOMContentLoaded', loadMahasiswa);