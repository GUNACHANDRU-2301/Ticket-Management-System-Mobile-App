import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, Clock, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const API_URL = 'http://localhost:5000/api';

const TechnicianQueue = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkQueue = async () => {
    setLoading(true);
    try {
      if (!user) return;
      const res = await axios.get(`${API_URL}/complaints`, {
        params: { role: user.role, userId: user.userId }
      });
      setTickets(res.data || []);
    } catch (err) {
      console.error('Error fetching work queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkQueue();
  }, [user]);

  const assignedCount = tickets.filter((t) => t.status === 'Assigned').length;
  const inProgressCount = tickets.filter((t) => t.status === 'In-Progress').length;
  const completedCount = tickets.filter((t) => t.status === 'Completed').length;

  const handleStatusUpdate = async (ticketId, newStatus) => {
    try {
      await axios.patch(`${API_URL}/complaints/${ticketId}/status`, { status: newStatus });
      fetchWorkQueue();
    } catch (err) {
      alert('Failed to update ticket status.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
            My Work Queue
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Assigned maintenance tasks and service tickets
          </p>
        </div>

        <button className="btn btn-secondary" onClick={fetchWorkQueue}>
          <RefreshCw size={16} /> Refresh Queue
        </button>
      </div>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <QueueStatCard title="Assigned Tasks" value={assignedCount} icon={<Wrench size={20} />} color="#3B82F6" />
        <QueueStatCard title="In Progress" value={inProgressCount} icon={<Clock size={20} />} color="#6366F1" />
        <QueueStatCard title="Completed" value={completedCount} icon={<CheckCircle2 size={20} />} color="#10B981" />
      </div>

      {/* Task Cards Grid */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading work queue...
        </div>
      ) : tickets.length === 0 ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          🎉 No pending tasks assigned to your queue!
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {tickets.map((t) => (
            <div key={t._id} className="card card-interactive" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--primary)' }}>
                    #TMS-{t._id.substring(t._id.length - 6).toUpperCase()}
                  </span>
                  <span className={`badge badge-${t.status.toLowerCase().replace(' ', '-')}`}>
                    {t.status}
                  </span>
                </div>

                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                  {t.complaintType} Issue
                </h3>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  📍 Block {t.blockName} • Room {t.roomNumber}
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '14px' }}>
                  "{t.remarks || 'No detailed remarks'}"
                </p>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                {t.status !== 'In-Progress' && (
                  <button className="btn btn-secondary" style={{ fontSize: '12px', padding: '6px 12px' }} onClick={() => handleStatusUpdate(t._id, 'In-Progress')}>
                    Start Work
                  </button>
                )}
                {t.status !== 'Completed' && (
                  <button className="btn btn-primary" style={{ fontSize: '12px', padding: '6px 12px' }} onClick={() => handleStatusUpdate(t._id, 'Completed')}>
                    <CheckCircle2 size={14} /> Mark Resolved
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const QueueStatCard = ({ title, value, icon, color }) => (
  <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px' }}>
    <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: color + '15', color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{title}</div>
      <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)' }}>{value}</div>
    </div>
  </div>
);

export default TechnicianQueue;
