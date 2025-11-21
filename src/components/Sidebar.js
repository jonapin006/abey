import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import '../styles/sidebar.css';

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', icon: '🏠', label: 'INICIO' },
    { path: '/usuarios', icon: '👥', label: 'USUARIOS' },
    { path: '/reportes', icon: '📊', label: 'REPORTES' },
    { path: '/consultoria', icon: '💬', label: 'CONSULTORÍA' },
    { path: '/tutoriales', icon: '📚', label: 'TUTORIALES' },
  ];

  return (
    <div className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <h2 style={{ color: 'white', fontSize: '16px' }}>Abey Consultores</h2>
      </div>

      {/* Menu Items */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Footer Actions */}
      <div className="sidebar-footer">
        <button className="sidebar-item" onClick={handleLogout}>
          <span className="sidebar-icon">🚪</span>
          <span className="sidebar-label">CERRAR SESIÓN</span>
        </button>
        <Link to="/soporte" className="sidebar-item">
          <span className="sidebar-icon">💼</span>
          <span className="sidebar-label">SOPORTE</span>
        </Link>
        <Link to="/ayuda" className="sidebar-item">
          <span className="sidebar-icon">❓</span>
          <span className="sidebar-label">AYUDA</span>
        </Link>
        <Link to="/perfil" className="sidebar-item">
          <span className="sidebar-icon">👤</span>
          <span className="sidebar-label">PERFIL</span>
        </Link>
      </div>
    </div>
  );
}

export default Sidebar;
