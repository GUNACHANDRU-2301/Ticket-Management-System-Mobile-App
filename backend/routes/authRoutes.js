const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: 'User not found' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id, role: user.role, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, role: user.role, username: user.username, userId: user._id });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create SuperAdmin (Used for initial setup)
router.post('/register-superadmin', async (req, res) => {
    const { username, password, email } = req.body;
    try {
        // Check if a superadmin already exists
        const count = await User.countDocuments({ role: 'SuperAdmin' });
        if (count > 0) return res.status(400).json({ message: 'SuperAdmin already exists' });

        const newSuperAdmin = new User({
            username,
            password,
            email,
            role: 'SuperAdmin'
        });

        await newSuperAdmin.save();
        res.status(201).json({ message: 'SuperAdmin created successfully' });
    } catch (err) {
        console.error('SuperAdmin Registration Error:', err);
        res.status(500).json({ message: 'Error creating SuperAdmin' });
    }
});

module.exports = router;
