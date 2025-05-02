// Populate the <select id="deptSelect"> with department names
async function loadDepartments() {
  try {
    // Fetch the list of all departments from your backend
    const res = await fetch('/admin/departments', {
      credentials: 'include'
    });
    const { success, departments } = await res.json();
    if (!success) throw new Error('Failed to load departments');

    // Build <option> elements and insert into the <select>
    const sel = document.getElementById('deptSelect');
    sel.innerHTML = departments
      .map(d => `<option value="${d}">${d[0].toUpperCase() + d.slice(1)}</option>`)
      .join('');
  } catch (err) {
    console.error('Error loading departments:', err);
    alert('Error loading departments');
  }
}

// Kick things off on page load
document.addEventListener('DOMContentLoaded', loadDepartments);

// ─── PUBLIC: Get HOD (head-of-dept) per page on departments.html ────────────
async function loadHODData() {
  try {
    // map filenames → department key
    const map = {
      'mathematics.html':'mathematics',
      'science.html':    'science',
      'languages.html':  'languages',
      'humanities.html': 'humanities',
      'technical.html':  'technical',
      'academics.html':  'academics',
      'boarding.html':   'boarding',
      'games.html':      'games'
    };
    const page = window.location.pathname.split('/').pop();
    const dept = map[page];
    if (!dept) throw new Error(`No department for ${page}`);

    const res  = await fetch(`/admin/staff?department=${dept}`, { credentials: 'include' });
    const { success, staff } = await res.json();
    const p    = document.querySelector('.hod-info p');
    if (!p) throw new Error('.hod-info p not found');

    if (success && Array.isArray(staff) && staff.length>0) {
      p.textContent = staff[0].name;
    } else {
      p.textContent = 'Not assigned';
    }
  } catch(err) {
    console.error('Error loading HOD data:', err);
    const p = document.querySelector('.hod-info p');
    if(p) p.textContent = 'Error loading HOD';
  }
}
document.addEventListener('DOMContentLoaded', loadHODData); 