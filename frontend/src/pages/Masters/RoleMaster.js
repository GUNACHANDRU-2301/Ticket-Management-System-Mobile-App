import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlusCircle, FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';

const RoleMaster = () => {
    const [roles, setRoles] = useState([]);
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');

    const fetchRoles = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/masters/roles', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRoles(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/masters/roles',
                { name },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setName('');
            fetchRoles();
        } catch (err) {
            alert(err.response?.data?.message || 'Error saving role');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`http://localhost:5000/api/masters/roles/${id}`,
                { name: editName },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setEditingId(null);
            fetchRoles();
        } catch (err) {
            alert(err.response?.data?.message || 'Error updating role');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this role?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/masters/roles/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchRoles();
        } catch (err) {
            alert(err.response?.data?.message || 'Error deleting role');
        }
    };

    return (
        <div style={{ padding: '40px 60px', flex: 1 }} className="animate-fade-in">
            <h1 style={{ fontSize: '2.5rem', marginBottom: '40px' }}>Role Master</h1>

            <div className="glass" style={{ padding: '40px', marginBottom: '40px', borderRadius: '24px' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '25px', color: '#fff' }}>Define User Permissions</h3>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '25px', alignItems: 'flex-end' }}>
                    <div className="input-group" style={{ marginBottom: '0' }}>
                        <label className="input-label">Role Name</label>
                        <input type="text" className="input-field" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Technician, Supervisor" />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ height: '52px', minWidth: '180px' }}>
                        <FaPlusCircle /> {loading ? 'Saving...' : 'Create Role'}
                    </button>
                </form>
            </div>

            <div className="glass" style={{ padding: '30px', borderRadius: '24px' }}>
                <table className="premium-table">
                    <thead>
                        <tr>
                            <th>Role Access Level</th>
                            <th>Created On</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {roles.map((role) => (
                            <tr key={role._id}>
                                <td style={{ fontWeight: '600', color: '#fff' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }}></div>
                                        {editingId === role._id ? (
                                            <input type="text" className="input-field" value={editName} onChange={(e) => setEditName(e.target.value)} style={{ padding: '8px', marginBottom: 0 }} />
                                        ) : role.name}
                                    </div>
                                </td>
                                <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                    {new Date(role.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        {editingId === role._id ? (
                                            <>
                                                <button className="btn btn-primary" onClick={() => handleUpdate(role._id)} style={{ padding: '8px' }}><FaCheck /></button>
                                                <button className="btn btn-ghost" onClick={() => setEditingId(null)} style={{ padding: '8px' }}><FaTimes /></button>
                                            </>
                                        ) : (
                                            <>
                                                <button className="btn btn-ghost" onClick={() => {
                                                    setEditingId(role._id);
                                                    setEditName(role.name);
                                                }} style={{ padding: '8px' }}><FaEdit /></button>
                                                <button className="btn btn-ghost" onClick={() => handleDelete(role._id)} style={{ padding: '8px', color: 'var(--accent)' }}><FaTrash /></button>
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

export default RoleMaster;
