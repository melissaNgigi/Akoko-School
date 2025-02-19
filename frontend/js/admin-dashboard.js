// Tab functionality
function initializeTabs() {
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    console.log('Initializing tabs, found:', tabs.length, 'tabs');

    // Hide all tab contents initially
    tabContents.forEach(content => content.style.display = 'none');

    // Show the first tab by default
    if (tabContents.length > 0) {
        tabContents[0].style.display = 'block';
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            console.log('Tab clicked:', tabId);
            
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));

            // Hide all tab contents
            tabContents.forEach(content => content.style.display = 'none');

            // Add active class to clicked tab
            tab.classList.add('active');

            // Show corresponding content
            const content = document.getElementById(tabId);
            if (content) {
                content.style.display = 'block';
                if (tabId === 'board') {
                    console.log('Loading board members after tab switch');
                    loadBoardMembers();
                }
            }
        });
    });
}

// Load current fees
async function loadCurrentFees() {
    try {
        const response = await fetch('/admin/fees');
        const data = await response.json();

        // Populate form fields with current values
        document.getElementById('boarding_term1').value = data['boarding.term1'];
        document.getElementById('boarding_term2').value = data['boarding.term2'];
        document.getElementById('boarding_term3').value = data['boarding.term3'];
        document.getElementById('day_term1').value = data['day.term1'];
        document.getElementById('day_term2').value = data['day.term2'];
        document.getElementById('day_term3').value = data['day.term3'];
    } catch (error) {
        console.error('Error loading fees:', error);
        alert('Error loading current fees data');
    }
}

// Initialize fees form
function initFeesForm() {
    document.getElementById('feesForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const fees = {
            boarding_term1: parseInt(document.getElementById('boarding_term1').value),
            boarding_term2: parseInt(document.getElementById('boarding_term2').value),
            boarding_term3: parseInt(document.getElementById('boarding_term3').value),
            day_term1: parseInt(document.getElementById('day_term1').value),
            day_term2: parseInt(document.getElementById('day_term2').value),
            day_term3: parseInt(document.getElementById('day_term3').value)
        };

        try {
            const response = await fetch('/admin/update-fees', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(fees)
            });

            const result = await response.json();
            
            if (result.success) {
                alert('Fees updated successfully');
            } else {
                alert('Failed to update fees: ' + result.message);
            }
        } catch (error) {
            console.error('Error updating fees:', error);
            alert('Error updating fees: ' + error.message);
        }
    });
}

// Load board members
async function loadBoardMembers() {
    try {
        const response = await fetch('/admin/board-members');
        const data = await response.json();
        
        if (data.success && data.members) {
            // Pre-fill with existing board members
            document.getElementById('chairperson_name').value = 'Dr. Ruth Otieno';
            document.getElementById('chairperson_role').value = 'Overall leadership and governance of the school board';
            
            document.getElementById('secretary_name').value = 'Mr. John Ojeya';
            document.getElementById('secretary_role').value = 'School administration and board secretary';
            
            document.getElementById('vice_chairman_name').value = 'Mr. David Marenya';
            document.getElementById('vice_chairman_role').value = 'Support chairman and oversee strategic planning';
            
            document.getElementById('pa_chairman_name').value = 'Mr. Willis Moyi';
            document.getElementById('pa_chairman_role').value = 'Support chairman and oversee strategic planning';
            
            document.getElementById('sdce_name').value = 'Mr. Alfred Mwaiba';
            document.getElementById('sdce_role').value = 'Support chairman and oversee strategic planning';
            
            // Fill in regular members
            const regularMembers = [
                'Mr. Matthews Obwong\'',
                'Mr. Francis Agalo',
                'Mr. Ambrose Opiyo',
                'Mrs. Jane Ongong\'a',
                'Rev. Patrick Ochieng\'',
                'Mr. Antony Orege'
            ];
            
            regularMembers.forEach((name, index) => {
                document.getElementById(`member${index + 1}_name`).value = name;
            });
        }
    } catch (error) {
        console.error('Error loading board members:', error);
    }
}

// Handle board member form submission
document.getElementById('boardMemberForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    try {
        const boardMembers = [
            {
                id: "1",
                name: document.getElementById('chairperson_name').value,
                position: "Board Chairperson",
                role: document.getElementById('chairperson_role').value
            },
            {
                id: "2",
                name: document.getElementById('secretary_name').value,
                position: "Principal (Secretary)",
                role: document.getElementById('secretary_role').value
            },
            {
                id: "3",
                name: document.getElementById('vice_chairman_name').value,
                position: "Vice Chairman",
                role: document.getElementById('vice_chairman_role').value
            },
            {
                id: "4",
                name: document.getElementById('pa_chairman_name').value,
                position: "P.A Chairman",
                role: document.getElementById('pa_chairman_role').value
            },
            {
                id: "5",
                name: document.getElementById('sdce_name').value,
                position: "SDCE",
                role: document.getElementById('sdce_role').value
            }
        ];

        // Add regular members
        for (let i = 0; i < 6; i++) {
            const memberName = document.getElementById(`member${i + 1}_name`).value;
            if (memberName) {
                boardMembers.push({
                    id: (i + 6).toString(),
                    name: memberName,
                    position: "Member",
                    role: "Board Member"
                });
            }
        }

        console.log('Sending board members update:', boardMembers);

        const response = await fetch('/admin/update-board-member', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ members: boardMembers })
        });
        console.log('the data is reaching here');

        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || `Server error: ${response.status}`);
        }

        if (result.success) {
            alert('Board members updated successfully');
        } else {
            throw new Error(result.message || 'Failed to update board members');
        }
    } catch (error) {
        console.error('Error updating board members:', error);
        alert('Error updating board members: ' + error.message);
    }
});

// Load current HODs
async function loadCurrentHODs() {
    try {
        const response = await fetch('/admin/staff');
        const data = await response.json();

        if (data.success && data.staff) {
            const dept = document.getElementById('currentDepartment').value || 'mathematics';
            if (data.staff[dept]) {
                document.getElementById('hodName').value = data.staff[dept].name;
            }
        }
    } catch (error) {
        console.error('Error loading HODs:', error);
    }
}

// Handle department tab clicks
const deptTabs = document.querySelectorAll('.dept-tab');
deptTabs.forEach(tab => {
    tab.addEventListener('click', async () => {
        // Update active tab
        deptTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Get department and update form
        const dept = tab.getAttribute('data-dept');
        document.getElementById('currentDepartment').value = dept;

        try {
            const response = await fetch('/admin/staff');
            const data = await response.json();

            if (data.success && data.staff && data.staff[dept]) {
                document.getElementById('hodName').value = data.staff[dept].name;
            }
        } catch (error) {
            console.error(`Error loading HOD for ${dept}:`, error);
        }
    });
});

// Handle HOD form submission
document.getElementById('hodForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const department = document.getElementById('currentDepartment').value;
    const hodName = document.getElementById('hodName').value;

    try {
        const response = await fetch('/admin/update-hod', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                department: department,
                name: hodName
            })
        });

        const result = await response.json();
        if (result.success) {
            alert('HOD updated successfully');
            // Stay on the same tab
            const currentTab = document.querySelector('.dept-tab.active');
            if (currentTab) {
                currentTab.click(); // Refresh the current department's data
            }
        } else {
            alert('Failed to update HOD: ' + result.message);
        }
    } catch (error) {
        console.error('Error updating HOD:', error);
        alert('Error updating HOD');
    }
});

// Add logout functionality
function initLogout() {
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
            try {
                const response = await fetch('/admin/logout', {
                    method: 'POST'
                });

                if (response.ok) {
                    window.location.href = '/admin/login.html';
                } else {
                    alert('Error logging out');
                }
            } catch (error) {
                console.error('Error logging out:', error);
                alert('Error logging out');
            }
        });
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    initializeTabs();
    loadCurrentFees();
    initFeesForm();
    loadCurrentHODs();
    loadBoardMembers();
    initLogout();

    // Set initial department
    if (deptTabs.length > 0) {
        deptTabs[0].click();
    }

    console.log('Page loaded, checking if board tab is active');
    const boardTab = document.getElementById('board');
    if (boardTab && boardTab.style.display !== 'none') {
        console.log('Board tab is active, loading members');
        loadBoardMembers();
    }
}); 