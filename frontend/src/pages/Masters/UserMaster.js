import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlusCircle, FaUserCircle, FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';

const UserMaster = () => {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [departments, setDepartments] = useState([]);

    const [formData, setFormData] = useState({
        username: '',
        password: '',
        phone: '',
        email: '',
        role: '',
        department: '',
        programme: ''
    });
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({
        username: '',
        email: '',
        role: '',
        department: '',
        programme: ''
    });

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [userRes, roleRes, deptRes] = await Promise.all([
                axios.get('http://localhost:5000/api/masters/users', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('http://localhost:5000/api/masters/roles', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('http://localhost:5000/api/masters/departments', { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setUsers(userRes.data);
            setRoles(roleRes.data);
            setDepartments(deptRes.data);
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
            await axios.post('http://localhost:5000/api/masters/users',
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setFormData({ username: '', password: '', phone: '', email: '', role: '', department: '', programme: '' });
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Error saving user');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`http://localhost:5000/api/masters/users/${id}`,
                editData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setEditingId(null);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Error updating user');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/masters/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Error deleting user');
        }
    };

    return (
        <div style={{ padding: '40px 60px', flex: 1 }} className="animate-fade-in">
            <h1 style={{ fontSize: '2.5rem', marginBottom: '40px' }}>User Management</h1>

            <div className="glass" style={{ padding: '40px', marginBottom: '40px', borderRadius: '24px' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '25px', color: '#fff' }}>Onboard New Team Member</h3>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr) auto', gap: '25px', alignItems: 'flex-end' }}>
                    <div className="input-group" style={{ marginBottom: '0' }}>
                        <label className="input-label">Username</label>
                        <input name="username" className="input-field" value={formData.username} onChange={handleChange} required placeholder="Identify name" />
                    </div>
                    <div className="input-group" style={{ marginBottom: '0' }}>
                        <label className="input-label">Password</label>
                        <input name="password" type="password" className="input-field" value={formData.password} onChange={handleChange} required placeholder="••••••••" />
                    </div>
                    <div className="input-group" style={{ marginBottom: '0' }}>
                        <label className="input-label">Email Address</label>
                        <input name="email" type="email" className="input-field" value={formData.email} onChange={handleChange} required placeholder="user@tms.com" />
                    </div>
                    <div className="input-group" style={{ marginBottom: '0' }}>
                        <label className="input-label">Assigned Role</label>
                        <select name="role" className="input-field" value={formData.role} onChange={handleChange} required>
                            <option value="">Select Role</option>
                            {roles.map(r => <option key={r._id} value={r.name}>{r.name}</option>)}
                        </select>
                    </div>
                    <div className="input-group" style={{ marginBottom: '0' }}>
                        <label className="input-label">Department</label>
                        <select name="department" className="input-field" value={formData.department} onChange={handleChange}>
                            <option value="">None (Optional)</option>
                            {departments.map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
                        </select>
                    </div>
                    <div className="input-group" style={{ marginBottom: '0', gridColumn: 'span 2' }}>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '52px' }} disabled={loading}>
                            {loading ? 'Creating Account...' : <><FaPlusCircle /> Register User</>}
                        </button>
                    </div>
                </form>
            </div>

            <div className="glass" style={{ padding: '30px', borderRadius: '24px' }}>
                <table className="premium-table">
                    <thead>
                        <tr>
                            <th>Member</th>
                            <th>Credentials</th>
                            <th>Role & Access</th>
                            <th>Department</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => (
                            <tr key={u._id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '36px', height: '36px', background: 'var(--primary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <FaUserCircle style={{ color: '#fff', fontSize: '1.2rem' }} />
                                        </div>
                                        {editingId === u._id ? (
                                            <input className="input-field" value={editData.username} onChange={(e) => setEditData({ ...editData, username: e.target.value })} style={{ padding: '8px', marginBottom: 0 }} />
                                        ) : (
                                            <div style={{ fontWeight: '600', color: '#fff' }}>{u.username}</div>
                                        )}
                                    </div>
                                </td>
                                <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    {editingId === u._id ? (
                                        <input className="input-field" value={editData.email} onChange={(e) => setEditData({ ...editData, email: e.target.value })} style={{ padding: '8px', marginBottom: 0 }} />
                                    ) : u.email}
                                </td>
                                <td>
                                    {editingId === u._id ? (
                                        <select className="input-field" value={editData.role} onChange={(e) => setEditData({ ...editData, role: e.target.value })} style={{ padding: '4px 8px', marginBottom: 0 }}>
                                            {roles.map(r => <option key={r._id} value={r.name}>{r.name}</option>)}
                                        </select>
                                    ) : (
                                        <span className="glass-pill" style={{ padding: '4px 12px', fontSize: '0.75rem', fontWeight: 700, background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                            {u.role}
                                        </span>
                                    )}
                                </td>
                                <td style={{ color: 'var(--text-muted)' }}>
                                    {editingId === u._id ? (
                                        <select className="input-field" value={editData.department} onChange={(e) => setEditData({ ...editData, department: e.target.value })} style={{ padding: '4px 8px', marginBottom: 0 }}>
                                            <option value="">None</option>
                                            {departments.map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
                                        </select>
                                    ) : (u.department || '—')}
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        {editingId === u._id ? (
                                            <>
                                                <button className="btn btn-primary" onClick={() => handleUpdate(u._id)} style={{ padding: '8px' }}><FaCheck /></button>
                                                <button className="btn btn-ghost" onClick={() => setEditingId(null)} style={{ padding: '8px' }}><FaTimes /></button>
                                            </>
                                        ) : (
                                            <>
                                                <button className="btn btn-ghost" onClick={() => {
                                                    setEditingId(u._id);
                                                    setEditData({
                                                        username: u.username,
                                                        email: u.email,
                                                        role: u.role,
                                                        department: u.department || '',
                                                        programme: u.programme || ''
                                                    });
                                                }} style={{ padding: '8px' }}><FaEdit /></button>
                                                <button className="btn btn-ghost" onClick={() => handleDelete(u._id)} style={{ padding: '8px', color: 'var(--accent)' }}><FaTrash /></button>
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

export default UserMaster;
