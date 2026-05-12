import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import TopAppBar from './TopAppBar';
import BottomNavBar from './BottomNavBar';

const Layout: React.FC = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen pb-32">
      {!isHomePage && <TopAppBar />}
      <main className={!isHomePage ? "px-6 pt-6 space-y-8 relative overflow-hidden" : ""}>
        <Outlet />
      </main>
      {!isHomePage && <BottomNavBar />}
    </div>
  );
};

export default Layout;
