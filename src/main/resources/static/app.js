let currentPage = 0;
let totalPages = 1;
let majorChartInstance = null;
let semesterChartInstance = null;
let allStudentsCache = [];

function showPage(pageName) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.querySelectorAll('.sidebar a').forEach(btn => btn.classList.remove('active'));
    document.getElementById('page-' + pageName).classList.add('active');
    document.getElementById('nav-' + pageName).classList.add('active');

    const titles = {
        'dashboard': 'Dashboard Overview', 'students': 'Student Management', 'courses': 'Course Management',
        'tutors': 'Tutor Management', 'enrollments': 'Enrollment Management', 'results': 'Examination Results',
        'allocations': 'Course Allocation', 'reports': 'Academic Reports'
    };
    document.getElementById('pageTitle').innerText = titles[pageName];

    if (pageName === 'students') document.getElementById('searchContainer').style.display = 'flex';
    else document.getElementById('searchContainer').style.display = 'none';

    if (pageName === 'dashboard') loadCharts();
    if (pageName === 'students') { currentPage = 0; loadStudents(); }
    if (pageName === 'courses') loadCourses();
    if (pageName === 'tutors') loadTutors();
    if (pageName === 'enrollments') { loadEnrollments(); loadEnrollmentDropdowns(); }
    if (pageName === 'results') { loadResults(); loadResultDropdown(); }
    if (pageName === 'allocations') { loadAllocations(); loadAllocationDropdowns(); }
    if (pageName === 'reports') loadReportDropdown();
}

window.onload = () => loadStudents();

function generateStudentId() { document.getElementById('studentId').value = "CHUKA/" + Date.now(); }
function generateCourseId() { document.getElementById('courseId').value = "CSCI" + Date.now().toString().slice(-4); }
function generateTutorId() { document.getElementById('tutorId').value = "TUT" + Date.now().toString().slice(-4); }
function generateEnrollmentId() { document.getElementById('enrollmentId').value = "ENR" + Date.now().toString().slice(-6); }
function generateResultId() { document.getElementById('resultId').value = "RES" + Date.now().toString().slice(-6); }
function generateAllocationId() { document.getElementById('allocationId').value = "ALLOC" + Date.now().toString().slice(-6); }

// STUDENTS
function loadStudents() {
    resetStudentForm();
    fetch(`https://srms-web-pci5.onrender.com/api/students?page=${currentPage}&size=10`).then(res => res.json()).then(data => {
        const table = document.getElementById('studentTable');
        table.innerHTML = '';
        
        data.content.forEach(s => {
            table.innerHTML += `<tr><td><a href="#" onclick="showStudentProfile('${s.studentId}')" class="text-primary text-decoration-none fw-bold">${s.studentId}</a></td><td>${s.firstName}</td><td>${s.lastName}</td><td>${s.major}</td><td><button class="btn btn-sm btn-warning me-1" onclick="editStudent('${s.studentId}', '${s.firstName}', '${s.lastName}', '${s.major}')"><i class="fas fa-edit"></i> Edit</button><button class="btn btn-sm btn-danger" onclick="deleteStudent('${s.studentId}')"><i class="fas fa-trash"></i> Delete</button></td></tr>`;
        });
        
        totalPages = data.totalPages;
        document.getElementById('pageInfo').innerText = `Page ${currentPage + 1} of ${Math.max(1, totalPages)}`;
        document.getElementById('prevBtn').disabled = (currentPage === 0);
        document.getElementById('nextBtn').disabled = (currentPage >= totalPages - 1);
    });
}

function changePage(direction) { currentPage += direction; loadStudents(); }
function addStudent() {
    const student = { studentId: document.getElementById('studentId').value, firstName: document.getElementById('firstName').value, lastName: document.getElementById('lastName').value, major: document.getElementById('major').value, dateOfBirth: "2000-01-01", currentSemester: 1, currentYear: 1, academicStatus: "Active" };
    
    fetch('https://srms-web-pci5.onrender.com/api/students', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(student) })
    .then(async res => { 
        if (!res.ok) { 
            const err = await res.json(); 
            throw new Error(err.error || "Failed to save"); 
        } 
        return res.json(); 
    })
    .then(() => loadStudents())
    .catch(err => alert("❌ ERROR: " + err.message));
}

function updateStudent() {
    const id = document.getElementById('studentId').value;
    if (!id || id.trim() === "") { alert("❌ ERROR: Student ID is missing!\n\nPlease click the yellow 'Edit' button next to a student in the table to load their ID before updating."); return; }
    const student = { studentId: id, firstName: document.getElementById('firstName').value, lastName: document.getElementById('lastName').value, major: document.getElementById('major').value, dateOfBirth: "2000-01-01", currentSemester: 1, currentYear: 1, academicStatus: "Active" };
    fetch(`https://srms-web-pci5.onrender.com/api/students/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(student) })
        .then(async res => { if (!res.ok) { if (res.status === 404) throw new Error("Student not found. Did you click 'Generate ID' instead of selecting an existing student from the table?"); const err = await res.json(); throw new Error(err.error || "Failed"); } return res.json(); })
        .then(() => loadStudents()).catch(err => alert("❌ ERROR: " + err.message));
}

function deleteStudent(id) { if(confirm("Delete this student?")) fetch(`https://srms-web-pci5.onrender.com/api/students/${id}`, { method: 'DELETE' }).then(() => loadStudents()); }

function editStudent(id, first, last, major) {
    document.getElementById('studentId').value = id; document.getElementById('studentId').readOnly = true;
    document.getElementById('firstName').value = first; document.getElementById('lastName').value = last; document.getElementById('major').value = major;
    document.getElementById('addStudentBtn').style.display = 'none';
    document.getElementById('updateStudentBtn').style.display = 'inline-block';
    document.getElementById('cancelStudentBtn').style.display = 'inline-block';
    document.getElementById('generateStudentBtn').style.display = 'none';
}

function resetStudentForm() {
    document.getElementById('studentId').value = ''; document.getElementById('studentId').readOnly = false;
    document.getElementById('firstName').value = ''; document.getElementById('lastName').value = ''; document.getElementById('major').value = '';
    document.getElementById('addStudentBtn').style.display = 'inline-block';
    document.getElementById('updateStudentBtn').style.display = 'none';
    document.getElementById('cancelStudentBtn').style.display = 'none';
    document.getElementById('generateStudentBtn').style.display = 'inline-block';
}

function showStudentProfile(studentId) {
    const modalBody = document.getElementById('profileModalBody');
    modalBody.innerHTML = '<div class="text-center p-4"><div class="spinner-border text-primary"></div><p class="mt-2">Loading...</p></div>';
    const modal = new bootstrap.Modal(document.getElementById('studentProfileModal'));
    modal.show();
    fetch(`https://srms-web-pci5.onrender.com/api/reports/transcript/${studentId}`).then(res => res.json()).then(data => {
        if (data.error) { modalBody.innerHTML = `<div class="alert alert-danger">${data.error}</div>`; return; }
        const s = data.student; const enrollments = data.enrollments; const results = data.results;
        let totalPoints = 0; let count = 0;
        enrollments.forEach(e => { const result = results.find(r => r.enrollmentId === e.enrollmentId); if (result) { if (result.grade === "A") totalPoints += 4.0; else if (result.grade === "B") totalPoints += 3.0; else if (result.grade === "C") totalPoints += 2.0; else if (result.grade === "D") totalPoints += 1.0; count++; } });
        const gpa = count > 0 ? (totalPoints / count).toFixed(2) : "N/A";
        let html = `<div class="row mb-4"><div class="col-md-8"><h3>${s.firstName} ${s.lastName}</h3><p class="text-muted mb-1"><strong>ID:</strong> ${s.studentId}</p><p class="text-muted mb-1"><strong>Major:</strong> ${s.major}</p></div><div class="col-md-4 text-center"><div class="p-3 bg-light rounded shadow-sm"><h5 class="text-muted mb-1">Cumulative GPA</h5><h1 class="text-success fw-bold mb-0">${gpa}</h1></div></div></div><h5 class="border-bottom pb-2">Enrolled Courses</h5><table class="table table-sm table-striped mt-2"><thead><tr><th>Course ID</th><th>Semester</th><th>Score</th><th>Grade</th></tr></thead><tbody>`;
        if (enrollments.length === 0) html += `<tr><td colspan="4" class="text-center text-muted">No enrollments.</td></tr>`;
        else { enrollments.forEach(e => { const result = results.find(r => r.enrollmentId === e.enrollmentId); html += `<tr><td>${e.courseId}</td><td>Sem ${e.semester} (${e.year})</td><td>${result ? result.score : '-'}</td><td>${result ? `<span class="badge ${result.grade === 'F' ? 'bg-danger' : 'bg-primary'}">${result.grade}</span>` : '-'}</td></tr>`; }); }
        html += `</tbody></table>`; modalBody.innerHTML = html;
    });
}

function handleSearch(event) {
    if (event.key === "Enter") {
        const query = document.getElementById('globalSearch').value.trim();
        if (!query) { loadStudents(); return; }
        showPage('students');
        fetch(`https://srms-web-pci5.onrender.com/api/students/search?query=${query}`).then(res => res.json()).then(data => {
            const table = document.getElementById('studentTable'); table.innerHTML = '';
            if (data.length === 0) table.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">No students found matching "${query}"</td></tr>`;
            else { data.forEach(s => { table.innerHTML += `<tr><td><a href="#" onclick="showStudentProfile('${s.studentId}')" class="text-primary text-decoration-none fw-bold">${s.studentId}</a></td><td>${s.firstName}</td><td>${s.lastName}</td><td>${s.major}</td><td><button class="btn btn-sm btn-warning me-1" onclick="editStudent('${s.studentId}', '${s.firstName}', '${s.lastName}', '${s.major}')">Edit</button><button class="btn btn-sm btn-danger" onclick="deleteStudent('${s.studentId}')">Delete</button></td></tr>`; }); }
            document.getElementById('pageInfo').innerText = `Search Results (${data.length})`;
            document.getElementById('prevBtn').disabled = true; document.getElementById('nextBtn').disabled = true;
        });
    }
}

// COURSES
function loadCourses() {
    resetCourseForm();
    fetch('https://srms-web-pci5.onrender.com/api/courses').then(res => res.json()).then(data => {
        const table = document.getElementById('courseTable'); table.innerHTML = '';
        data.forEach(c => { table.innerHTML += `<tr><td>${c.courseId}</td><td>${c.courseName}</td><td>${c.credits}</td><td>${c.department}</td><td><button class="btn btn-sm btn-warning me-1" onclick="editCourse('${c.courseId}', '${c.courseName}', '${c.credits}', '${c.department}')">Edit</button><button class="btn btn-sm btn-danger" onclick="deleteCourse('${c.courseId}')">Delete</button></td></tr>`; });
    });
}
function addCourse() { const c = { courseId: document.getElementById('courseId').value, courseName: document.getElementById('courseName').value, credits: parseInt(document.getElementById('credits').value), department: document.getElementById('department').value }; fetch('https://srms-web-pci5.onrender.com/api/courses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(c) }).then(() => loadCourses()); }
function updateCourse() { const id = document.getElementById('courseId').value; const c = { courseId: id, courseName: document.getElementById('courseName').value, credits: parseInt(document.getElementById('credits').value), department: document.getElementById('department').value }; fetch(`https://srms-web-pci5.onrender.com/api/courses/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(c) }).then(() => loadCourses()); }
function deleteCourse(id) { if(confirm("Delete this course?")) fetch(`https://srms-web-pci5.onrender.com/api/courses/${id}`, { method: 'DELETE' }).then(() => loadCourses()); }
function editCourse(id, name, credits, dept) { document.getElementById('courseId').value = id; document.getElementById('courseId').readOnly = true; document.getElementById('courseName').value = name; document.getElementById('credits').value = credits; document.getElementById('department').value = dept; document.getElementById('addCourseBtn').style.display = 'none'; document.getElementById('updateCourseBtn').style.display = 'inline-block'; document.getElementById('cancelCourseBtn').style.display = 'inline-block'; }
function resetCourseForm() { document.getElementById('courseId').value = ''; document.getElementById('courseId').readOnly = false; document.getElementById('courseName').value = ''; document.getElementById('credits').value = ''; document.getElementById('department').value = ''; document.getElementById('addCourseBtn').style.display = 'inline-block'; document.getElementById('updateCourseBtn').style.display = 'none'; document.getElementById('cancelCourseBtn').style.display = 'none'; }

// TUTORS
function loadTutors() {
    resetTutorForm();
    fetch('https://srms-web-pci5.onrender.com/api/tutors').then(res => res.json()).then(data => {
        const table = document.getElementById('tutorTable'); table.innerHTML = '';
        data.forEach(t => { table.innerHTML += `<tr><td>${t.tutorId}</td><td>${t.firstName}</td><td>${t.lastName}</td><td>${t.department}</td><td><button class="btn btn-sm btn-warning me-1" onclick="editTutor('${t.tutorId}', '${t.firstName}', '${t.lastName}', '${t.department}')">Edit</button><button class="btn btn-sm btn-danger" onclick="deleteTutor('${t.tutorId}')">Delete</button></td></tr>`; });
    });
}
function addTutor() { const t = { tutorId: document.getElementById('tutorId').value, firstName: document.getElementById('tutorFirstName').value, lastName: document.getElementById('tutorLastName').value, department: document.getElementById('tutorDepartment').value }; fetch('https://srms-web-pci5.onrender.com/api/tutors', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(t) }).then(() => loadTutors()); }
function updateTutor() { const id = document.getElementById('tutorId').value; const t = { tutorId: id, firstName: document.getElementById('tutorFirstName').value, lastName: document.getElementById('tutorLastName').value, department: document.getElementById('tutorDepartment').value }; fetch(`https://srms-web-pci5.onrender.com/api/tutors/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(t) }).then(() => loadTutors()); }
function deleteTutor(id) { if(confirm("Delete this tutor?")) fetch(`https://srms-web-pci5.onrender.com/api/tutors/${id}`, { method: 'DELETE' }).then(() => loadTutors()); }
function editTutor(id, first, last, dept) { document.getElementById('tutorId').value = id; document.getElementById('tutorId').readOnly = true; document.getElementById('tutorFirstName').value = first; document.getElementById('tutorLastName').value = last; document.getElementById('tutorDepartment').value = dept; document.getElementById('addTutorBtn').style.display = 'none'; document.getElementById('updateTutorBtn').style.display = 'inline-block'; document.getElementById('cancelTutorBtn').style.display = 'inline-block'; }
function resetTutorForm() { document.getElementById('tutorId').value = ''; document.getElementById('tutorId').readOnly = false; document.getElementById('tutorFirstName').value = ''; document.getElementById('tutorLastName').value = ''; document.getElementById('tutorDepartment').value = ''; document.getElementById('addTutorBtn').style.display = 'inline-block'; document.getElementById('updateTutorBtn').style.display = 'none'; document.getElementById('cancelTutorBtn').style.display = 'none'; }

// ENROLLMENTS
function loadEnrollmentDropdowns() {
    fetch('https://srms-web-pci5.onrender.com/api/students?size=1000').then(res => res.json()).then(data => {
        allStudentsCache = data.content;
        const select = document.getElementById('enrollStudentId');
        select.innerHTML = '<option value="">-- Select Student --</option>';
        allStudentsCache.forEach(s => { select.innerHTML += `<option value="${s.studentId}">${s.studentId} - ${s.firstName} ${s.lastName}</option>`; });
        renderBulkCheckboxes(allStudentsCache);
    });
    fetch('https://srms-web-pci5.onrender.com/api/courses').then(res => res.json()).then(data => {
        const select = document.getElementById('enrollCourseId');
        select.innerHTML = '<option value="">-- Select Course --</option>';
        data.forEach(c => { select.innerHTML += `<option value="${c.courseId}">${c.courseId} - ${c.courseName}</option>`; });
        const bulkSelect = document.getElementById('bulkCourseId');
        bulkSelect.innerHTML = '<option value="">-- Select Course --</option>';
        data.forEach(c => { bulkSelect.innerHTML += `<option value="${c.courseId}">${c.courseId} - ${c.courseName}</option>`; });
    });
}

function renderBulkCheckboxes(students) {
    const list = document.getElementById('studentCheckboxList');
    list.innerHTML = '';
    if (students.length === 0) { list.innerHTML = '<div class="text-muted text-center w-100">No students found.</div>'; return; }
    students.forEach(s => {
        list.innerHTML += `<label class="student-checkbox-label p-2 border rounded bg-white d-flex align-items-center" style="cursor:pointer;"><input type="checkbox" class="bulk-student-cb me-2" value="${s.studentId}" onchange="updateSelectedCount()"><span>${s.firstName} ${s.lastName} <small class="text-muted">(${s.studentId})</small></span></label>`;
    });
}

function filterBulkStudents() {
    const query = document.getElementById('bulkSearch').value.toLowerCase();
    const filtered = allStudentsCache.filter(s => s.firstName.toLowerCase().includes(query) || s.lastName.toLowerCase().includes(query) || s.studentId.toLowerCase().includes(query));
    renderBulkCheckboxes(filtered);
}

function updateSelectedCount() {
    const count = document.querySelectorAll('.bulk-student-cb:checked').length;
    document.getElementById('selectedCount').innerText = `${count} Selected`;
}

function loadEnrollments() {
    resetEnrollmentForm();
    fetch('https://srms-web-pci5.onrender.com/api/enrollments').then(res => res.json()).then(data => {
        const table = document.getElementById('enrollmentTable'); table.innerHTML = '';
        data.forEach(e => { table.innerHTML += `<tr><td>${e.enrollmentId}</td><td>${e.studentId}</td><td>${e.courseId}</td><td>${e.semester}</td><td>${e.year}</td><td>${e.enrollmentDate}</td><td><button class="btn btn-sm btn-warning me-1" onclick="editEnrollment('${e.enrollmentId}', '${e.studentId}', '${e.courseId}', '${e.semester}', '${e.year}')">Edit</button><button class="btn btn-sm btn-danger" onclick="deleteEnrollment('${e.enrollmentId}')">Delete</button></td></tr>`; });
    });
}

function bulkEnroll() {
    const courseId = document.getElementById('bulkCourseId').value;
    const semester = document.getElementById('bulkSemester').value;
    const year = document.getElementById('bulkYear').value;
    if (!courseId || !semester || !year) { alert("Please select a course, semester, and year first."); return; }
    const checkboxes = document.querySelectorAll('.bulk-student-cb:checked');
    if (checkboxes.length === 0) { alert("Please select at least one student."); return; }
    const enrollmentsList = [];
    const today = new Date().toISOString().split('T')[0];
    checkboxes.forEach(cb => { enrollmentsList.push({ enrollmentId: "ENR" + (Date.now() + Math.floor(Math.random() * 10000)), studentId: cb.value, courseId: courseId, semester: parseInt(semester), year: parseInt(year), enrollmentDate: today }); });
    fetch('https://srms-web-pci5.onrender.com/api/enrollments/bulk', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(enrollmentsList) }).then(() => {
        alert(`✅ Successfully enrolled ${checkboxes.length} students!`);
        document.getElementById('bulkSemester').value = ''; document.getElementById('bulkYear').value = ''; document.getElementById('bulkSearch').value = '';
        loadEnrollments(); renderBulkCheckboxes(allStudentsCache); updateSelectedCount();
    });
}

function addEnrollment() { const today = new Date().toISOString().split('T')[0]; const e = { enrollmentId: document.getElementById('enrollmentId').value, studentId: document.getElementById('enrollStudentId').value, courseId: document.getElementById('enrollCourseId').value, semester: parseInt(document.getElementById('semester').value), year: parseInt(document.getElementById('year').value), enrollmentDate: today }; fetch('https://srms-web-pci5.onrender.com/api/enrollments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(e) }).then(() => loadEnrollments()); }
function updateEnrollment() { const id = document.getElementById('enrollmentId').value; const today = new Date().toISOString().split('T')[0]; const e = { enrollmentId: id, studentId: document.getElementById('enrollStudentId').value, courseId: document.getElementById('enrollCourseId').value, semester: parseInt(document.getElementById('semester').value), year: parseInt(document.getElementById('year').value), enrollmentDate: today }; fetch(`https://srms-web-pci5.onrender.com/api/enrollments/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(e) }).then(() => loadEnrollments()); }
function deleteEnrollment(id) { if(confirm("Delete this enrollment?")) fetch(`https://srms-web-pci5.onrender.com/api/enrollments/${id}`, { method: 'DELETE' }).then(() => loadEnrollments()); }
function editEnrollment(id, student, course, sem, year) { document.getElementById('enrollmentId').value = id; document.getElementById('enrollmentId').readOnly = true; document.getElementById('enrollStudentId').value = student; document.getElementById('enrollCourseId').value = course; document.getElementById('semester').value = sem; document.getElementById('year').value = year; document.getElementById('addEnrollmentBtn').style.display = 'none'; document.getElementById('updateEnrollmentBtn').style.display = 'inline-block'; document.getElementById('cancelEnrollmentBtn').style.display = 'inline-block'; }
function resetEnrollmentForm() { document.getElementById('enrollmentId').value = ''; document.getElementById('enrollmentId').readOnly = false; document.getElementById('enrollStudentId').value = ''; document.getElementById('enrollCourseId').value = ''; document.getElementById('semester').value = ''; document.getElementById('year').value = ''; document.getElementById('addEnrollmentBtn').style.display = 'inline-block'; document.getElementById('updateEnrollmentBtn').style.display = 'none'; document.getElementById('cancelEnrollmentBtn').style.display = 'none'; }

// RESULTS
function loadResultDropdown() { fetch('https://srms-web-pci5.onrender.com/api/enrollments').then(res => res.json()).then(data => { const select = document.getElementById('resultEnrollmentId'); select.innerHTML = '<option value="">-- Select Enrollment --</option>'; data.forEach(e => { select.innerHTML += `<option value="${e.enrollmentId}">${e.enrollmentId} (Student: ${e.studentId})</option>`; }); }); }
function calculateGrade() { const scoreInput = document.getElementById('score'); const score = parseInt(scoreInput.value); const gradeInput = document.getElementById('grade'); if (isNaN(score)) { gradeInput.value = ""; return; } if (score < 0 || score > 100) { alert("Invalid Score! Score must be between 0 and 100."); scoreInput.value = ""; gradeInput.value = ""; return; } let grade = ""; if (score >= 70) grade = "A"; else if (score >= 60) grade = "B"; else if (score >= 50) grade = "C"; else if (score >= 40) grade = "D"; else grade = "F"; gradeInput.value = grade; }
function loadResults() {
    resetResultForm();
    fetch('https://srms-web-pci5.onrender.com/api/results').then(res => res.json()).then(data => {
        const table = document.getElementById('resultTable'); table.innerHTML = '';
        data.forEach(r => { table.innerHTML += `<tr><td>${r.resultId}</td><td>${r.enrollmentId}</td><td>${r.score}</td><td>${r.grade}</td><td>${r.semester}</td><td>${r.year}</td><td><button class="btn btn-sm btn-warning me-1" onclick="editResult('${r.resultId}', '${r.enrollmentId}', '${r.score}', '${r.grade}', '${r.semester}', '${r.year}')">Edit</button><button class="btn btn-sm btn-danger" onclick="deleteResult('${r.resultId}')">Delete</button></td></tr>`; });
    });
}
function addResult() { const r = { resultId: document.getElementById('resultId').value, enrollmentId: document.getElementById('resultEnrollmentId').value, score: parseInt(document.getElementById('score').value), grade: document.getElementById('grade').value, semester: parseInt(document.getElementById('resultSemester').value), year: parseInt(document.getElementById('resultYear').value) }; fetch('https://srms-web-pci5.onrender.com/api/results', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(r) }).then(() => loadResults()); }
function updateResult() { const id = document.getElementById('resultId').value; const r = { resultId: id, enrollmentId: document.getElementById('resultEnrollmentId').value, score: parseInt(document.getElementById('score').value), grade: document.getElementById('grade').value, semester: parseInt(document.getElementById('resultSemester').value), year: parseInt(document.getElementById('resultYear').value) }; fetch(`https://srms-web-pci5.onrender.com/api/results/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(r) }).then(() => loadResults()); }
function deleteResult(id) { if(confirm("Delete this result?")) fetch(`https://srms-web-pci5.onrender.com/api/results/${id}`, { method: 'DELETE' }).then(() => loadResults()); }
function editResult(id, enrollment, score, grade, sem, year) { document.getElementById('resultId').value = id; document.getElementById('resultId').readOnly = true; document.getElementById('resultEnrollmentId').value = enrollment; document.getElementById('score').value = score; document.getElementById('grade').value = grade; document.getElementById('resultSemester').value = sem; document.getElementById('resultYear').value = year; document.getElementById('addResultBtn').style.display = 'none'; document.getElementById('updateResultBtn').style.display = 'inline-block'; document.getElementById('cancelResultBtn').style.display = 'inline-block'; }
function resetResultForm() { document.getElementById('resultId').value = ''; document.getElementById('resultId').readOnly = false; document.getElementById('resultEnrollmentId').value = ''; document.getElementById('score').value = ''; document.getElementById('grade').value = ''; document.getElementById('resultSemester').value = ''; document.getElementById('resultYear').value = ''; document.getElementById('addResultBtn').style.display = 'inline-block'; document.getElementById('updateResultBtn').style.display = 'none'; document.getElementById('cancelResultBtn').style.display = 'none'; }

// ALLOCATIONS (UPGRADED)
function loadAllocationDropdowns() {
    fetch('https://srms-web-pci5.onrender.com/api/courses').then(res => res.json()).then(data => { const select = document.getElementById('allocCourseId'); select.innerHTML = '<option value="">-- Select Course --</option>'; data.forEach(c => { select.innerHTML += `<option value="${c.courseId}">${c.courseId} - ${c.courseName}</option>`; }); });
    fetch('https://srms-web-pci5.onrender.com/api/tutors').then(res => res.json()).then(data => { const select = document.getElementById('allocTutorId'); select.innerHTML = '<option value="">-- Select Tutor --</option>'; data.forEach(t => { select.innerHTML += `<option value="${t.tutorId}">${t.tutorId} - ${t.firstName} ${t.lastName}</option>`; }); });
}

function loadAllocations() {
    resetAllocationForm();
    Promise.all([
        fetch('https://srms-web-pci5.onrender.com/api/courses').then(res => res.json()),
        fetch('https://srms-web-pci5.onrender.com/api/tutors').then(res => res.json()),
        fetch('https://srms-web-pci5.onrender.com/api/allocations').then(res => res.json())
    ]).then(([courses, tutors, allocations]) => {
        const table = document.getElementById('allocationTable'); table.innerHTML = '';
        allocations.forEach(a => {
            const course = courses.find(c => c.courseId === a.courseId);
            const tutor = tutors.find(t => t.tutorId === a.tutorId);
            const courseName = course ? course.courseName : a.courseId;
            const tutorName = tutor ? `${tutor.firstName} ${tutor.lastName}` : a.tutorId;
            table.innerHTML += `<tr>
                <td>${a.allocationId}</td>
                <td><strong>${courseName}</strong><br><small class="text-muted">${a.courseId}</small></td>
                <td>${tutorName}<br><small class="text-muted">${a.tutorId}</small></td>
                <td>${a.semester}</td>
                <td>${a.year}</td>
                <td>
                    <button class="btn btn-sm btn-warning me-1" onclick="editAllocation('${a.allocationId}', '${a.courseId}', '${a.tutorId}', '${a.semester}', '${a.year}')">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteAllocation('${a.allocationId}')">Delete</button>
                </td>
            </tr>`;
        });
    });
}
function addAllocation() { const a = { allocationId: document.getElementById('allocationId').value, courseId: document.getElementById('allocCourseId').value, tutorId: document.getElementById('allocTutorId').value, semester: parseInt(document.getElementById('allocSemester').value), year: parseInt(document.getElementById('allocYear').value) }; fetch('https://srms-web-pci5.onrender.com/api/allocations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(a) }).then(() => loadAllocations()); }
function updateAllocation() { const id = document.getElementById('allocationId').value; const a = { allocationId: id, courseId: document.getElementById('allocCourseId').value, tutorId: document.getElementById('allocTutorId').value, semester: parseInt(document.getElementById('allocSemester').value), year: parseInt(document.getElementById('allocYear').value) }; fetch(`https://srms-web-pci5.onrender.com/api/allocations/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(a) }).then(() => loadAllocations()); }
function deleteAllocation(id) { if(confirm("Delete this allocation?")) fetch(`https://srms-web-pci5.onrender.com/api/allocations/${id}`, { method: 'DELETE' }).then(() => loadAllocations()); }
function editAllocation(id, course, tutor, sem, year) { document.getElementById('allocationId').value = id; document.getElementById('allocationId').readOnly = true; document.getElementById('allocCourseId').value = course; document.getElementById('allocTutorId').value = tutor; document.getElementById('allocSemester').value = sem; document.getElementById('allocYear').value = year; document.getElementById('addAllocBtn').style.display = 'none'; document.getElementById('updateAllocBtn').style.display = 'inline-block'; document.getElementById('cancelAllocBtn').style.display = 'inline-block'; }
function resetAllocationForm() { document.getElementById('allocationId').value = ''; document.getElementById('allocationId').readOnly = false; document.getElementById('allocCourseId').value = ''; document.getElementById('allocTutorId').value = ''; document.getElementById('allocSemester').value = ''; document.getElementById('allocYear').value = ''; document.getElementById('addAllocBtn').style.display = 'inline-block'; document.getElementById('updateAllocBtn').style.display = 'none'; document.getElementById('cancelAllocBtn').style.display = 'none'; }

// REPORTS
function loadReportDropdown() { fetch('https://srms-web-pci5.onrender.com/api/students?size=2000').then(res => res.json()).then(data => { const select = document.getElementById('reportStudentSelect'); select.innerHTML = '<option value="">-- Select a Student --</option>'; data.content.forEach(s => { select.innerHTML += `<option value="${s.studentId}">${s.studentId} - ${s.firstName} ${s.lastName}</option>`; }); }); }
function generateTranscript() {
    const studentId = document.getElementById('reportStudentSelect').value; if (!studentId) { alert("Please select a student first!"); return; }
    const outputDiv = document.getElementById('transcriptOutput'); outputDiv.innerHTML = '<p>Loading transcript...</p>';
    fetch(`https://srms-web-pci5.onrender.com/api/reports/transcript/${studentId}`).then(res => res.json()).then(data => {
        if (data.error) { outputDiv.innerHTML = `<p style="color:red;">${data.error}</p>`; return; }
        const s = data.student; const enrollments = data.enrollments; const results = data.results;
        let html = `<div class="transcript-card"><div class="student-header"><h3>${s.firstName} ${s.lastName}</h3><p>ID: ${s.studentId} | Major: ${s.major}</p></div><table class="table table-bordered"><thead><tr><th>Course ID</th><th>Enrollment ID</th><th>Semester</th><th>Year</th><th>Score</th><th>Grade</th></tr></thead><tbody>`;
        let totalPoints = 0; let count = 0;
        enrollments.forEach(e => {
            const result = results.find(r => r.enrollmentId === e.enrollmentId);
            if (result) { if (result.grade === "A") totalPoints += 4.0; else if (result.grade === "B") totalPoints += 3.0; else if (result.grade === "C") totalPoints += 2.0; else if (result.grade === "D") totalPoints += 1.0; count++; }
            html += `<tr><td>${e.courseId}</td><td>${e.enrollmentId}</td><td>${e.semester}</td><td>${e.year}</td><td>${result ? result.score : "-"}</td><td>${result ? result.grade : "-"}</td></tr>`;
        });
        html += `</tbody></table>`;
        if (count > 0) html += `<div style="margin-top:20px; font-size:20px; font-weight:bold; color:#28a745;">Cumulative GPA: ${(totalPoints / count).toFixed(2)}</div>`;
        else html += `<div style="margin-top:20px; color:#7f8c8d;">No graded courses yet.</div>`;
        html += `</div>`; outputDiv.innerHTML = html;
    });
}
function downloadPdf() { const studentId = document.getElementById('reportStudentSelect').value; if (!studentId) { alert("Please select a student first!"); return; } window.location.href = `https://srms-web-pci5.onrender.com/api/reports/transcript/${studentId}/pdf`; }

// CHARTS
function loadCharts() {
    fetch('https://srms-web-pci5.onrender.com/api/students/stats/majors').then(res => res.json()).then(data => { if (majorChartInstance) majorChartInstance.destroy(); majorChartInstance = new Chart(document.getElementById('majorChart').getContext('2d'), { type: 'pie', data: { labels: Object.keys(data), datasets: [{ data: Object.values(data), backgroundColor: ['#38bdf8', '#28a745', '#f39c12', '#e74c3c', '#8e44ad', '#34495e'] }] }, options: { responsive: true, maintainAspectRatio: false } }); });
    fetch('https://srms-web-pci5.onrender.com/api/enrollments/stats/semesters').then(res => res.json()).then(data => { if (semesterChartInstance) semesterChartInstance.destroy(); semesterChartInstance = new Chart(document.getElementById('semesterChart').getContext('2d'), { type: 'bar', data: { labels: Object.keys(data), datasets: [{ label: 'Enrollments', data: Object.values(data), backgroundColor: '#1e293b' }] }, options: { responsive: true, maintainAspectRatio: false } }); });
}
// --- MOBILE SIDEBAR LOGIC ---
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    sidebar.classList.toggle('active');
    if (overlay) {
        overlay.classList.toggle('active');
    }
}

// Close sidebar when a link is clicked (on mobile)
document.querySelectorAll('.sidebar a').forEach(link => {
    link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            const sidebar = document.querySelector('.sidebar');
            const overlay = document.querySelector('.sidebar-overlay');
            sidebar.classList.remove('active');
            if (overlay) overlay.classList.remove('active');
        }
    });
});
// Close sidebar when a link is clicked on mobile
document.querySelectorAll('.sidebar a').forEach(link => {
    link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            document.querySelector('.sidebar').classList.remove('active');
        }
    });
});
function showStudentProfile(studentId) {
    const modalBody = document.getElementById('profileModalBody');
    modalBody.innerHTML = '<div class="text-center p-4"><div class="spinner-border text-primary"></div><p class="mt-2">Loading profile...</p></div>';
    
    const modal = new bootstrap.Modal(document.getElementById('studentProfileModal'));
    modal.show();

    fetch(`http://localhost:8080/api/reports/transcript/${studentId}`).then(res => res.json()).then(data => {
        if (data.error) { modalBody.innerHTML = `<div class="alert alert-danger">${data.error}</div>`; return; }
        
        const s = data.student; const enrollments = data.enrollments; const results = data.results;
        let totalPoints = 0; let count = 0;
        
        enrollments.forEach(e => { 
            const result = results.find(r => r.enrollmentId === e.enrollmentId); 
            if (result) { 
                if (result.grade === "A") totalPoints += 4.0; 
                else if (result.grade === "B") totalPoints += 3.0; 
                else if (result.grade === "C") totalPoints += 2.0; 
                else if (result.grade === "D") totalPoints += 1.0; 
                count++; 
            } 
        });
        
        const gpa = count > 0 ? (totalPoints / count).toFixed(2) : "N/A";
        
        let html = `<div class="row mb-4">
            <div class="col-md-8">
                <h3>${s.firstName} ${s.lastName}</h3>
                <p class="text-muted mb-1"><strong>ID:</strong> ${s.studentId}</p>
                <p class="text-muted mb-1"><strong>Major:</strong> ${s.major}</p>
                <p class="text-muted"><strong>Status:</strong> <span class="badge bg-success">${s.academicStatus}</span></p>
            </div>
            <div class="col-md-4 text-center">
                <div class="p-3 bg-light rounded shadow-sm">
                    <h5 class="text-muted mb-1">Cumulative GPA</h5>
                    <h1 class="text-success fw-bold mb-0">${gpa}</h1>
                </div>
            </div>
        </div>
        <h5 class="border-bottom pb-2">Enrolled Courses</h5>
        <table class="table table-sm table-striped mt-2">
            <thead><tr><th>Course ID</th><th>Semester</th><th>Score</th><th>Grade</th></tr></thead>
            <tbody>`;
            
        if (enrollments.length === 0) html += `<tr><td colspan="4" class="text-center text-muted">No enrollments.</td></tr>`;
        else { 
            enrollments.forEach(e => { 
                const result = results.find(r => r.enrollmentId === e.enrollmentId); 
                html += `<tr><td>${e.courseId}</td><td>Sem ${e.semester} (${e.year})</td><td>${result ? result.score : '-'}</td><td>${result ? `<span class="badge ${result.grade === 'F' ? 'bg-danger' : 'bg-primary'}">${result.grade}</span>` : '-'}</td></tr>`; 
            }); 
        }
        html += `</tbody></table>`;
        modalBody.innerHTML = html;
    });
}
