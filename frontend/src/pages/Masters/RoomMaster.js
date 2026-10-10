import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlusCircle, FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';

const RoomMaster = () => {
    const [departments, setDepartments] = useState([]);
    const [programmes, setProgrammes] = useState([]);
    const [blocks, setBlocks] = useState([]);
    const [rooms, setRooms] = useState([]);

    const [formData, setFormData] = useState({
        departmentId: '',
        programmeId: '',
        blockId: '',
        roomNumber: ''
    });
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({
        departmentId: '',
        programmeId: '',
        blockId: '',
        roomNumber: ''
    });

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [deptRes, progRes, blockRes, roomRes] = await Promise.all([
                axios.get('http://localhost:5000/api/masters/departments', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('http://localhost:5000/api/masters/programmes', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('http://localhost:5000/api/masters/blocks', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('http://localhost:5000/api/masters/rooms', { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setDepartments(deptRes.data);
            setProgrammes(progRes.data);
            setBlocks(blockRes.data);
            setRooms(roomRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/masters/rooms',
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setFormData({ ...formData, roomNumber: '' });
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Error saving room');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (id) => {
        // This function was provided in the instruction but was incomplete.
        // Assuming the intent was to update the room data based on editData.
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`http://localhost:5000/api/masters/rooms/${id}`,
                editData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setEditingId(null);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Error updating room');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this room?')) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/masters/rooms/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Error deleting room');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '40px 60px', flex: 1 }} className="animate-fade-in">
            <h1 style={{ fontSize: '2.5rem', marginBottom: '40px' }}>Room Master</h1>

            <div className="glass" style={{ padding: '40px', marginBottom: '40px', borderRadius: '24px' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '25px', color: '#fff' }}>Register New Space</h3>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '25px', alignItems: 'flex-end' }}>
                    <div className="input-group" style={{ marginBottom: '0' }}>
                        <label className="input-label">Department</label>
                        <select className="input-field" name="departmentId" value={formData.departmentId} onChange={handleChange} required>
                            <option value="">Select Dept</option>
                            {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                        </select>
                    </div>
                    <div className="input-group" style={{ marginBottom: '0' }}>
                        <label className="input-label">Programme</label>
                        <select className="input-field" name="programmeId" value={formData.programmeId} onChange={handleChange} required disabled={!formData.departmentId}>
                            <option value="">Select Prog</option>
                            {programmes.filter(p => p.departmentId?._id === formData.departmentId || p.departmentId === formData.departmentId).map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div className="input-group" style={{ marginBottom: '0' }}>
                        <label className="input-label">Block</label>
                        <select className="input-field" name="blockId" value={formData.blockId} onChange={handleChange} required disabled={!formData.programmeId}>
                            <option value="">Select Block</option>
                            {blocks.filter(b => b.programmeId?._id === formData.programmeId || b.programmeId === formData.programmeId).map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                        </select>
                    </div>
                    <div className="input-group" style={{ marginBottom: '0' }}>
                        <label className="input-label">Room Number</label>
                        <input type="text" className="input-field" name="roomNumber" value={formData.roomNumber} onChange={handleChange} required placeholder="123" />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ height: '52px' }}>
                        {loading ? '...' : <FaPlusCircle />}
                    </button>
                </form>
            </div>

            <div className="glass" style={{ padding: '30px', borderRadius: '24px' }}>
                <table className="premium-table">
                    <thead>
                        <tr>
                            <th>Department</th>
                            <th>Programme</th>
                            <th>Block</th>
                            <th>Room</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rooms.map((room) => (
                            <tr key={room._id}>
                                <td>
                                    {editingId === room._id ? (
                                        <select className="input-field" value={editData.departmentId} onChange={(e) => setEditData({ ...editData, departmentId: e.target.value, programmeId: '', blockId: '' })} style={{ padding: '8px', marginBottom: 0 }}>
                                            {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                                        </select>
                                    ) : (room.departmentId?.shortName || room.departmentId?.name)}
                                </td>
                                <td>
                                    {editingId === room._id ? (
                                        <select className="input-field" value={editData.programmeId} onChange={(e) => setEditData({ ...editData, programmeId: e.target.value, blockId: '' })} style={{ padding: '8px', marginBottom: 0 }} disabled={!editData.departmentId}>
                                            <option value="">Select Prog</option>
                                            {programmes.filter(p => p.departmentId?._id === editData.departmentId || p.departmentId === editData.departmentId).map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                                        </select>
                                    ) : (room.programmeId?.shortName || room.programmeId?.name)}
                                </td>
                                <td>
                                    {editingId === room._id ? (
                                        <select className="input-field" value={editData.blockId} onChange={(e) => setEditData({ ...editData, blockId: e.target.value })} style={{ padding: '8px', marginBottom: 0 }} disabled={!editData.programmeId}>
                                            <option value="">Select Block</option>
                                            {blocks.filter(b => b.programmeId?._id === editData.programmeId || b.programmeId === editData.programmeId).map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                                        </select>
                                    ) : room.blockId?.name}
                                </td>
                                <td style={{ fontWeight: '700', color: 'var(--secondary)' }}>
                                    {editingId === room._id ? (
                                        <input type="text" className="input-field" value={editData.roomNumber} onChange={(e) => setEditData({ ...editData, roomNumber: e.target.value })} style={{ padding: '8px', marginBottom: 0 }} />
                                    ) : room.roomNumber}
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        {editingId === room._id ? (
                                            <>
                                                <button className="btn btn-primary" onClick={() => handleUpdate(room._id)} style={{ padding: '8px' }}><FaCheck /></button>
                                                <button className="btn btn-ghost" onClick={() => setEditingId(null)} style={{ padding: '8px' }}><FaTimes /></button>
                                            </>
                                        ) : (
                                            <>
                                                <button className="btn btn-ghost" onClick={() => {
                                                    setEditingId(room._id);
                                                    setEditData({
                                                        departmentId: room.departmentId?._id,
                                                        programmeId: room.programmeId?._id,
                                                        blockId: room.blockId?._id,
                                                        roomNumber: room.roomNumber
                                                    });
                                                }} style={{ padding: '8px' }}><FaEdit /></button>
                                                <button className="btn btn-ghost" onClick={() => handleDelete(room._id)} style={{ padding: '8px', color: 'var(--accent)' }}><FaTrash /></button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RoomMaster;
