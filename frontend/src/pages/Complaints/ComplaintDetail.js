import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  MapPin,
  Clock,
  User,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  Send,
  ArrowLeft
} from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const API_URL = 'http://localhost:5000/api';

const ComplaintDetail = () => {
  const { id } = useParams();
  const locationState = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin } = useContext(AuthContext);

  const [ticket, setTicket] = useState(locationState.state?.ticket || null);
  const [technicians, setTechnicians] = useState([]);
  const [selectedTech, setSelectedTech] = useState('');
  const [updating, setUpdating] = useState(false);
  const [remarkText, setRemarkText] = useState('');

  // Image Modal
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      axios.get(`${API_URL}/complaints/technicians`)
        .then((res) => setTechnicians(res.data || []))
        .catch((err) => console.error(err));
    }
  }, [isAdmin]);

  const handleAssign = async () => {
    if (!selectedTech) {
      alert('Please select a technician to assign.');
      return;
    }

    setUpdating(true);
    try {
      const res = await axios.patch(`${API_URL}/complaints/${ticket._id}/assign`, {
        assignedTo: selectedTech
      });
      setTicket(res.data);
      alert('Technician assigned successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign technician.');
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    setUpdating(true);
    try {
      const res = await axios.patch(`${API_URL}/complaints/${ticket._id}/status`, {
        status: newStatus
      });
      setTicket((prev) => ({ ...prev, status: res.data.status }));
      alert(`Ticket status updated to "${newStatus}"!`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setUpdating(false);
    }
  };

  if (!ticket) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <h2>Ticket Not Found</h2>
        <button className="btn btn-secondary" onClick={() => navigate('/complaints')} style={{ marginTop: '16px' }}>
          <ArrowLeft size={16} /> Back to Complaints
        </button>
      </div>
    );
  }

  const ticketCode = `#TMS-${ticket._id.substring(ticket._id.length - 6).toUpperCase()}`;
  const attachmentUrl = ticket.attachment
    ? ticket.attachment.startsWith('http')
      ? ticket.attachment
      : `http://localhost:5000${ticket.attachment}`
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn-icon" onClick={() => navigate(-1)} title="Back">
            <ArrowLeft size={18} />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)' }}>
                {ticketCode}
              </h1>
              <span className={`badge badge-${ticket.status.toLowerCase().replace(' ', '-')}`}>
                {ticket.status}
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Logged on {new Date(ticket.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={() => handleStatusUpdate('In-Progress')} disabled={updating}>
            Set In-Progress
          </button>
          <button className="btn btn-primary" onClick={() => handleStatusUpdate('Completed')} disabled={updating}>
            <CheckCircle2 size={16} /> Mark Resolved
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        {/* LEFT COLUMN: Main Ticket Information & Image */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card">
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '16px' }}>
              Complaint Overview
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>CATEGORY</div>
                <div style={{ fontSize: '14px', fontWeight: 700, marginTop: '2px' }}>{ticket.complaintType}</div>
              </div>

              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>LOCATION</div>
                <div style={{ fontSize: '14px', fontWeight: 700, marginTop: '2px' }}>
                  Block {ticket.blockName}, Rm {ticket.roomNumber}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>DEPARTMENT</div>
                <div style={{ fontSize: '14px', fontWeight: 700, marginTop: '2px' }}>
                  {ticket.department || 'Campus Wide'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>RAISED BY</div>
                <div style={{ fontSize: '14px', fontWeight: 700, marginTop: '2px' }}>
                  {ticket.raisedBy?.username || 'User'}
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '6px' }}>
                DETAILED REMARKS
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {ticket.remarks || 'No detailed remarks provided.'}
              </div>
            </div>
          </div>

          {/* Attachment Preview Card */}
          {attachmentUrl && (
            <div className="card">
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '14px' }}>
                Media Attachment Proof
              </h3>
              <img
                src={attachmentUrl}
                alt="Ticket Evidence"
                onClick={() => setShowImageModal(true)}
                style={{ width: '100%', maxHeight: '280px', objectFit: 'cover', borderRadius: 'var(--radius-md)', cursor: 'pointer', border: '1px solid var(--border-color)' }}
              />
              <div style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600, textAlign: 'center', marginTop: '8px', cursor: 'pointer' }} onClick={() => setShowImageModal(true)}>
                Click image to view full size 🔍
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Activity Timeline & Action Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Assign Staff Panel (Admin Only) */}
          {isAdmin && (
            <div className="card">
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '14px' }}>
                Assign Technician / Staff
              </h3>

              <div style={{ display: 'flex', gap: '10px' }}>
                <select
                  className="form-control"
                  value={selectedTech}
                  onChange={(e) => setSelectedTech(e.target.value)}
                  style={{ flex: 1 }}
                >
                  <option value="">Select Technician</option>
                  {technicians.map((t) => (
                    <option key={t._id} value={t._id}>{t.username} ({t.role})</option>
                  ))}
                </select>

                <button className="btn btn-primary" onClick={handleAssign} disabled={updating}>
                  Assign
                </button>
              </div>
            </div>
          )}

          {/* Activity Timeline Card */}
          <div className="card">
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '20px' }}>
              Ticket Activity Timeline
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
              <TimelineItem
                icon={<Clock size={16} />}
                title="Complaint Logged"
                user={ticket.raisedBy?.username || 'User'}
                time={new Date(ticket.createdAt).toLocaleString()}
                completed
              />

              <TimelineItem
                icon={<UserCheck size={16} />}
                title="Assigned to Technician"
                user={ticket.assignedTo?.username || ticket.assignedTo || 'Pending Assignment'}
                time={ticket.assignedTo ? 'Assigned' : 'Awaiting dispatch'}
                completed={!!ticket.assignedTo}
              />

              <TimelineItem
                icon={<Wrench size={16} />}
                title="Work In Progress"
                user={ticket.assignedTo?.username || 'Staff'}
                time={ticket.status === 'In-Progress' ? 'Active' : 'Pending start'}
                completed={['In-Progress', 'Completed'].includes(ticket.status)}
              />

              <TimelineItem
                icon={<CheckCircle2 size={16} />}
                title="Resolved & Closed"
                user="Facility Management"
                time={ticket.status === 'Completed' ? 'Completed' : 'Pending resolution'}
                completed={ticket.status === 'Completed'}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TimelineItem = ({ icon, title, user, time, completed }) => (
  <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
    <div
      style={{
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        backgroundColor: completed ? 'var(--primary-light)' : 'var(--bg-body)',
        color: completed ? 'var(--primary)' : 'var(--text-muted)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        border: completed ? 'none' : '1px solid var(--border-color)'
      }}
    >
      {icon}
    </div>
    <div>
      <div style={{ fontSize: '14px', fontWeight: 700, color: completed ? 'var(--text-main)' : 'var(--text-muted)' }}>
        {title}
      </div>
      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
        By {user}
      </div>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
        {time}
      </div>
    </div>
  </div>
);

export default ComplaintDetail;
