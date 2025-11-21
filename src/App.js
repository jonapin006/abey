import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Usuarios from './pages/Usuarios';
import Reportes from './pages/Reportes';
import Consultoria from './pages/Consultoria';
import Tutoriales from './pages/Tutoriales';
import Soporte from './pages/Soporte';
import Ayuda from './pages/Ayuda';
import Perfil from './pages/Perfil';
import SignupPage from './pages/SignupPage';
import ChatWidget from './components/ChatWidget';
import './styles/app.css';

// Componente para proteger rutas privadas
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen">Cargando...</div>;
  }

  return user ? children : <Navigate to="/login" />;
}

function AppContent() {
  const { user } = useAuth();

  return (
    <>
      <Routes>
        {/* Ruta pública */}
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
        
        {/* Rutas privadas (protegidas) */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/usuarios"
          element={
            <PrivateRoute>
              <Usuarios />
            </PrivateRoute>
          }
        />
        <Route
          path="/reportes"
          element={
            <PrivateRoute>
              <Reportes />
            </PrivateRoute>
          }
        />
        <Route
          path="/consultoria"
          element={
            <PrivateRoute>
              <Consultoria />
            </PrivateRoute>
          }
        />
        <Route
          path="/tutoriales"
          element={
            <PrivateRoute>
              <Tutoriales />
            </PrivateRoute>
          }
        />
        <Route
          path="/soporte"
          element={
            <PrivateRoute>
              <Soporte />
            </PrivateRoute>
          }
        />
        <Route
          path="/ayuda"
          element={
            <PrivateRoute>
              <Ayuda />
            </PrivateRoute>
          }
        />
        <Route
          path="/perfil"
          element={
            <PrivateRoute>
              <Perfil />
            </PrivateRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PrivateRoute>
              <SignupPage />
            </PrivateRoute>
          }
        />

        {/* Redirección por defecto */}
        <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {/* ChatWidget solo visible para usuarios autenticados */}
      {user && <ChatWidget />}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename="/abey">
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
