// Function to load and display enrollment data
async function loadEnrollmentData() {
    try {
        const response = await fetch('https://akoko-backend.onrender.com/admin/enrollment');
        const data = await response.json();
        
        if (data.success && data.years) {
            // Sort years in ascending order
            const sortedYears = data.years.sort((a, b) => a.year - b.year);
            
            // Get the container where you want to display the data
            const container = document.getElementById('enrollment-data');
            
            // Create a table or whatever format you want
            const table = document.createElement('table');
            table.innerHTML = `
                <thead>
                    <tr>
                        <th>Year</th>
                        <th>Boys</th>
                        <th>Girls</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${sortedYears.map(year => `
                        <tr>
                            <td>${year.year}</td>
                            <td>${year.boys}</td>
                            <td>${year.girls}</td>
                            <td>${year.total}</td>
                        </tr>
                    `).join('')}
                </tbody>
            `;
            
            container.appendChild(table);
        }
    } catch (error) {
        console.error('Error loading enrollment data:', error);
    }
}

// Load enrollment data when the page loads
document.addEventListener('DOMContentLoaded', loadEnrollmentData); 