// ─── PUBLIC: Load & display enrollment on enrollment.html ───────────────────
async function loadEnrollmentData() {
  try {
    const res = await fetch('/admin/enrollment', { credentials: 'include' });
    const { success, years } = await res.json();
    if (!success) throw new Error('Failed to load enrollment');

    // sort ascending by year
    const sorted = years.sort((a,b)=> a.year - b.year);
    const tbody  = document.getElementById('enrollment-data');
    if (!tbody) throw new Error('#enrollment-data container not found');

    // build a simple table
    const table = document.createElement('table');
    table.innerHTML = `
      <thead>
        <tr><th>Year</th><th>Boys</th><th>Girls</th><th>Total</th></tr>
      </thead>
      <tbody>
        ${sorted.map(r=>`
          <tr>
            <td>${r.year}</td>
            <td>${r.boys}</td>
            <td>${r.girls}</td>
            <td>${r.total}</td>
          </tr>`).join('')}
      </tbody>
    `;
    tbody.appendChild(table);
  } catch(err) {
    console.error('Error loading enrollment data:', err);
  }
}
document.addEventListener('DOMContentLoaded', loadEnrollmentData); 

async function updateEnrollment(e) {
  try {
    const res = await fetch('/admin/update-enrollment', {
      credentials: 'include',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        year: e.target.value
      })
    });
    if (!res.ok) throw new Error('Failed to update enrollment');

    // Handle the response
    console.log('Enrollment updated successfully');
  } catch(err) {
    console.error('Error updating enrollment:', err);
  }
} 