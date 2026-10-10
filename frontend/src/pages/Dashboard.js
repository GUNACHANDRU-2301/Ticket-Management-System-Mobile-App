import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  Clock,
  Wrench,
  CheckCircle2,
  TrendingUp,
  PlusCircle,
  Layers,
  ArrowRight,
  Filter,
  Calendar,
  Search,
  ChevronRight
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const API_URL = 'http://localhost:5000/api';

const Dashboard = () => {
  const { user, isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();

  const [stats, setStats] = useState({ total: 0, pending: 0, assigned: 0, closed: 0 });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30D');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (!user) return;
        const [statsRes, recentRes] = await Promise.all([
          axios.get(`${API_URL}/complaints/stats`, {
            params: { role: user.role, userId: user.userId }
          }),
          axios.get(`${API_URL}/complaints/recent`, {
            params: { role: user.role, userId: user.userId }
          })
        ]);
        setStats(statsRes.data || { total: 0, pending: 0, assigned: 0, closed: 0 });
        setRecentComplaints(recentRes.data || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  // Chart Datasets
  const statusPieData = [
    { name: 'Pending', value: stats.pending || 1, color: '#F59E0B' },
    { name: 'Assigned', value: stats.assigned || 2, color: '#3B82F6' },
    { name: 'In Progress', value: 3, color: '#6366F1' },
    { name: 'Resolved', value: stats.closed || 4, color: '#10B981' }
  ];

  const categoryBarData = [
    { category: 'Electrical', count: 12 },
    { category: 'Plumbing', count: 8 },
    { category: 'IT Support', count: 15 },
    { category: 'AC/HVAC', count: 6 },
    { category: 'Carpentry', count: 5 },
    { category: 'General', count: 9 }
  ];

  const activityTrendData = [
    { date: 'Sep 24', tickets: 4 },
    { date: 'Sep 25', tickets: 8 },
    { date: 'Sep 26', tickets: 6 },
    { date: 'Sep 27', tickets: 12 },
    { date: 'Sep 28', tickets: 9 },
    { date: 'Sep 29', tickets: 15 },
    { date: 'Sep 30', tickets: 11 }
  ];

  const currentDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Top Banner Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
            Good Morning, {user?.username || 'Admin'} 👋
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Here's your facility management overview for {currentDateStr}.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              padding: '8px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--text-secondary)'
            }}
          >
            <Calendar size={16} />
            <span>{currentDateStr}</span>
          </div>

          <button className="btn btn-primary" onClick={() => navigate('/complaints/raise')}>
            <PlusCircle size={18} /> Raise Complaint
          </button>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px'
        }}
      >
        <KpiStatCard
          title="Total Complaints"
          value={stats.total}
          icon={<ClipboardList size={22} />}
          color="var(--primary)"
          trend="+12% vs last month"
          onClick={() => navigate('/complaints')}
        />
        <KpiStatCard
          title="Pending Approval"
          value={stats.pending}
          icon={<Clock size={22} />}
          color="#F59E0B"
          trend="-4% response time"
          onClick={() => navigate('/complaints?status=Pending')}
        />
        <KpiStatCard
          title="In Progress"
          value={stats.assigned}
          icon={<Wrench size={22} />}
          color="#3B82F6"
          trend="8 active technicians"
          onClick={() => navigate('/complaints?status=Assigned')}
        />
        <KpiStatCard
          title="Resolved Tickets"
          value={stats.closed}
          icon={<CheckCircle2 size={22} />}
          color="#10B981"
          trend="94% resolution rate"
          onClick={() => navigate('/complaints?status=Completed')}
        />
      </div>

      {/* Analytics Charts Section (Donut & Bar) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '24px'
        }}
      >
        {/* LEFT: Complaint Status Donut Chart */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>Complaint Status Breakdown</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Distribution across active ticket lifecycle</p>
            </div>
            <Filter size={18} style={{ color: 'var(--text-muted)', cursor: 'pointer' }} />
          </div>

          <div style={{ height: '240px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', marginTop: '10px' }}>
            {statusPieData.map((item) => (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: item.color }} />
                <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Complaints by Category Bar Chart */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>Complaints by Category</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>High-volume service categories</p>
            </div>
          </div>

          <div style={{ height: '240px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="category" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <Tooltip cursor={{ fill: 'var(--bg-surface-hover)' }} />
                <Bar dataKey="count" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Activity Trend Line Chart */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>Complaint Activity Trend</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Daily volume of reported campus facility tickets</p>
          </div>

          <div style={{ display: 'flex', gap: '6px', backgroundColor: 'var(--bg-body)', padding: '4px', borderRadius: 'var(--radius-md)' }}>
            {['7D', '30D', '3M', '1Y'].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                style={{
                  border: 'none',
                  backgroundColor: timeframe === tf ? 'var(--bg-surface)' : 'transparent',
                  color: timeframe === tf ? 'var(--primary)' : 'var(--text-muted)',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: timeframe === tf ? 'var(--shadow-sm)' : 'none'
                }}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        <div style={{ height: '260px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activityTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="tickets" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorTrend)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '14px' }}>Quick Actions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <QuickActionCard icon={<PlusCircle size={24} />} title="Raise Complaint" desc="Report a new facility issue" onClick={() => navigate('/complaints/raise')} color="var(--primary)" />
          <QuickActionCard icon={<ClipboardList size={24} />} title="My Complaints" desc="Track your submitted tickets" onClick={() => navigate('/complaints/my')} color="#3B82F6" />
          <QuickActionCard icon={<Layers size={24} />} title="View All Complaints" desc="Manage ticket dispatches" onClick={() => navigate('/complaints')} color="#10B981" />
          {isAdmin && <QuickActionCard icon={<Wrench size={24} />} title="Manage Masters" desc="Configure campus location data" onClick={() => navigate('/masters/departments')} color="#F59E0B" />}
        </div>
      </div>

      {/* Recent Complaints Data Table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>Recent Complaint Tickets</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Latest logged maintenance issues requiring attention</p>
          </div>
          <button className="btn btn-secondary" onClick={() => navigate('/complaints')} style={{ fontSize: '13px' }}>
            View All Tickets <ArrowRight size={15} />
          </button>
        </div>

        {recentComplaints.length === 0 && !loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            📭 No recent complaint tickets found.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '10px 14px' }}>Ticket ID</th>
                  <th style={{ padding: '10px 14px' }}>Location</th>
                  <th style={{ padding: '10px 14px' }}>Category</th>
                  <th style={{ padding: '10px 14px' }}>Raised By</th>
                  <th style={{ padding: '10px 14px' }}>Status</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentComplaints.map((ticket) => (
                  <tr key={ticket._id} style={{ borderBottom: '1px solid var(--border-color-light)' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--primary)' }}>
                      #TMS-{ticket._id.substring(ticket._id.length - 6).toUpperCase()}
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: 600 }}>
                      Block {ticket.blockName} • Rm {ticket.roomNumber}
                    </td>
                    <td style={{ padding: '12px 14px' }}>{ticket.complaintType}</td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>
                      {ticket.raisedBy?.username || 'User'}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span className={`badge badge-${ticket.status.toLowerCase().replace(' ', '-')}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      <button
                        className="btn-icon"
                        onClick={() => navigate(`/complaints/${ticket._id}`, { state: { ticket } })}
                        title="View Details"
                        style={{ display: 'inline-flex' }}
                      >
                        <ChevronRight size={16} />
                      </button>
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

// KPI Stat Card Sub-component
const KpiStatCard = ({ title, value, icon, color, trend, onClick }) => (
  <div className="card card-interactive" onClick={onClick} style={{ position: 'relative', overflow: 'hidden' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
          {title}
        </div>
        <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-main)', margin: '8px 0 4px 0' }}>
          {value}
        </div>
      </div>
      <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: color + '15', color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
      <TrendingUp size={14} style={{ color }} />
      <span>{trend}</span>
    </div>
  </div>
);

// Quick Action Card Sub-component
const QuickActionCard = ({ icon, title, desc, onClick, color }) => (
  <div className="card card-interactive" onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '18px' }}>
    <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: color + '15', color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {icon}
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>{title}</div>
      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{desc}</div>
    </div>
    <ArrowRight size={18} style={{ color: 'var(--text-muted)' }} />
  </div>
);

export default Dashboard;
