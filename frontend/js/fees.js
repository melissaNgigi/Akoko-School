// ─── PUBLIC: Load & update fees for a department on fees.html ─────────────
async function loadCurrentFees() {
  try {
    const res = await fetch('/admin/get-fees?department=default', {
      credentials: 'include'
    });
    const { success, fees } = await res.json();
    if (!success) throw new Error('Failed to load fees');

    document.getElementById('boarding_term1').value = fees.boarding_term1;
    document.getElementById('boarding_term2').value = fees.boarding_term2;
    document.getElementById('boarding_term3').value = fees.boarding_term3;
    document.getElementById('day_term1').value     = fees.day_term1;
    document.getElementById('day_term2').value     = fees.day_term2;
    document.getElementById('day_term3').value     = fees.day_term3;
  } catch (err) {
    console.error('Error loading fees:', err);
    alert('Error loading current fees data');
  }
}

document.getElementById('feesForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = {
    boarding_term1: parseInt(document.getElementById('boarding_term1').value),
    boarding_term2: parseInt(document.getElementById('boarding_term2').value),
    boarding_term3: parseInt(document.getElementById('boarding_term3').value),
    day_term1:     parseInt(document.getElementById('day_term1').value),
    day_term2:     parseInt(document.getElementById('day_term2').value),
    day_term3:     parseInt(document.getElementById('day_term3').value),
  };

  const token = localStorage.getItem('token');
  if (!token) {
    alert('Not authenticated. Please log in.');
    return;
  }

  try {
    const res = await fetch('/admin/update-fees', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        department: 'default',
        fees: formData
      })
    });

    const result = await res.json();
    if (result.success) {
      alert('Fees updated successfully');
    } else {
      alert('Failed to update fees: ' + result.message);
    }
  } catch (error) {
    console.error('Error updating fees:', error);
    alert('Error updating fees');
  }
});

document.addEventListener('DOMContentLoaded', loadCurrentFees); 