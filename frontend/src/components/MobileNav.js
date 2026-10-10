import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, ClipboardList, Wrench, BarChart3, Settings } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const MobileNav = () => {
  const { isAdmin, isTechnician } = useContext(AuthContext);

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60px',
        backgroundColor: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 50,
        boxShadow: 'var(--shadow-lg)'
      }}
    >
      <MobileNavItem to="/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" />
      <MobileNavItem to="/complaints" icon={<ClipboardList size={20} />} label="Tickets" />

      {/* Floating Action Button in Middle */}
      <NavLink
        to="/complaints/raise"
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: 'var(--primary)',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '-24px',
          boxShadow: '0 4px 12px var(--primary-glow)',
          border: '3px solid var(--bg-surface)'
        }}
      >
        <PlusCircle size={26} />
      </NavLink>

      {isTechnician ? (
        <MobileNavItem to="/work-queue" icon={<Wrench size={20} />} label="Work" />
      ) : isAdmin ? (
        <MobileNavItem to="/reports" icon={<BarChart3 size={20} />} label="Reports" />
      ) : (
        <MobileNavItem to="/complaints/my" icon={<ClipboardList size={20} />} label="My Tickets" />
      )}

      <MobileNavItem to="/settings" icon={<Settings size={20} />} label="Settings" />
    </nav>
  );
};

const MobileNavItem = ({ to, icon, label }) => (
  <NavLink
    to={to}
    style={({ isActive }) => ({
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '2px',
      color: isActive ? 'var(--primary)' : 'var(--text-muted)',
      fontSize: '11px',
      fontWeight: isActive ? 700 : 500,
      textDecoration: 'none'
    })}
  >
    {icon}
    <span>{label}</span>
  </NavLink>
);

export default MobileNav;
