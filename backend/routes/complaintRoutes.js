const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');

// Re-configure storage here to use in the route if needed, 
// but since it's simple we can just pass the configured 'upload' from server.js 
// or define it here for modularity. Usually modularity is better.

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

const auth = require('../middleware/auth');

// POST /api/complaints/raise
router.post('/raise', auth, upload.single('attachment'), async (req, res) => {
    try {
        const userRole = (req.user?.role || '').trim();
        if (!['User', 'Users', 'Admin', 'SuperAdmin'].includes(userRole)) {
            return res.status(403).json({ message: 'Only users, admins, and superadmins can raise complaints' });
        }

        const { blockName, roomNumber, complaintType, remarks, department } = req.body;

        const newComplaint = new Complaint({
            blockName,
            roomNumber,
            complaintType,
            remarks,
            raisedBy: req.user.id,
            department,
            attachment: req.file ? `/uploads/${req.file.filename}` : null,
            status: 'Pending'
        });

        await newComplaint.save();
        res.status(201).json({ message: 'Complaint raised successfully', complaint: newComplaint });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error while raising complaint' });
    }
});

// Removed duplicate GET /api/complaints

// GET /api/complaints/stats
router.get('/stats', async (req, res) => {
    try {
        const { role: rawRole, userId } = req.query;
        const role = rawRole?.trim().toLowerCase();
        let query = {};

        if (['superadmin', 'admin'].includes(role)) {
            query = {};
        } else if (role === 'user') {
            query = { raisedBy: userId };
        } else {
            // Technician roles see tickets matching their role OR assigned to them
            query = {
                $or: [
                    { complaintType: { $regex: new RegExp(`^${rawRole}$`, 'i') } },
                    { assignedTo: userId }
                ]
            };
        }

        const total = await Complaint.countDocuments(query);
        const pending = await Complaint.countDocuments({ ...query, status: 'Pending' });
        const assigned = await Complaint.countDocuments({ ...query, status: 'Assigned' });
        const closed = await Complaint.countDocuments({ ...query, status: 'Completed' });

        res.json({ total, pending, assigned, closed });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching stats' });
    }
});

// GET /api/complaints/recent
router.get('/recent', async (req, res) => {
    try {
        const { role: rawRole, userId } = req.query;
        const role = rawRole?.trim().toLowerCase();
        let query = {};

        if (['superadmin', 'admin'].includes(role)) {
            query = {};
        } else if (role === 'user') {
            query = { raisedBy: userId };
        } else {
            query = {
                $or: [
                    { complaintType: { $regex: new RegExp(`^${rawRole}$`, 'i') } },
                    { assignedTo: userId }
                ]
            };
        }

        const complaints = await Complaint.find(query)
            .populate('raisedBy', 'username')
            .sort({ createdAt: -1 })
            .limit(5);
        res.json(complaints);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching recent activity' });
    }
});

// GET /api/complaints
router.get('/', async (req, res) => {
    try {
        const { role: rawRole, userId } = req.query;
        const role = rawRole?.trim().toLowerCase();
        let query = {};

        if (['superadmin', 'admin'].includes(role)) {
            query = {};
        } else if (role === 'user') {
            query = { raisedBy: userId };
        } else {
            query = {
                $or: [
                    { complaintType: { $regex: new RegExp(`^${rawRole}$`, 'i') } },
                    { assignedTo: userId }
                ]
            };
        }

        const complaints = await Complaint.find(query)
            .populate('raisedBy', 'username')
            .sort({ createdAt: -1 });
        res.json(complaints);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching complaints' });
    }
});

// GET /api/complaints/technicians (SuperAdmin only to see possible assignees)
router.get('/technicians', async (req, res) => {
    try {
        // Fetch all users who are NOT SuperAdmin or basic User
        const technicians = await User.find({
            role: { $nin: ['SuperAdmin', 'User'] }
        }).select('username role');
        res.json(technicians);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching technicians' });
    }
});

// PATCH /api/complaints/:id/assign
router.patch('/:id/assign', async (req, res) => {
    try {
        const { assignedTo } = req.body;
        const complaint = await Complaint.findByIdAndUpdate(
            req.params.id,
            { assignedTo, status: 'Assigned' },
            { new: true }
        ).populate('assignedTo', 'username');

        if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
        res.json(complaint);
    } catch (err) {
        res.status(500).json({ message: 'Error assigning complaint' });
    }
});

// PATCH /api/complaints/:id/status
router.get('/all', async (req, res) => {
    try {
        const complaints = await Complaint.find()
            .populate('raisedBy', 'username')
            .populate('assignedTo', 'username')
            .sort({ createdAt: -1 });
        res.json(complaints);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching reports' });
    }
});

router.patch('/:id/status', auth, async (req, res) => {
    try {
        const { status } = req.body;
        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

        // Authorization check: Only assigned staff or Admins/SuperAdmins
        const assignedId = complaint.assignedTo?._id ? complaint.assignedTo._id.toString() : complaint.assignedTo?.toString();
        const isAssigned = assignedId === req.user.id;
        const isAdmin = ['Admin', 'SuperAdmin'].includes(req.user.role);

        if (!isAssigned && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized to update this ticket status' });
        }

        complaint.status = status;
        await complaint.save();

        res.json(complaint);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating status' });
    }
});

module.exports = router;
