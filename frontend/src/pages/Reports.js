import React, { useState, useEffect } from 'react';
import { Download, Printer, Filter, Calendar, BarChart3, TrendingUp, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const Reports = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_URL}/complaints/all`)
      .then((res) => setComplaints(res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleExportPDF = () => {
    window.print();
  };

  const total = complaints.length;
  const resolved = complaints.filter((c) => c.status === 'Completed').length;
  const rate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header & Export Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
            Reports & Audit Analytics
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
            System-wide facility performance, SLA metrics, and ticket resolution logs
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={handleExportPDF}>
            <Printer size={16} /> Print Report
          </button>
          <button className="btn btn-primary" onClick={handleExportPDF}>
            <Download size={16} /> Export PDF / CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        <div className="card">
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Tickets Logged</div>
          <div style={{ fontSize: '32px', fontWeight: 800, margin: '8px 0', color: 'var(--primary)' }}>{total}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Lifetime system records</div>
        </div>

        <div className="card">
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Resolved Tickets</div>
          <div style={{ fontSize: '32px', fontWeight: 800, margin: '8px 0', color: '#10B981' }}>{resolved}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Completed maintenance tasks</div>
        </div>

        <div className="card">
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Resolution Rate</div>
          <div style={{ fontSize: '32px', fontWeight: 800, margin: '8px 0', color: '#3B82F6' }}>{rate}%</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Overall resolution efficiency</div>
        </div>
      </div>

      {/* Full Audit Log Table */}
      <div className="card">
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '16px' }}>
          Complete Facility Audit Log
        </h3>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading report dataset...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-body)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 14px' }}>Ticket ID</th>
                  <th style={{ padding: '12px 14px' }}>Category</th>
                  <th style={{ padding: '12px 14px' }}>Location</th>
                  <th style={{ padding: '12px 14px' }}>Raised By</th>
                  <th style={{ padding: '12px 14px' }}>Assigned To</th>
                  <th style={{ padding: '12px 14px' }}>Date</th>
                  <th style={{ padding: '12px 14px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => (
                  <tr key={c._id} style={{ borderBottom: '1px solid var(--border-color-light)' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 800, color: 'var(--primary)' }}>
                      #TMS-{c._id.substring(c._id.length - 6).toUpperCase()}
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: 600 }}>{c.complaintType}</td>
                    <td style={{ padding: '12px 14px' }}>Block {c.blockName} • Rm {c.roomNumber}</td>
                    <td style={{ padding: '12px 14px' }}>{c.raisedBy?.username || 'User'}</td>
                    <td style={{ padding: '12px 14px' }}>{c.assignedTo?.username || c.assignedTo || 'Unassigned'}</td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-muted)' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span className={`badge badge-${c.status.toLowerCase().replace(' ', '-')}`}>{c.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
