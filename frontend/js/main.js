document.addEventListener('DOMContentLoaded', function() {
    const menuBtn = document.querySelector('.menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const dropdowns = document.querySelectorAll('.dropdown');
    const nestedDropdowns = document.querySelectorAll('.nested-dropdown');

    // Toggle mobile menu
    menuBtn.addEventListener('click', () => {
        console.log('Menu button clicked');  // Debug log
        navLinks.classList.toggle('active');
        menuBtn.textContent = navLinks.classList.contains('active') ? '✕' : '☰';
    });

    // Handle dropdowns on mobile
    dropdowns.forEach(dropdown => {
        dropdown.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                e.stopPropagation();
                
                // Close other dropdowns
                dropdowns.forEach(d => {
                    if (d !== dropdown) {
                        d.classList.remove('active');
                    }
                });
                
                dropdown.classList.toggle('active');
                
                // Allow clicking on direct links inside dropdowns
                const directLink = e.target.closest('a');
                if (directLink && !directLink.nextElementSibling) {
                    window.location.href = directLink.href;
                }
            }
        });
        
        // Add click handler for dropdown links
        const links = dropdown.querySelectorAll('.dropdown-content a');
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                if (window.innerWidth <= 768) {
                    e.stopPropagation();
                }
            });
        });
    });

    // Handle nested dropdowns on mobile
    nestedDropdowns.forEach(nested => {
        nested.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                e.stopPropagation();
                nested.classList.toggle('active');
            }
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navLinks.contains(e.target) && !menuBtn.contains(e.target)) {
            navLinks.classList.remove('active');
            menuBtn.textContent = '☰';
            
            // Close all dropdowns
            dropdowns.forEach(dropdown => {
                dropdown.classList.remove('active');
            });
        }
    });
});

// Function to load board members
async function loadBoardMembers() {
    try {
        const response = await fetch('https://akoko-backend.onrender.com/admin/board-members');
        const data = await response.json();
        
        if (data.success && data.members) {
            const tbody = document.querySelector('.members-table tbody');
            if (tbody) {
                tbody.innerHTML = ''; // Clear existing content
                
                data.members.forEach(member => {
                    tbody.innerHTML += `
                        <tr>
                            <td>${member.name}</td>
                            <td>${member.position}</td>
                            <td>${member.role || ''}</td>
                        </tr>
                    `;
                });
            }
        }
    } catch (error) {
        console.error('Error loading board members:', error);
    }
}

// Load board members when page loads
document.addEventListener('DOMContentLoaded', loadBoardMembers); 