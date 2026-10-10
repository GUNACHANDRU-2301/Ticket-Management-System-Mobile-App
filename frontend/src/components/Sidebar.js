import React, { useState, useContext } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  PlusCircle,
  Building2,
  GraduationCap,
  Building,
  DoorOpen,
  ShieldCheck,
  Users,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,
  LogOut,
  ChevronLeft,
  Wrench
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import Logo from './Logo';

const Sidebar = ({ collapsed, toggleCollapse }) => {
  const { user, logout, isAdmin, isTechnician } = useContext(AuthContext);
  const location = useLocation();

  const [openSubmenus, setOpenSubmenus] = useState({
    complaints: true,
    masters: true
  });

  const toggleSubmenu = (menu) => {
    setOpenSubmenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  const isCurrentActive = (path) => location.pathname === path;

  return (
    <aside
      style={{
        width: collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
        backgroundColor: 'var(--bg-sidebar)',
        borderRight: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 50,
        transition: 'width var(--transition-speed)',
        color: '#94A3B8'
      }}
    >
      {/* Top Logo Section */}
      <div
        style={{
          height: 'var(--header-height)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          padding: collapsed ? '0' : '0 20px',
          borderBottom: '1px solid rgba(255,255,255,0.08)'
        }}
      >
        <Logo size="small" collapsed={collapsed} light />
        {!collapsed && (
          <button
            onClick={toggleCollapse}
            style={{
              background: 'none',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px'
            }}
          >
            <ChevronLeft size={18} />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: collapsed ? '16px 8px' : '16px 12px'
        }}
      >
        {/* Main Section */}
        <NavItem
          to="/dashboard"
          icon={<LayoutDashboard size={19} />}
          label="Dashboard"
          collapsed={collapsed}
          active={isCurrentActive('/dashboard')}
        />

        {isTechnician && (
          <NavItem
            to="/work-queue"
            icon={<Wrench size={19} />}
            label="My Work Queue"
            collapsed={collapsed}
            active={isCurrentActive('/work-queue')}
          />
        )}

        {/* Complaints Group */}
        <div style={{ marginTop: '16px' }}>
          {!collapsed && (
            <div
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#64748B',
                padding: '4px 12px',
                letterSpacing: '0.8px',
                textTransform: 'uppercase'
              }}
            >
              Complaints Management
            </div>
          )}

          <NavItem
            to="/complaints/raise"
            icon={<PlusCircle size={19} />}
            label="Raise Complaint"
            collapsed={collapsed}
            active={isCurrentActive('/complaints/raise')}
          />

          <NavItem
            to="/complaints/my"
            icon={<ClipboardList size={19} />}
            label="My Complaints"
            collapsed={collapsed}
            active={isCurrentActive('/complaints/my')}
          />

          <NavItem
            to="/complaints"
            icon={<ClipboardList size={19} />}
            label="All Complaints"
            collapsed={collapsed}
            active={isCurrentActive('/complaints')}
          />
        </div>

        {/* Master Data Section (Admins Only) */}
        {isAdmin && (
          <div style={{ marginTop: '16px' }}>
            {!collapsed && (
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#64748B',
                  padding: '4px 12px',
                  letterSpacing: '0.8px',
                  textTransform: 'uppercase'
                }}
              >
                Master Data & Users
              </div>
            )}

            <NavItem
              to="/masters/departments"
              icon={<Building2 size={19} />}
              label="Departments"
              collapsed={collapsed}
              active={isCurrentActive('/masters/departments')}
            />

            <NavItem
              to="/masters/programmes"
              icon={<GraduationCap size={19} />}
              label="Programmes"
              collapsed={collapsed}
              active={isCurrentActive('/masters/programmes')}
            />

            <NavItem
              to="/masters/blocks"
              icon={<Building size={19} />}
              label="Blocks"
              collapsed={collapsed}
              active={isCurrentActive('/masters/blocks')}
            />

            <NavItem
              to="/masters/rooms"
              icon={<DoorOpen size={19} />}
              label="Rooms"
              collapsed={collapsed}
              active={isCurrentActive('/masters/rooms')}
            />

            <NavItem
              to="/users"
              icon={<Users size={19} />}
              label="Users & Staff"
              collapsed={collapsed}
              active={isCurrentActive('/users')}
            />

            <NavItem
              to="/reports"
              icon={<BarChart3 size={19} />}
              label="Reports & Analytics"
              collapsed={collapsed}
              active={isCurrentActive('/reports')}
            />
          </div>
        )}

        {/* System Settings */}
        <div style={{ marginTop: '16px' }}>
          <NavItem
            to="/settings"
            icon={<Settings size={19} />}
            label="Settings"
            collapsed={collapsed}
            active={isCurrentActive('/settings')}
          />
        </div>
      </div>

      {/* Bottom User Card */}
      <div
        style={{
          padding: collapsed ? '12px 8px' : '14px 16px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between'
        }}
      >
        {!collapsed ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#6366F1',
                color: '#FFFFFF',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                flexShrink: 0
              }}
            >
              {user?.username?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#F8FAFC',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {user?.username || 'User'}
              </div>
              <div style={{ fontSize: '11px', color: '#6366F1', fontWeight: 600 }}>
                {user?.role || 'Guest'}
              </div>
            </div>
          </div>
        ) : null}

        <button
          onClick={logout}
          title="Sign Out"
          style={{
            background: 'none',
            border: 'none',
            color: '#FCA5A5',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
};

// Sub-component for individual item
const NavItem = ({ to, icon, label, collapsed, active }) => (
  <NavLink
    to={to}
    title={collapsed ? label : undefined}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: collapsed ? '10px' : '10px 12px',
      justifyContent: collapsed ? 'center' : 'flex-start',
      borderRadius: '8px',
      color: active ? '#FFFFFF' : '#94A3B8',
      backgroundColor: active ? '#6366F1' : 'transparent',
      fontWeight: active ? 600 : 500,
      fontSize: '14px',
      marginVertical: '2px',
      transition: 'all 0.15s ease'
    }}
  >
    <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>
    {!collapsed && <span>{label}</span>}
  </NavLink>
);

export default Sidebar;
