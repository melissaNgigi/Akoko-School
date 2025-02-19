// Function to load HOD data from CMS
async function loadHODData() {
    try {
        const response = await fetch('/api/departments/hods');
        const data = await response.json();
        
        // Update each department's HOD information
        const departments = ['math', 'science', 'languages', 'humanities', 'technical'];
        
        departments.forEach(dept => {
            const hodInfo = document.getElementById(`${dept}HodInfo`);
            if (hodInfo && data[dept]) {
                hodInfo.innerHTML = `
                    <p>${data[dept].name}</p>
                    <p>${data[dept].qualifications}</p>
                    <p>${data[dept].experience} years experience</p>
                `;
            }
        });
        
    } catch (error) {
        console.error('Error loading HOD data:', error);
    }
}

// Load data when page loads
document.addEventListener('DOMContentLoaded', loadHODData); 