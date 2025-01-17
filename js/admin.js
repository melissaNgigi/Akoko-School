const express = require('express');
const router = express.Router();
const fs = require('fs');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');

// Store credentials in a JSON file (in production, use a proper database)
const CREDENTIALS_FILE = 'admin_credentials.json';

// Default credentials for first-time setup
const DEFAULT_CREDENTIALS = {
    username: 'admin',
    password: bcrypt.hashSync('admin123', 8)
};

// Initialize credentials file if it doesn't exist
if (!fs.existsSync(CREDENTIALS_FILE)) {
    console.log('Creating new credentials file with default admin/admin123');
    console.log('Default credentials:', DEFAULT_CREDENTIALS);
    fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify(DEFAULT_CREDENTIALS));
}

// Store fees in a JSON file (in production, use a proper database)
const FEES_FILE = 'fees.json';

// Initialize fees file if it doesn't exist
if (!fs.existsSync(FEES_FILE)) {
    fs.writeFileSync(FEES_FILE, JSON.stringify({
        form1_term1: 0, form1_term2: 0, form1_term3: 0,
        form2_term1: 0, form2_term2: 0, form2_term3: 0,
        form3_term1: 0, form3_term2: 0, form3_term3: 0,
        form4_term1: 0, form4_term2: 0, form4_term3: 0
    }));
}

// Staff management endpoints
const STAFF_FILE = 'staff.json';

// Initialize staff file if it doesn't exist
if (!fs.existsSync(STAFF_FILE)) {
    fs.writeFileSync(STAFF_FILE, JSON.stringify({
        mathematics: [],
        science: [],
        languages: [],
        humanities: [],
        technical: []
    }));
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'images/staff/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({ storage: storage });

// Check authentication status
router.get('/check-auth', (req, res) => {
    res.json({ authenticated: !!req.session.isAdmin });
});

// Login endpoint
router.post('/login', (req, res) => {
    console.log('Received login request:', req.body);
    const { username, password } = req.body;
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_FILE));
    console.log('Stored credentials username:', credentials.username);
    console.log('Stored password hash:', credentials.password);
    console.log('Attempting to match password:', password);

    if (username === credentials.username && 
        bcrypt.compareSync(password, credentials.password)) {
        console.log('Login successful');
        req.session.isAdmin = true;
        res.json({ success: true });
    } else {
        console.log('Login failed - username match:', username === credentials.username);
        console.log('Login failed - password match:', bcrypt.compareSync(password, credentials.password));
        res.json({ success: false });
    }
});

// Change credentials endpoint
router.post('/change-credentials', (req, res) => {
    if (!req.session.isAdmin) {
        return res.status(401).json({ 
            success: false, 
            message: 'Not authenticated' 
        });
    }

    const { currentPassword, newUsername, newPassword } = req.body;
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_FILE));

    // Verify current password
    if (!bcrypt.compareSync(currentPassword, credentials.password)) {
        return res.json({ 
            success: false, 
            message: 'Current password is incorrect' 
        });
    }

    // Update credentials
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    const newCredentials = {
        username: newUsername,
        password: hashedPassword
    };

    fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify(newCredentials));
    
    // Force re-login
    req.session.destroy();
    
    res.json({ success: true });
});

// Logout endpoint
router.post('/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// Get fees endpoint
router.get('/get-fees', (req, res) => {
    if (!req.session.isAdmin) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    try {
        const fees = JSON.parse(fs.readFileSync(FEES_FILE));
        res.json({ success: true, fees });
    } catch (error) {
        res.json({ success: false, message: 'Error reading fees data' });
    }
});

// Update fees endpoint
router.post('/update-fees', (req, res) => {
    console.log('Received update fees request:', req.body);
    if (!req.session.isAdmin) {
        console.log('Not authenticated');
        return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    try {
        const { fees } = req.body;
        if (!fees) {
            throw new Error('No fees data received');
        }
        console.log('Writing fees to file:', fees);
        fs.writeFileSync(FEES_FILE, JSON.stringify(fees, null, 2));
        console.log('Fees updated successfully');
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating fees:', error);
        res.status(500).json({ success: false, message: error.message || 'Error updating fees' });
    }
});

// Add this new endpoint for public access to fees
router.get('/public-fees', (req, res) => {
    try {
        const fees = JSON.parse(fs.readFileSync(FEES_FILE));
        res.json({ success: true, fees });
    } catch (error) {
        res.json({ success: false, message: 'Error reading fees data' });
    }
});

router.get('/get-staff', (req, res) => {
    try {
        const staff = JSON.parse(fs.readFileSync(STAFF_FILE));
        res.json({ 
            success: true, 
            staff: staff[req.query.department] || [] 
        });
    } catch (error) {
        res.json({ success: false, message: 'Error reading staff data' });
    }
});

router.get('/get-staff-member', (req, res) => {
    try {
        const staff = JSON.parse(fs.readFileSync(STAFF_FILE));
        const member = staff[req.query.department].find(s => s.id === req.query.id);
        res.json({ success: true, staff: member });
    } catch (error) {
        res.json({ success: false, message: 'Error reading staff data' });
    }
});

router.post('/update-staff', upload.single('photo'), (req, res) => {
    if (!req.session.isAdmin) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    try {
        const staff = JSON.parse(fs.readFileSync(STAFF_FILE));
        const { id, department, name, position, qualifications } = req.body;
        
        let staffMember = {
            id: id || `${department}${Date.now()}`,
            name,
            position,
            qualifications,
            image: req.file ? `/images/staff/${req.file.filename}` : 'default_teacher.jpg'
        };

        if (id) {
            // Update existing staff member
            const index = staff[department].findIndex(s => s.id === id);
            if (index !== -1) {
                if (!req.file) {
                    staffMember.image = staff[department][index].image;
                }
                staff[department][index] = staffMember;
            }
        } else {
            // Add new staff member
            staff[department].push(staffMember);
        }

        fs.writeFileSync(STAFF_FILE, JSON.stringify(staff, null, 2));
        res.json({ success: true });
    } catch (error) {
        res.json({ success: false, message: 'Error updating staff' });
    }
});

router.post('/delete-staff', (req, res) => {
    if (!req.session.isAdmin) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    try {
        const staff = JSON.parse(fs.readFileSync(STAFF_FILE));
        const { id, department } = req.body;
        
        staff[department] = staff[department].filter(s => s.id !== id);
        fs.writeFileSync(STAFF_FILE, JSON.stringify(staff, null, 2));
        
        res.json({ success: true });
    } catch (error) {
        res.json({ success: false, message: 'Error deleting staff' });
    }
});

module.exports = router; 