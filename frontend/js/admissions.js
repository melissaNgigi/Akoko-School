// Load admissions summary from MongoDB
async function loadAdmissions() {
  try {
    const res = await fetch('/admin/admissions', {
      credentials: 'include'
    });
    const { success, admissions } = await res.json();
    if (!success) throw new Error('Failed to load admissions');

    document.getElementById('appCount').textContent  = admissions.applications;
    document.getElementById('accCount').textContent  = admissions.accepted;
    document.getElementById('rejCount').textContent  = admissions.rejected;
    document.getElementById('pendCount').textContent = admissions.pending;
  } catch (err) {
    console.error('Error loading admissions data:', err);
    alert('Error loading admissions data');
  }
}

// Update admissions
async function updateAdmissions(e) {
  e.preventDefault();
  const data = {
    applications: parseInt(document.getElementById('applications').value),
    accepted:     parseInt(document.getElementById('accepted').value),
    rejected:     parseInt(document.getElementById('rejected').value),
    pending:      parseInt(document.getElementById('pending').value)
  };

  const token = localStorage.getItem('token');
  try {
    const res = await fetch('/admin/update-admissions', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (result.success) {
      alert('Admissions updated');
      loadAdmissions();
    } else {
      alert('Update failed: ' + result.message);
    }
  } catch (err) {
    console.error('Error updating admissions:', err);
    alert('Error updating admissions');
  }
}

document.getElementById('admissionsForm').addEventListener('submit', updateAdmissions);
document.addEventListener('DOMContentLoaded', loadAdmissions);

// ─── PUBLIC: Load & display admissions summary on admissions.html ─────────
async function loadAdmissionsSummary() {
  try {
    const res = await fetch('/admin/admissions');
    const { success, admissions } = await res.json();
    if (!success) throw new Error('Failed to load admissions');

    // ensure you have these IDs in your HTML:
    // <span id="appCount"></span>, <span id="accCount"></span> etc.
    document.getElementById('appCount').textContent  = admissions.applications;
    document.getElementById('accCount').textContent  = admissions.accepted;
    document.getElementById('rejCount').textContent  = admissions.rejected;
    document.getElementById('pendCount').textContent = admissions.pending;
  } catch(err) {
    console.error('Error loading admissions summary:', err);
  }
}
document.addEventListener('DOMContentLoaded', loadAdmissionsSummary); 