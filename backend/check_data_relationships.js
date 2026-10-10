const mongoose = require('mongoose');
const Department = require('./models/Department');
const Programme = require('./models/Programme');
const Block = require('./models/Block');
const Room = require('./models/Room');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('MongoDB Connected');

        const depts = await Department.find();
        const progs = await Programme.find();
        const blocks = await Block.find().populate('departmentId programmeId');
        const rooms = await Room.find().populate('departmentId programmeId blockId');

        console.log('--- Departments ---');
        console.log(JSON.stringify(depts, null, 2));

        console.log('--- Programmes ---');
        console.log(JSON.stringify(progs, null, 2));

        console.log('--- Blocks ---');
        console.log(JSON.stringify(blocks, null, 2));

        console.log('--- Rooms ---');
        console.log(JSON.stringify(rooms, null, 2));

        process.exit(0);
    })
    .catch(err => {
        console.error('Connection error:', err);
        process.exit(1);
    });
