import React, { useContext } from 'react';
import { User, Mail, Shield, Building, Key } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Profile = () => {
  const { user } = useContext(AuthContext);

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
          User Profile
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Employee profile, system role credentials, and account permissions
        </p>
      </div>

      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '28px' }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: '#FFF', fontWeight: 800, fontSize: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {user?.username?.charAt(0).toUpperCase() || 'A'}
        </div>

        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)' }}>{user?.username || 'User Account'}</h2>
          <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
            <span className="badge badge-assigned">{user?.role || 'SuperAdmin'}</span>
            <span className="badge badge-completed">Active Employee</span>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '16px' }}>
          Account & Designation Info
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>USERNAME</div>
            <div style={{ fontSize: '14px', fontWeight: 700, marginTop: '2px' }}>{user?.username}</div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>SYSTEM ROLE</div>
            <div style={{ fontSize: '14px', fontWeight: 700, marginTop: '2px', color: 'var(--primary)' }}>{user?.role}</div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>ACCOUNT ID</div>
            <div style={{ fontSize: '14px', fontWeight: 700, marginTop: '2px' }}>#{user?.userId?.substring(0, 8).toUpperCase() || 'SYS-101'}</div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>STATUS</div>
            <div style={{ fontSize: '14px', fontWeight: 700, marginTop: '2px', color: '#10B981' }}>Verified Active</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
