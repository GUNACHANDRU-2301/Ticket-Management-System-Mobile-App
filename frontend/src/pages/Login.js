import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, User, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import Logo from '../components/Logo';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMessage('Please enter both username and password.');
      return;
    }

    setErrorMessage('');
    setLoading(true);

    const result = await login(username.trim(), password.trim());
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setErrorMessage(result.message);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        width: '100vw',
        backgroundColor: 'var(--bg-body)'
      }}
    >
      {/* LEFT SIDE: Dark Modern Branded Section */}
      <div
        style={{
          flex: 1,
          backgroundColor: '#0F172A',
          color: '#FFFFFF',
          padding: '60px',
          display: 'none',
          mdDisplay: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden'
        }}
        className="login-left-panel"
      >
        {/* Background Ambient Glow & Grid Accent */}
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            left: '-20%',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, rgba(15,23,42,0) 70%)',
            pointerEvents: 'none'
          }}
        />

        {/* Top Branding Header */}
        <div style={{ zIndex: 2 }}>
          <Logo size="large" light />
        </div>

        {/* Middle Main Headline & Abstract Graphic */}
        <div style={{ zIndex: 2, maxWidth: '520px', margin: '40px 0' }}>
          <h1
            style={{
              fontSize: '42px',
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-1px',
              marginBottom: '20px',
              color: '#FFFFFF'
            }}
          >
            Keep Your Campus Running Smoothly.
          </h1>
          <p style={{ fontSize: '18px', color: '#94A3B8', lineHeight: 1.6, marginBottom: '32px' }}>
            Report, manage and resolve facility issues from one intelligent platform. Streamlined maintenance for modern institutions.
          </p>

          {/* Feature Highlights Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <FeaturePill icon={<Zap size={18} />} title="Instant Ticketing" desc="Log issues in seconds" />
            <FeaturePill icon={<ShieldCheck size={18} />} title="Role-Based Security" desc="Granular permissions" />
            <FeaturePill icon={<CheckCircle2 size={18} />} title="Real-Time Analytics" desc="Audit & SLA tracking" />
            <FeaturePill icon={<Zap size={18} />} title="Smart Dispatch" desc="Auto-route to technicians" />
          </div>
        </div>

        {/* Bottom Footer Note */}
        <div style={{ zIndex: 2, fontSize: '13px', color: '#64748B' }}>
          © 2026 TMS Facility Management System. All rights reserved.
        </div>
      </div>

      {/* RIGHT SIDE: Modern Sign-In Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '40px 32px',
          margin: '0 auto',
          backgroundColor: 'var(--bg-body)'
        }}
      >
        <div style={{ width: '100%', maxWidth: '420px' }}>
          {/* Mobile Logo Fallback */}
          <div style={{ marginBottom: '32px', textAlign: 'center' }}>
            <Logo size="medium" />
          </div>

          <div style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
              Welcome back
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Sign in to continue to TMS Facility Management
            </p>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div
              style={{
                backgroundColor: 'var(--status-hold-bg)',
                color: 'var(--status-hold-text)',
                border: '1px solid var(--status-hold-border)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                marginBottom: '20px',
                fontSize: '13px',
                fontWeight: 600
              }}
            >
              ⚠️ {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Username Input */}
            <div className="form-group">
              <label className="form-label">Username</label>
              <div style={{ position: 'relative' }}>
                <User
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)'
                  }}
                />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{ paddingLeft: '42px', height: '44px' }}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
                <a
                  href="#forgot"
                  onClick={(e) => { e.preventDefault(); alert('Please contact system administrator to reset password.'); }}
                  style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600 }}
                >
                  Forgot password?
                </a>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)'
                  }}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '42px', paddingRight: '42px', height: '44px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--primary)', cursor: 'pointer' }}
              />
              <label htmlFor="remember" style={{ fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                Remember me on this device
              </label>
            </div>

            {/* Sign In Primary CTA */}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', height: '46px', fontSize: '15px' }}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const FeaturePill = ({ icon, title, desc }) => (
  <div
    style={{
      backgroundColor: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.08)',
      padding: '12px 14px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    }}
  >
    <div style={{ color: '#818CF8' }}>{icon}</div>
    <div>
      <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>{title}</div>
      <div style={{ fontSize: '11px', color: '#94A3B8' }}>{desc}</div>
    </div>
  </div>
);

export default Login;
