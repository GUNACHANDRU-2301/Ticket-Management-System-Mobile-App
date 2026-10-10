import React from 'react';

const Logo = ({ size = 'medium', collapsed = false, light = false }) => {
  const iconSizes = {
    small: 28,
    medium: 36,
    large: 48
  };

  const currentSize = iconSizes[size] || iconSizes.medium;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: collapsed ? '0' : '12px' }}>
      <svg
        width={currentSize}
        height={currentSize}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <rect width="40" height="40" rx="10" fill="url(#tms-grad)" />
        <path
          d="M12 14C12 12.8954 12.8954 12 14 12H26C27.1046 12 28 12.8954 28 14V26C28 27.1046 27.1046 28 26 28H14C12.8954 28 12 27.1046 12 26V14Z"
          stroke="white"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path
          d="M18 18L22 22L28 15"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="16" cy="24" r="1.5" fill="white" />
        <defs>
          <linearGradient id="tms-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6366F1" />
            <stop offset="1" stopColor="#3B82F6" />
          </linearGradient>
        </defs>
      </svg>

      {!collapsed && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
          <span
            style={{
              fontSize: size === 'large' ? '24px' : size === 'small' ? '16px' : '18px',
              fontWeight: 800,
              letterSpacing: '-0.5px',
              color: light ? '#FFFFFF' : 'var(--text-main)'
            }}
          >
            TMS
          </span>
          <span
            style={{
              fontSize: size === 'large' ? '12px' : '10px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              color: light ? '#94A3B8' : 'var(--text-muted)'
            }}
          >
            Facility Management
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
