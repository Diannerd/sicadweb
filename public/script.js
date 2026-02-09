console.log("JavaScript Evaluations siap!");

async function fetchData() {
    const search = document.getElementById('search-student')?.value || '';
    const subject = document.getElementById('subject-filter')?.value || 'All';
    const examType = document.getElementById('exam-filter')?.value || 'All';

    try {
        // Gunakan path relatif
        const response = await fetch(`/api/evaluations?search=${search}&subject=${subject}&examType=${examType}`);
        const data = await response.json();
        renderStudents(data);
    } catch (err) {
        console.error("Gagal mengambil data nilai:", err);
    }
}

function renderStudents(students) {
    const container = document.getElementById('student-list-container');
    if (!container) return; // Mencegah error kalau elemen tidak ada
    container.innerHTML = ''; 

    students.forEach(s => {
        const card = `
            <div class="student-item" style="display: flex; justify-content: space-between; padding: 20px; border-bottom: 1px solid #eee;">
                <div>
                    <strong>${s.name}</strong><br>
                    <small>Semester ${s.semester}</small>
                </div>
                <div>${s.subject_name}</div>
                <div><strong>${s.marks_scored} / ${s.max_marks}</strong></div>
                <div>${s.exam_type}</div>
                <div>
                    <button onclick="openEditModal(${s.id}, ${s.marks_scored}, '${s.exam_type}')" style="color: #007bff; cursor: pointer; border: none; background: none;">Edit</button>
                </div>
            </div>
        `;
        container.innerHTML += card;
    });
}

// ... (Bagian Modal Edit biarkan sama, tapi pastikan URL fetch di saveChanges juga diganti)

async function saveChanges() {
    const id = document.getElementById('edit-id').value;
    const marks = document.getElementById('edit-marks').value;
    const type = document.getElementById('edit-type').value;

    // UPDATE URL KE RELATIVE PATH
    const response = await fetch(`/api/evaluations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ marks_scored: marks, exam_type: type })
    });

    if (response.ok) {
        closeModal();
        fetchData();
    }
}

// Event Listeners
document.getElementById('search-student')?.addEventListener('input', fetchData);
document.getElementById('subject-filter')?.addEventListener('change', fetchData);
document.getElementById('exam-filter')?.addEventListener('change', fetchData);

// Jalankan
fetchData();