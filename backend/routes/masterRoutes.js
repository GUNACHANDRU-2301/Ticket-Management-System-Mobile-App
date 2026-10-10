const express = require('express');
const router = express.Router();
const Department = require('../models/Department');
const Programme = require('../models/Programme');
const Block = require('../models/Block');
const Room = require('../models/Room');
const Role = require('../models/Role');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Middleware to check if user is SuperAdmin or Admin
const isSuperAdmin = (req, res, next) => {
    const role = req.user?.role;
    if (!role) {
        console.warn('isSuperAdmin: Access denied, role missing in req.user.');
        return res.status(401).json({ message: 'Authorization error: Role not found.' });
    }

    const normalizedRole = role.trim().toLowerCase();
    if (!['superadmin', 'admin'].includes(normalizedRole)) {
        console.warn(`isSuperAdmin: Access denied for role: ${role}`);
        return res.status(403).json({ message: 'Access denied. Administrator privileges required.' });
    }
    next();
};

// --- Department Routes ---
router.get('/departments', auth, async (req, res) => {
    try {
        const departments = await Department.find();
        res.json(departments);
    } catch (err) {
        console.error(`Error in masterRoutes:`, err);
        res.status(500).json({ message: err.message });
    }
});

router.post('/departments', auth, isSuperAdmin, async (req, res) => {
    const { name, shortName } = req.body;
    try {
        const newDept = new Department({ name, shortName });
        await newDept.save();
        res.status(201).json(newDept);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.patch('/departments/:id', auth, isSuperAdmin, async (req, res) => {
    try {
        const { name, shortName } = req.body;
        const updatedDept = await Department.findByIdAndUpdate(
            req.params.id,
            { name, shortName },
            { new: true }
        );
        if (!updatedDept) return res.status(404).json({ message: 'Department not found' });
        res.json(updatedDept);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.delete('/departments/:id', auth, isSuperAdmin, async (req, res) => {
    try {
        const dept = await Department.findByIdAndDelete(req.params.id);
        if (!dept) return res.status(404).json({ message: 'Department not found' });
        res.json({ message: 'Department deleted successfully' });
    } catch (err) {
        console.error(`Error in masterRoutes:`, err);
        res.status(500).json({ message: err.message });
    }
});

// --- Programme Routes ---
router.get('/programmes', auth, async (req, res) => {
    try {
        const programmes = await Programme.find().populate('departmentId');
        res.json(programmes);
    } catch (err) {
        console.error(`Error in masterRoutes:`, err);
        res.status(500).json({ message: err.message });
    }
});

router.post('/programmes', auth, isSuperAdmin, async (req, res) => {
    const { departmentId, name, shortName } = req.body;
    try {
        const newProg = new Programme({ departmentId, name, shortName });
        await newProg.save();
        res.status(201).json(newProg);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.patch('/programmes/:id', auth, isSuperAdmin, async (req, res) => {
    try {
        const { departmentId, name, shortName } = req.body;
        const updated = await Programme.findByIdAndUpdate(
            req.params.id,
            { departmentId, name, shortName },
            { new: true }
        ).populate('departmentId');
        if (!updated) return res.status(404).json({ message: 'Programme not found' });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.delete('/programmes/:id', auth, isSuperAdmin, async (req, res) => {
    try {
        const deleted = await Programme.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Programme not found' });
        res.json({ message: 'Programme deleted successfully' });
    } catch (err) {
        console.error(`Error in masterRoutes:`, err);
        res.status(500).json({ message: err.message });
    }
});

// --- Block Routes ---
router.get('/blocks', auth, async (req, res) => {
    try {
        const blocks = await Block.find().populate('departmentId programmeId');
        res.json(blocks);
    } catch (err) {
        console.error(`Error in masterRoutes:`, err);
        res.status(500).json({ message: err.message });
    }
});

router.post('/blocks', auth, isSuperAdmin, async (req, res) => {
    const { departmentId, programmeId, name } = req.body;
    try {
        const newBlock = new Block({ departmentId, programmeId, name });
        await newBlock.save();
        res.status(201).json(newBlock);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.patch('/blocks/:id', auth, isSuperAdmin, async (req, res) => {
    try {
        const { departmentId, programmeId, name } = req.body;
        const updated = await Block.findByIdAndUpdate(
            req.params.id,
            { departmentId, programmeId, name },
            { new: true }
        ).populate('departmentId programmeId');
        if (!updated) return res.status(404).json({ message: 'Block not found' });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.delete('/blocks/:id', auth, isSuperAdmin, async (req, res) => {
    try {
        const deleted = await Block.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Block not found' });
        res.json({ message: 'Block deleted successfully' });
    } catch (err) {
        console.error(`Error in masterRoutes:`, err);
        res.status(500).json({ message: err.message });
    }
});

// --- Room Routes ---
router.get('/rooms', auth, async (req, res) => {
    try {
        const rooms = await Room.find().populate('departmentId programmeId blockId');
        res.json(rooms);
    } catch (err) {
        console.error(`Error in masterRoutes:`, err);
        res.status(500).json({ message: err.message });
    }
});

router.post('/rooms', auth, isSuperAdmin, async (req, res) => {
    const { departmentId, programmeId, blockId, roomNumber } = req.body;
    try {
        const newRoom = new Room({ departmentId, programmeId, blockId, roomNumber });
        await newRoom.save();
        res.status(201).json(newRoom);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.patch('/rooms/:id', auth, isSuperAdmin, async (req, res) => {
    try {
        const { departmentId, programmeId, blockId, roomNumber } = req.body;
        const updated = await Room.findByIdAndUpdate(
            req.params.id,
            { departmentId, programmeId, blockId, roomNumber },
            { new: true }
        ).populate('departmentId programmeId blockId');
        if (!updated) return res.status(404).json({ message: 'Room not found' });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.delete('/rooms/:id', auth, isSuperAdmin, async (req, res) => {
    try {
        const deleted = await Room.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Room not found' });
        res.json({ message: 'Room deleted successfully' });
    } catch (err) {
        console.error(`Error in masterRoutes:`, err);
        res.status(500).json({ message: err.message });
    }
});

// --- Role Routes ---
router.get('/roles', auth, async (req, res) => {
    try {
        const roles = await Role.find();
        res.json(roles);
    } catch (err) {
        console.error(`Error in masterRoutes:`, err);
        res.status(500).json({ message: err.message });
    }
});

router.post('/roles', auth, isSuperAdmin, async (req, res) => {
    const { name } = req.body;
    try {
        const newRole = new Role({ name });
        await newRole.save();
        res.status(201).json(newRole);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.patch('/roles/:id', auth, isSuperAdmin, async (req, res) => {
    try {
        const { name } = req.body;
        const updated = await Role.findByIdAndUpdate(
            req.params.id,
            { name },
            { new: true }
        );
        if (!updated) return res.status(404).json({ message: 'Role not found' });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.delete('/roles/:id', auth, isSuperAdmin, async (req, res) => {
    try {
        const deleted = await Role.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Role not found' });
        res.json({ message: 'Role deleted successfully' });
    } catch (err) {
        console.error(`Error in masterRoutes:`, err);
        res.status(500).json({ message: err.message });
    }
});

// --- User Routes ---
router.get('/users', auth, isSuperAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        console.error(`Error in masterRoutes:`, err);
        res.status(500).json({ message: err.message });
    }
});

router.post('/users', auth, isSuperAdmin, async (req, res) => {
    const { username, password, phone, email, role, department, programme } = req.body;
    try {
        const newUser = new User({ username, password, phone, email, role, department, programme });
        await newUser.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.patch('/users/:id', auth, isSuperAdmin, async (req, res) => {
    try {
        const { username, phone, email, role, department, programme } = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { username, phone, email, role, department, programme },
            { new: true }
        ).select('-password');
        if (!updatedUser) return res.status(404).json({ message: 'User not found' });
        res.json(updatedUser);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.delete('/users/:id', auth, isSuperAdmin, async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error(`Error in masterRoutes:`, err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
