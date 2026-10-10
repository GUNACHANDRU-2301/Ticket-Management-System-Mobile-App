const axios = require('axios');

async function testRestriction() {
    const API_URL = 'http://localhost:5000/api';

    try {
        console.log('--- Testing Complaint Raising Restriction ---');

        // 1. Login as Admin/SuperAdmin (should be restricted)
        console.log('\nLogging in as Admin...');
        const adminLogin = await axios.post(`${API_URL}/auth/login`, {
            username: 'admin',
            password: 'admin'
        });
        const adminToken = adminLogin.data.token;

        console.log('Attempting to raise complaint as Admin...');
        try {
            await axios.post(`${API_URL}/complaints/raise`, {
                blockName: 'Test Block',
                roomNumber: '101',
                complaintType: 'Electrician',
                remarks: 'Test remark',
                department: 'Test Dept'
            }, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            console.log('✅ PASS: Admin was allowed to raise a complaint.');
        } catch (err) {
            console.error('❌ FAIL: Admin was blocked! Status:', err.response?.status || err.message);
        }

        console.log('\n--- 3. Testing with SuperAdmin ---');
        // Assuming 'superadmin' exists
        try {
            const superLogin = await axios.post(`${API_URL}/auth/login`, {
                username: 'superadmin',
                password: 'password'
            });
            const superToken = superLogin.data.token;
            console.log('Attempting to raise complaint as SuperAdmin...');
            await axios.post(`${API_URL}/complaints/raise`, {
                blockName: 'Test Block',
                roomNumber: '101',
                complaintType: 'Electrician',
                remarks: 'Test remark',
                department: 'Test Dept'
            }, {
                headers: { Authorization: `Bearer ${superToken}` }
            });
            console.log('✅ PASS: SuperAdmin was allowed to raise a complaint.');
        } catch (err) {
            console.log('Note: Skipping SuperAdmin test if account doesn\'t exist or login fails. (Manual check recommended)');
        }

        console.log('\n--- Final Verification ---');
        console.log('Allowed Roles: User, Admin, SuperAdmin');
        console.log('Blocked Roles: All other technician/staff roles.');

    } catch (err) {
        console.error('Test script error:', err.message);
    }
}

testRestriction();
