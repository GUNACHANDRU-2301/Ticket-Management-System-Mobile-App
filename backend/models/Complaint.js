const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
    blockName: { type: String, required: true },
    roomNumber: { type: String, required: true },
    complaintType: { type: String, required: true },
    remarks: { type: String },
    attachment: { type: String }, // Path or URL
    raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['Pending', 'Assigned', 'In-Progress', 'On-Hold', 'Completed'], default: 'Pending' },
    department: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Complaint', ComplaintSchema);
