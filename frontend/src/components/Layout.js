import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileNav from './MobileNav';

const Layout = () => {
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 1200);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 1200) {
        setCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleCollapse = () => setCollapsed(!collapsed);

  return (
    <div className="app-layout">
      {!isMobile && <Sidebar collapsed={collapsed} toggleCollapse={toggleCollapse} />}

      <div
        className="main-wrapper"
        style={{
          marginLeft: isMobile ? 0 : collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
          paddingBottom: isMobile ? '70px' : 0
        }}
      >
        <Header toggleSidebar={toggleCollapse} />
        <main className="main-content">
          <Outlet />
        </main>
      </div>

      {isMobile && <MobileNav />}
    </div>
  );
};

export default Layout;
