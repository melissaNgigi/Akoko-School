// ─── LOGIN / AUTH SETUP ───────────────────────────────────────────────────────
// (login.html → this runs first)
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async e => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    try {
      const res = await fetch('/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const { success, token, message } = await res.json();
      if (success && token) {
        localStorage.setItem('token', token);
        window.location.href = '/admin/dashboard.html';
      } else {
        alert(message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      alert('Error logging in');
    }
  });
}

// ─── TAB NAVIGATION ───────────────────────────────────────────────────────────
function initializeTabs() {
  const tabs     = document.querySelectorAll('.tab');
  const contents = document.querySelectorAll('.tab-content');
  contents.forEach(c => (c.style.display = 'none'));
  if (contents[0]) contents[0].style.display = 'block';

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => (c.style.display = 'none'));

      tab.classList.add('active');
      const pane = document.getElementById(target);
      if (pane) pane.style.display = 'block';
    });
  });
}

// ─── AUTH HELPERS ─────────────────────────────────────────────────────────────
function getAuthHeaders() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/admin/login.html';
    throw new Error('No token');
  }
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type':  'application/json',
    'Accept':        'application/json'
  };
}

async function api(url, opts = {}) {
  const res = await fetch(url, {
    ...opts,
    headers: { ...(opts.headers || {}), ...getAuthHeaders() },
    credentials: 'include'
  });
  if (res.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/admin/login.html';
    throw new Error('Unauthorized');
  }
  return res.json();
}

// ─── FEES ────────────────────────────────────────────────────────────────────
async function loadAdminFees() {
  try {
    const { success, fees } = await api('/admin/get-fees?department=default');
    if (!success) throw new Error();
    ['boarding_term1','boarding_term2','boarding_term3','day_term1','day_term2','day_term3']
      .forEach(id => document.getElementById(id).value = fees[id] || '');
  } catch (err) {
    console.error('Error loading fees:', err);
    alert('Error loading current fees data');
  }
}

async function submitAdminFees(e) {
  e.preventDefault();
  const data = {
    boarding_term1: +document.getElementById('boarding_term1').value,
    boarding_term2: +document.getElementById('boarding_term2').value,
    boarding_term3: +document.getElementById('boarding_term3').value,
    day_term1:       +document.getElementById('day_term1').value,
    day_term2:       +document.getElementById('day_term2').value,
    day_term3:       +document.getElementById('day_term3').value
  };
  try {
    const { success, message } = await api('/admin/update-fees', {
      method: 'POST',
      body: JSON.stringify({ department: 'default', fees: data })
    });
    alert(success ? 'Fees saved' : 'Error: '+message);
    if (success) loadAdminFees();
  } catch (err) {
    console.error('Error updating fees:', err);
    alert('Error updating fees');
  }
}

// ─── DEPARTMENTS & HOD ───────────────────────────────────────────────────────
async function loadAdminDepartments() {
  try {
    const { success, departments } = await api('/admin/departments');
    if (!success) throw new Error();
    document.getElementById('deptSelect').innerHTML =
      departments.map(d => `<option value="${d}">${d[0].toUpperCase()+d.slice(1)}</option>`).join('');
  } catch (err) {
    console.error('Error loading departments:', err);
    alert('Error loading departments');
  }
}

async function loadAdminHOD(dept) {
  try {
    const { success, staff } = await api(`/admin/staff?department=${dept}`);
    document.getElementById('hodInput').value = (success && staff[0]?.name) || 'Not assigned';
  } catch (err) {
    console.error('Error loading HOD:', err);
    document.getElementById('hodInput').value = 'Error';
  }
}

async function submitAdminHOD(e) {
  e.preventDefault();
  const dept = document.getElementById('deptSelect').value;
  const name = document.getElementById('hodInput').value.trim();
  try {
    const { success, message } = await api('/admin/update-hod', {
      method: 'POST',
      body: JSON.stringify({ department: dept, name })
    });
    alert(success ? 'HOD saved' : 'Error: '+message);
    if (success) loadAdminHOD(dept);
  } catch (err) {
    console.error('Error updating HOD:', err);
    alert('Error updating HOD');
  }
}

// ─── ENROLLMENT ──────────────────────────────────────────────────────────────
async function loadAdminEnrollment() {
  try {
    const { success, years } = await api('/admin/enrollment');
    if (!success) throw new Error();
    document.getElementById('enrollTableBody').innerHTML =
      years.map(y => `<tr>
        <td>${y.year}</td><td>${y.boys}</td><td>${y.girls}</td><td>${y.total}</td>
      </tr>`).join('');
  } catch (err) {
    console.error('Error loading enrollment:', err);
    alert('Error loading enrollment data');
  }
}

async function submitAdminEnrollment(e) {
  e.preventDefault();
  const years = Array.from(document.querySelectorAll('.year-row')).map(r => ({
    year:  r.querySelector('.inp-year').value,
    boys:  +r.querySelector('.inp-boys').value,
    girls: +r.querySelector('.inp-girls').value
  }));
  try {
    const { success, message } = await api('/admin/update-enrollment', {
      method: 'POST',
      body: JSON.stringify({ years })
    });
    alert(success ? 'Enrollment saved' : 'Error: '+message);
    if (success) loadAdminEnrollment();
  } catch (err) {
    console.error('Error updating enrollment:', err);
    alert('Error updating enrollment');
  }
}

// ─── ADMISSIONS ──────────────────────────────────────────────────────────────
async function loadAdminAdmissions() {
  try {
    const { success, admissions } = await api('/admin/admissions');
    if (!success) throw new Error();
    document.getElementById('appCount').textContent  = admissions.applications;
    document.getElementById('accCount').textContent  = admissions.accepted;
    document.getElementById('rejCount').textContent  = admissions.rejected;
    document.getElementById('pendCount').textContent = admissions.pending;
  } catch (err) {
    console.error('Error loading admissions:', err);
    alert('Error loading admissions data');
  }
}

async function submitAdminAdmissions(e) {
  e.preventDefault();
  const data = {
    applications: +document.getElementById('applications').value,
    accepted:     +document.getElementById('accepted').value,
    rejected:     +document.getElementById('rejected').value,
    pending:      +document.getElementById('pending').value
  };
  try {
    const { success, message } = await api('/admin/update-admissions', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    alert(success ? 'Admissions saved' : 'Error: '+message);
    if (success) loadAdminAdmissions();
  } catch (err) {
    console.error('Error updating admissions:', err);
    alert('Error updating admissions');
  }
}

// ─── BOARD MEMBERS ───────────────────────────────────────────────────────────
async function loadAdminBoardMembers() {
  try {
    const { success, members } = await api('/admin/board-members');
    if (success) {
      // fill your board-member inputs here from members[]
    }
  } catch (err) {
    console.error('Error loading board members:', err);
  }
}

async function submitAdminBoardMembers(e) {
  e.preventDefault();
  const members = []; // collect your inputs
  try {
    const { success, message } = await api('/admin/update-board-member', {
      method: 'POST',
      body: JSON.stringify({ members })
    });
    alert(success ? 'Board members saved' : 'Error: '+message);
  } catch (err) {
    console.error('Error updating board members:', err);
    alert('Error updating board members');
  }
}

// ─── HOOK UP ALL FORMS & INITIAL LOAD ───────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  if (window.location.pathname.endsWith('dashboard.html')) {
    await api('/admin/check-auth');
    initializeTabs();

    // Fees
    loadAdminFees();
    document.getElementById('feesForm')?.addEventListener('submit', submitAdminFees);

    // Departments & HOD
    await loadAdminDepartments();
    loadAdminHOD(document.getElementById('deptSelect').value);
    document.getElementById('deptSelect')?.addEventListener('change', e => loadAdminHOD(e.target.value));
    document.getElementById('hodForm')?.addEventListener('submit', submitAdminHOD);

    // Enrollment
    loadAdminEnrollment();
    document.getElementById('enrollForm')?.addEventListener('submit', submitAdminEnrollment);

    // Admissions
    loadAdminAdmissions();
    document.getElementById('admissionsForm')?.addEventListener('submit', submitAdminAdmissions);

    // Board Members
    loadAdminBoardMembers();
    document.getElementById('boardMemberForm')?.addEventListener('submit', submitAdminBoardMembers);
  }
}); 