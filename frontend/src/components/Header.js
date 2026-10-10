import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  Sun,
  Moon,
  User,
  Settings,
  LogOut,
  Menu,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';

const Header = ({ toggleSidebar }) => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New Complaint Logged', desc: 'Electrical issue in Block A, Room 101', time: '10m ago', unread: true },
    { id: 2, title: 'Ticket Assigned', desc: 'Plumbing complaint assigned to Electrician John', time: '1h ago', unread: true },
    { id: 3, title: 'Status Updated', desc: 'Ticket #TMS-000123 set to In-Progress', time: '3h ago', unread: false }
  ]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/complaints?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="top-header">
      {/* Left: Sidebar Toggle & Global Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button className="btn-icon" onClick={toggleSidebar} title="Toggle Sidebar">
          <Menu size={20} />
        </button>

        <form onSubmit={handleSearchSubmit} style={{ position: 'relative', width: '320px' }}>
          <Search
            size={17}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)'
            }}
          />
          <input
            type="text"
            className="form-control"
            placeholder="Search complaints, rooms, blocks... (Ctrl+K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              paddingLeft: '38px',
              paddingRight: '60px',
              height: '38px',
              borderRadius: 'var(--radius-full)',
              fontSize: '13px'
            }}
          />
          <span
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--text-muted)',
              backgroundColor: 'var(--bg-body)',
              padding: '2px 6px',
              borderRadius: '4px',
              border: '1px solid var(--border-color)'
            }}
          >
            ⌘K
          </span>
        </form>
      </div>

      {/* Right: Theme Toggle, Notifications, Profile Dropdown */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Theme Toggle Button */}
        <button
          className="btn-icon"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon size={19} /> : <Sun size={19} />}
        </button>

        {/* Notifications Dropdown Container */}
        <div style={{ position: 'relative' }}>
          <button
            className="btn-icon"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            title="Notifications"
          >
            <Bell size={19} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  width: '9px',
                  height: '9px',
                  borderRadius: '50%',
                  backgroundColor: '#EF4444',
                  border: '2px solid var(--bg-surface)'
                }}
              />
            )}
          </button>

          {showNotifications && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '48px',
                width: '320px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 100,
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  padding: '14px 16px',
                  borderBottom: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span style={{ fontWeight: 700, fontSize: '14px' }}>Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary)',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid var(--border-color-light)',
                      backgroundColor: n.unread ? 'var(--primary-light)' : 'transparent',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'flex-start'
                    }}
                  >
                    <AlertTriangle size={18} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600 }}>{n.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{n.desc}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{n.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Vertical Divider */}
        <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-color)', margin: '0 4px' }} />

        {/* User Profile Dropdown Container */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary)',
                color: '#FFFFFF',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px'
              }}
            >
              {user?.username?.charAt(0).toUpperCase() || 'A'}
            </div>

            <div style={{ textAlign: 'left', display: 'none', smDisplay: 'block' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
                {user?.username || 'Admin User'}
              </div>
              <span className="badge badge-assigned" style={{ fontSize: '10px', padding: '1px 6px' }}>
                {user?.role || 'SuperAdmin'}
              </span>
            </div>
          </button>

          {showProfileMenu && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '48px',
                width: '200px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 100,
                padding: '6px'
              }}
            >
              <button
                onClick={() => {
                  navigate('/profile');
                  setShowProfileMenu(false);
                }}
                style={dropdownItemStyle}
              >
                <User size={16} /> My Profile
              </button>
              <button
                onClick={() => {
                  navigate('/settings');
                  setShowProfileMenu(false);
                }}
                style={dropdownItemStyle}
              >
                <Settings size={16} /> Settings
              </button>
              <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '6px 0' }} />
              <button
                onClick={logout}
                style={{ ...dropdownItemStyle, color: '#EF4444' }}
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

const dropdownItemStyle = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '8px 12px',
  background: 'none',
  border: 'none',
  fontSize: '13px',
  fontWeight: 600,
  color: 'var(--text-main)',
  cursor: 'pointer',
  borderRadius: 'var(--radius-md)',
  textAlign: 'left'
};

export default Header;
