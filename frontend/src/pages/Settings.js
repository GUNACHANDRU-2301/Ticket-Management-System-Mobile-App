import React, { useContext, useState } from 'react';
import { Sun, Moon, Bell, Lock, Shield, Smartphone } from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';

const Settings = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savedMsg, setSavedMsg] = useState('');

  const handlePasswordChange = (e) => {
    e.preventDefault();
    setSavedMsg('Password updated successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
          System Settings & Preferences
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Customize interface theme, notification controls, and account security
        </p>
      </div>

      {/* APPEARANCE SECTION */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Sun size={20} style={{ color: 'var(--primary)' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>Appearance & Theme</h3>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border-color-light)' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>Theme Preference</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Current mode: <strong>{theme === 'dark' ? 'Deep Obsidian Dark Mode' : 'Clean Slate Light Mode'}</strong>
            </div>
          </div>

          <button className="btn btn-secondary" onClick={toggleTheme}>
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
          </button>
        </div>
      </div>

      {/* NOTIFICATIONS SECTION */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Bell size={20} style={{ color: 'var(--primary)' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>Notification Preferences</h3>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border-color-light)' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>Email Alerts</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Receive email notifications on ticket status updates</div>
          </div>
          <input
            type="checkbox"
            checked={emailAlerts}
            onChange={(e) => setEmailAlerts(e.target.checked)}
            style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>Push Notifications</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Real-time alerts for urgent maintenance tickets</div>
          </div>
          <input
            type="checkbox"
            checked={pushAlerts}
            onChange={(e) => setPushAlerts(e.target.checked)}
            style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
          />
        </div>
      </div>

      {/* SECURITY SECTION */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Lock size={20} style={{ color: 'var(--primary)' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>Security & Password</h3>
        </div>

        {savedMsg && (
          <div style={{ backgroundColor: 'var(--status-resolved-bg)', color: 'var(--status-resolved-text)', padding: '10px 14px', borderRadius: 'var(--radius-md)', marginBottom: '16px', fontSize: '13px', fontWeight: 600 }}>
            ✅ {savedMsg}
          </div>
        )}

        <form onSubmit={handlePasswordChange}>
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input type="password" className="form-control" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="form-label">New Password</label>
            <input type="password" className="form-control" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary">
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
