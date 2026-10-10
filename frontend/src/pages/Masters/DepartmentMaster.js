import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlusCircle, FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';

const DepartmentMaster = () => {
    const [departments, setDepartments] = useState([]);
    const [name, setName] = useState('');
    const [shortName, setShortName] = useState('');
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const [editShortName, setEditShortName] = useState('');

    const fetchDepartments = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/masters/departments', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDepartments(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/masters/departments',
                { name, shortName },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setName('');
            setShortName('');
            fetchDepartments();
        } catch (err) {
            alert(err.response?.data?.message || 'Error saving department');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`http://localhost:5000/api/masters/departments/${id}`,
                { name: editName, shortName: editShortName },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setEditingId(null);
            fetchDepartments();
        } catch (err) {
            alert(err.response?.data?.message || 'Error updating department');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this department?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/masters/departments/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchDepartments();
        } catch (err) {
            const errorMsg = err.response?.data?.message || `Error deleting department (${err.response?.status || 'Network Error'})`;
            alert(errorMsg);
        }
    };

    return (
        <div style={{ padding: '40px 60px', flex: 1 }} className="animate-fade-in">
            <h1 style={{ fontSize: '2.5rem', marginBottom: '40px' }}>Department Master</h1>

            <div className="glass" style={{ padding: '40px', marginBottom: '40px', borderRadius: '24px' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '25px', color: '#fff' }}>Add New Architecture</h3>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '25px', alignItems: 'flex-end' }}>
                    <div className="input-group" style={{ marginBottom: '0' }}>
                        <label className="input-label">Department Name</label>
                        <input type="text" className="input-field" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Computer Science" />
                    </div>
                    <div className="input-group" style={{ marginBottom: '0' }}>
                        <label className="input-label">Short Name</label>
                        <input type="text" className="input-field" value={shortName} onChange={(e) => setShortName(e.target.value)} required placeholder="e.g. CS" />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ height: '52px' }}>
                        <FaPlusCircle /> {loading ? 'Saving...' : 'Add Department'}
                    </button>
                </form>
            </div>

            <div className="glass" style={{ padding: '30px', borderRadius: '24px' }}>
                <table className="premium-table">
                    <thead>
                        <tr>
                            <th>Department</th>
                            <th>Short Name</th>
                            <th>Created At</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {departments.map((dept) => (
                            <tr key={dept._id}>
                                <td style={{ fontWeight: '600', color: '#fff' }}>
                                    {editingId === dept._id ? (
                                        <input type="text" className="input-field" value={editName} onChange={(e) => setEditName(e.target.value)} style={{ padding: '8px', marginBottom: 0 }} />
                                    ) : dept.name}
                                </td>
                                <td>
                                    {editingId === dept._id ? (
                                        <input type="text" className="input-field" value={editShortName} onChange={(e) => setEditShortName(e.target.value)} style={{ padding: '8px', marginBottom: 0 }} />
                                    ) : (
                                        <span className="glass-pill" style={{ padding: '4px 12px', fontSize: '0.8rem', color: 'var(--secondary)' }}>
                                            {dept.shortName}
                                        </span>
                                    )}
                                </td>
                                <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                    {new Date(dept.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        {editingId === dept._id ? (
                                            <>
                                                <button className="btn btn-primary" onClick={() => handleUpdate(dept._id)} style={{ padding: '8px' }}><FaCheck /></button>
                                                <button className="btn btn-ghost" onClick={() => setEditingId(null)} style={{ padding: '8px' }}><FaTimes /></button>
                                            </>
                                        ) : (
                                            <>
                                                <button className="btn btn-ghost" onClick={() => {
                                                    setEditingId(dept._id);
                                                    setEditName(dept.name);
                                                    setEditShortName(dept.shortName);
                                                }} style={{ padding: '8px' }}><FaEdit /></button>
                                                <button className="btn btn-ghost" onClick={() => handleDelete(dept._id)} style={{ padding: '8px', color: 'var(--accent)' }}><FaTrash /></button>
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

export default DepartmentMaster;
