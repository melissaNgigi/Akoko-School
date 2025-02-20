const API_URL = 'https://akoko-backend.onrender.com';

async function loadEnrollmentData() {
    try {
        const response = await fetch(`${API_URL}/admin/enrollment`);
        const data = await response.json();
        // ... rest of the function remains the same
    }
} 