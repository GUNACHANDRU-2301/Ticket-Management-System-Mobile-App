import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, AlertOctagon, ServerOff } from 'lucide-react';

export const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>404</div>
      <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>Page Not Found</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>The requested resource or page does not exist.</p>
      <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
        Go to Dashboard
      </button>
    </div>
  );
};

export const AccessDenied = () => {
  const navigate = useNavigate();
  return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <ShieldAlert size={56} style={{ color: '#EF4444', marginBottom: '16px' }} />
      <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>Access Restricted</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>You don't have administrator permissions to access this section.</p>
      <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
        Go to Dashboard
      </button>
    </div>
  );
};
