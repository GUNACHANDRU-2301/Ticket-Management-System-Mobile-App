const mongoose = require('mongoose');

const BlockSchema = new mongoose.Schema({
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    programmeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Programme', required: true },
    name: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Block', BlockSchema);
