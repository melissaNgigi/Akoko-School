// Admin main functionality
function initLogout() {
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
            try {
                const response = await fetch('https://akoko-backend.onrender.com/admin/logout', {
                    method: 'POST'
                });
                if (response.ok) {
                    window.location.href = '/admin/login';
                }
            } catch (error) {
                console.error('Error logging out:', error);
            }
        });
    }
} 