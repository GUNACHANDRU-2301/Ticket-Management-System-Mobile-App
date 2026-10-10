import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building2, Plus, Edit2, Trash2, Search, Building, GraduationCap, DoorOpen, ShieldCheck } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const MasterManagement = () => {
  const { type = 'departments' } = useParams();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/masters/${type}`);
      setItems(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [type]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setName('');
    setShortName('');
    setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setName(item.name);
    setShortName(item.shortName || '');
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingItem) {
        await axios.patch(`${API_URL}/masters/${type}/${editingItem._id}`, { name, shortName });
      } else {
        await axios.post(`${API_URL}/masters/${type}`, { name, shortName });
      }
      setShowModal(false);
      fetchItems();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save record.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await axios.delete(`${API_URL}/masters/${type}/${id}`);
        fetchItems();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete record.');
      }
    }
  };

  const filteredItems = items.filter(
    (i) => i.name?.toLowerCase().includes(search.toLowerCase()) || i.shortName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px', textTransform: 'capitalize' }}>
            {type} Master Data
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Configure and manage campus {type} records
          </p>
        </div>

        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={18} /> Add New Record
        </button>
      </div>

      {/* Category Tabs */}
      <div className="card" style={{ padding: '8px 12px' }}>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
          <TabButton active={type === 'departments'} onClick={() => navigate('/masters/departments')} icon={<Building2 size={16} />} label="Departments" />
          <TabButton active={type === 'programmes'} onClick={() => navigate('/masters/programmes')} icon={<GraduationCap size={16} />} label="Programmes" />
          <TabButton active={type === 'blocks'} onClick={() => navigate('/masters/blocks')} icon={<Building size={16} />} label="Blocks" />
          <TabButton active={type === 'rooms'} onClick={() => navigate('/masters/rooms')} icon={<DoorOpen size={16} />} label="Rooms" />
          <TabButton active={type === 'roles'} onClick={() => navigate('/masters/roles')} icon={<ShieldCheck size={16} />} label="Roles" />
        </div>
      </div>

      {/* Search Toolbar & Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search records..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '36px', height: '36px', fontSize: '13px' }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
        ) : filteredItems.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No records found.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-body)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 18px' }}>Name / Designation</th>
                <th style={{ padding: '12px 18px' }}>Shortcode / Info</th>
                <th style={{ padding: '12px 18px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item._id} style={{ borderBottom: '1px solid var(--border-color-light)' }}>
                  <td style={{ padding: '14px 18px', fontWeight: 700 }}>{item.name || item.roomNumber}</td>
                  <td style={{ padding: '14px 18px', color: 'var(--text-secondary)' }}>{item.shortName || '-'}</td>
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <button className="btn-icon" onClick={() => handleOpenEdit(item)} title="Edit" style={{ display: 'inline-flex', marginRight: '6px' }}>
                      <Edit2 size={15} />
                    </button>
                    <button className="btn-icon" onClick={() => handleDelete(item._id)} title="Delete" style={{ display: 'inline-flex', color: '#EF4444' }}>
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Dialog */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card" style={{ width: '100%', maxWidth: '440px', padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px' }}>
              {editingItem ? 'Edit Record' : 'Add New Record'}
            </h3>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Shortcode / Code</label>
                <input type="text" className="form-control" value={shortName} onChange={(e) => setShortName(e.target.value)} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Record'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 16px',
      borderRadius: 'var(--radius-md)',
      border: 'none',
      backgroundColor: active ? 'var(--primary-light)' : 'transparent',
      color: active ? 'var(--primary)' : 'var(--text-muted)',
      fontWeight: active ? 700 : 500,
      fontSize: '13px',
      cursor: 'pointer',
      whiteSpace: 'nowrap'
    }}
  >
    {icon} {label}
  </button>
);

export default MasterManagement;
