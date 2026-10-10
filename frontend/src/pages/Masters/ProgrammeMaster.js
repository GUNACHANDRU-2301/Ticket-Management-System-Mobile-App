import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlusCircle, FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';

const ProgrammeMaster = () => {
    const [programmes, setProgrammes] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [deptId, setDeptId] = useState('');
    const [name, setName] = useState('');
    const [shortName, setShortName] = useState('');
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const [editShortName, setEditShortName] = useState('');
    const [editDeptId, setEditDeptId] = useState('');

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [progRes, deptRes] = await Promise.all([
                axios.get('http://localhost:5000/api/masters/programmes', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('http://localhost:5000/api/masters/departments', { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setProgrammes(progRes.data);
            setDepartments(deptRes.data);
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
            await axios.post('http://localhost:5000/api/masters/programmes',
                { departmentId: deptId, name, shortName },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setName('');
            setShortName('');
            setDeptId('');
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Error saving programme');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`http://localhost:5000/api/masters/programmes/${id}`,
                { departmentId: editDeptId, name: editName, shortName: editShortName },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setEditingId(null);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Error updating programme');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this programme?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/masters/programmes/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Error deleting programme');
        }
    };

    return (
        <div style={{ padding: '40px 60px', flex: 1 }} className="animate-fade-in">
            <h1 style={{ fontSize: '2.5rem', marginBottom: '40px' }}>Programme Master</h1>

            <div className="glass" style={{ padding: '40px', marginBottom: '40px', borderRadius: '24px' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '25px', color: '#fff' }}>Add New Academic Plan</h3>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr auto', gap: '25px', alignItems: 'flex-end' }}>
                    <div className="input-group" style={{ marginBottom: '0' }}>
                        <label className="input-label">Department</label>
                        <select className="input-field" value={deptId} onChange={(e) => setDeptId(e.target.value)} required>
                            <option value="">Select Department</option>
                            {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                        </select>
                    </div>
                    <div className="input-group" style={{ marginBottom: '0' }}>
                        <label className="input-label">Programme Name</label>
                        <input type="text" className="input-field" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Bachelor of Technology" />
                    </div>
                    <div className="input-group" style={{ marginBottom: '0' }}>
                        <label className="input-label">Short Name</label>
                        <input type="text" className="input-field" value={shortName} onChange={(e) => setShortName(e.target.value)} required placeholder="e.g. B.Tech" />
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
                            <th>Short Name</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {programmes.map((prog) => (
                            <tr key={prog._id}>
                                <td>
                                    {editingId === prog._id ? (
                                        <select className="input-field" value={editDeptId} onChange={(e) => setEditDeptId(e.target.value)} style={{ padding: '8px', marginBottom: 0 }}>
                                            {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                                        </select>
                                    ) : prog.departmentId?.name}
                                </td>
                                <td style={{ fontWeight: '600', color: '#fff' }}>
                                    {editingId === prog._id ? (
                                        <input type="text" className="input-field" value={editName} onChange={(e) => setEditName(e.target.value)} style={{ padding: '8px', marginBottom: 0 }} />
                                    ) : prog.name}
                                </td>
                                <td>
                                    {editingId === prog._id ? (
                                        <input type="text" className="input-field" value={editShortName} onChange={(e) => setEditShortName(e.target.value)} style={{ padding: '8px', marginBottom: 0 }} />
                                    ) : (
                                        <span className="glass-pill" style={{ padding: '4px 12px', fontSize: '0.8rem', color: 'var(--secondary)' }}>
                                            {prog.shortName}
                                        </span>
                                    )}
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        {editingId === prog._id ? (
                                            <>
                                                <button className="btn btn-primary" onClick={() => handleUpdate(prog._id)} style={{ padding: '8px' }}><FaCheck /></button>
                                                <button className="btn btn-ghost" onClick={() => setEditingId(null)} style={{ padding: '8px' }}><FaTimes /></button>
                                            </>
                                        ) : (
                                            <>
                                                <button className="btn btn-ghost" onClick={() => {
                                                    setEditingId(prog._id);
                                                    setEditName(prog.name);
                                                    setEditShortName(prog.shortName);
                                                    setEditDeptId(prog.departmentId?._id);
                                                }} style={{ padding: '8px' }}><FaEdit /></button>
                                                <button className="btn btn-ghost" onClick={() => handleDelete(prog._id)} style={{ padding: '8px', color: 'var(--accent)' }}><FaTrash /></button>
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

export default ProgrammeMaster;
