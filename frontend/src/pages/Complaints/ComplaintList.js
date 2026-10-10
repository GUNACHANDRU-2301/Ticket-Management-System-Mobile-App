import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  PlusCircle,
  ChevronRight,
  RefreshCw,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight as ChevronRightIcon
} from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const API_URL = 'http://localhost:5000/api';

const STATUS_TABS = ['All', 'Pending', 'Assigned', 'In Progress', 'Completed'];

const ComplaintList = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState(searchParams.get('status') || 'All');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      if (!user) return;
      const res = await axios.get(`${API_URL}/complaints`, {
        params: { role: user.role, userId: user.userId }
      });
      setComplaints(res.data || []);
    } catch (err) {
      console.error('Error fetching complaints list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [user]);

  const filteredComplaints = complaints.filter((item) => {
    const matchesTab = activeTab === 'All' || item.status === activeTab;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      item.complaintType?.toLowerCase().includes(query) ||
      item.blockName?.toLowerCase().includes(query) ||
      item.roomNumber?.toLowerCase().includes(query) ||
      item.remarks?.toLowerCase().includes(query) ||
      item.raisedBy?.username?.toLowerCase().includes(query);

    return matchesTab && matchesSearch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage) || 1;
  const paginatedComplaints = filteredComplaints.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
            Complaint Tickets
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Manage and track campus facility complaints
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => navigate('/complaints/raise')}>
          <PlusCircle size={18} /> Raise Complaint
        </button>
      </div>

      {/* Toolbar & Filters Card */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Filter by ticket, category, room..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '36px', height: '38px', fontSize: '13px' }}
            />
          </div>

          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: '6px', backgroundColor: 'var(--bg-body)', padding: '4px', borderRadius: 'var(--radius-md)' }}>
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                style={{
                  border: 'none',
                  backgroundColor: activeTab === tab ? 'var(--bg-surface)' : 'transparent',
                  color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: activeTab === tab ? 'var(--shadow-sm)' : 'none'
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          <button className="btn btn-secondary" onClick={fetchComplaints} title="Refresh Data" style={{ height: '38px' }}>
            <RefreshCw size={15} /> Refresh
          </button>
        </div>
      </div>

      {/* Data Table Card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading tickets...
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-body)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '14px 18px', fontWeight: 700 }}>Ticket ID</th>
                    <th style={{ padding: '14px 18px', fontWeight: 700 }}>Location</th>
                    <th style={{ padding: '14px 18px', fontWeight: 700 }}>Category</th>
                    <th style={{ padding: '14px 18px', fontWeight: 700 }}>Raised By</th>
                    <th style={{ padding: '14px 18px', fontWeight: 700 }}>Assigned To</th>
                    <th style={{ padding: '14px 18px', fontWeight: 700 }}>Status</th>
                    <th style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 700 }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedComplaints.map((ticket) => (
                    <tr key={ticket._id} style={{ borderBottom: '1px solid var(--border-color-light)' }}>
                      <td style={{ padding: '14px 18px', fontWeight: 800, color: 'var(--primary)' }}>
                        #TMS-{ticket._id.substring(ticket._id.length - 6).toUpperCase()}
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: 600 }}>
                        Block {ticket.blockName} • Rm {ticket.roomNumber}
                      </td>
                      <td style={{ padding: '14px 18px' }}>{ticket.complaintType}</td>
                      <td style={{ padding: '14px 18px', color: 'var(--text-secondary)' }}>
                        {ticket.raisedBy?.username || 'User'}
                      </td>
                      <td style={{ padding: '14px 18px', color: 'var(--text-secondary)' }}>
                        {ticket.assignedTo?.username || ticket.assignedTo || 'Unassigned'}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span className={`badge badge-${ticket.status.toLowerCase().replace(' ', '-')}`}>
                          {ticket.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <button
                          className="btn btn-secondary"
                          onClick={() => navigate(`/complaints/${ticket._id}`, { state: { ticket } })}
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                        >
                          View Details <ChevronRight size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls Footer */}
            <div style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Showing {paginatedComplaints.length} of {filteredComplaints.length} tickets
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn btn-secondary"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                >
                  <ChevronLeft size={14} /> Previous
                </button>
                <button
                  className="btn btn-secondary"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                >
                  Next <ChevronRightIcon size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ComplaintList;
