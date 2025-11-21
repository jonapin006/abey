import React from 'react';
import Sidebar from './Sidebar';
import '../styles/layout.css';

function Layout({ children }) {
  return (
    <div className="layout">
      <Sidebar />
      <div className="layout-content">
        {children}
      </div>
    </div>
  );
}

export default Layout;