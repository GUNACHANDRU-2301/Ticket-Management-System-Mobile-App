const axios = require('axios');

async function test() {
    try {
        // Login to get token
        console.log('Logging in...');
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            username: 'admin',
            password: 'admin'
        });
        const token = loginRes.data.token;
        console.log('Login successful');

        const headers = { Authorization: `Bearer ${token}` };

        console.log('Fetching blocks...');
        const blocksRes = await axios.get('http://localhost:5000/api/masters/blocks', { headers });
        console.log('Blocks Data Sample:', JSON.stringify(blocksRes.data.slice(0, 1), null, 2));

        console.log('Fetching rooms...');
        const roomsRes = await axios.get('http://localhost:5000/api/masters/rooms', { headers });
        console.log('Rooms Data Sample:', JSON.stringify(roomsRes.data.slice(0, 1), null, 2));

    } catch (err) {
        console.error('Test failed:', err.response?.data || err.message);
    }
}

test();
