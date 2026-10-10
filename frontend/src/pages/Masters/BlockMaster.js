import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlusCircle, FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';

const BlockMaster = () => {
    const [departments, setDepartments] = useState([]);
    const [programmes, setProgrammes] = useState([]);
    const [blocks, setBlocks] = useState([]);

    const [deptId, setDeptId] = useState('');
    const [progId, setProgId] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const [editDeptId, setEditDeptId] = useState('');
    const [editProgId, setEditProgId] = useState('');

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [deptRes, progRes, blockRes] = await Promise.all([
                axios.get('http://localhost:5000/api/masters/departments', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('http://localhost:5000/api/masters/programmes', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('http://localhost:5000/api/masters/blocks', { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setDepartments(deptRes.data);
            setProgrammes(progRes.data);
            setBlocks(blockRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/masters/blocks',
                { departmentId: deptId, programmeId: progId, name },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setName('');
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Error saving block');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`http://localhost:5000/api/masters/blocks/${id}`,
                { departmentId: editDeptId, programmeId: editProgId, name: editName },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setEditingId(null);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Error updating block');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this block?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/masters/blocks/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Error deleting block');
        }
    };

    return (
        <div style={{ padding: '40px 60px', flex: 1 }} className="animate-fade-in">
            <h1 style={{ fontSize: '2.5rem', marginBottom: '40px' }}>Block Master</h1>

            <div className="glass" style={{ padding: '40px', marginBottom: '40px', borderRadius: '24px' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '25px', color: '#fff' }}>Add New Infrastructure Block</h3>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '25px', alignItems: 'flex-end' }}>
                    <div className="input-group" style={{ marginBottom: '0' }}>
                        <label className="input-label">Department</label>
                        <select className="input-field" value={deptId} onChange={(e) => setDeptId(e.target.value)} required>
                            <option value="">Select Department</option>
                            {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                        </select>
                    </div>
                    <div className="input-group" style={{ marginBottom: '0' }}>
                        <label className="input-label">Programme</label>
                        <select className="input-field" value={progId} onChange={(e) => setProgId(e.target.value)} required disabled={!deptId}>
                            <option value="">Select Programme</option>
                            {programmes.filter(p => p.departmentId?._id === deptId || p.departmentId === deptId).map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div className="input-group" style={{ marginBottom: '0' }}>
                        <label className="input-label">Block Name</label>
                        <input type="text" className="input-field" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Main Block" />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ height: '52px' }}>
                        <FaPlusCircle /> {loading ? 'Saving...' : 'Add'}
                    </button>
                </form>
            </div>

            <div className="glass" style={{ padding: '30px', borderRadius: '24px' }}>
                <table className="premium-table">
                    <thead>
                        <tr>
                            <th>Department</th>
                            <th>Programme</th>
                            <th>Block Name</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {blocks.map((block) => (
                            <tr key={block._id}>
                                <td>
                                    {editingId === block._id ? (
                                        <select className="input-field" value={editDeptId} onChange={(e) => setEditDeptId(e.target.value)} style={{ padding: '8px', marginBottom: 0 }}>
                                            {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                                        </select>
                                    ) : block.departmentId?.name}
                                </td>
                                <td>
                                    {editingId === block._id ? (
                                        <select className="input-field" value={editProgId} onChange={(e) => setEditProgId(e.target.value)} style={{ padding: '8px', marginBottom: 0 }}>
                                            {programmes.filter(p => p.departmentId?._id === editDeptId || p.departmentId === editDeptId).map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                                        </select>
                                    ) : block.programmeId?.name}
                                </td>
                                <td style={{ fontWeight: '600', color: '#fff' }}>
                                    {editingId === block._id ? (
                                        <input type="text" className="input-field" value={editName} onChange={(e) => setEditName(e.target.value)} style={{ padding: '8px', marginBottom: 0 }} />
                                    ) : block.name}
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        {editingId === block._id ? (
                                            <>
                                                <button className="btn btn-primary" onClick={() => handleUpdate(block._id)} style={{ padding: '8px' }}><FaCheck /></button>
                                                <button className="btn btn-ghost" onClick={() => setEditingId(null)} style={{ padding: '8px' }}><FaTimes /></button>
                                            </>
                                        ) : (
                                            <>
                                                <button className="btn btn-ghost" onClick={() => {
                                                    setEditingId(block._id);
                                                    setEditName(block.name);
                                                    setEditDeptId(block.departmentId?._id);
                                                    setEditProgId(block.programmeId?._id);
                                                }} style={{ padding: '8px' }}><FaEdit /></button>
                                                <button className="btn btn-ghost" onClick={() => handleDelete(block._id)} style={{ padding: '8px', color: 'var(--accent)' }}><FaTrash /></button>
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

export default BlockMaster;
