import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Users from './pages/Users.jsx';
import Companies from './pages/Companies.jsx';
import Reports from './pages/Reports.jsx';
import Consulting from './pages/Consulting.jsx';
import Indicators from './pages/Indicators.jsx';
import InvoiceHistory from './pages/indicators/InvoiceHistory';
import KPIPage from './pages/indicators/KPIPage';
import IndicatorsMatrix from './pages/IndicatorsMatrix.jsx';
import Tutorials from './pages/Tutorials.jsx';
import Support from './pages/Support.jsx';
import Help from './pages/Help.jsx';
import Profile from './pages/Profile.jsx';
import SignupPage from './pages/SignupPage.jsx';
import ActionPlanView from './pages/ActionPlanView.jsx';
import ChatWidget from './components/ChatWidget.jsx';
import theme from './theme';
import './styles/app.css';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
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
          path="/users"
          element={
            <PrivateRoute>
              <Users />
            </PrivateRoute>
          }
        />
        <Route
          path="/companies"
          element={
            <PrivateRoute>
              <Companies />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <PrivateRoute>
              <Reports />
            </PrivateRoute>
          }
        />
        <Route
          path="/consulting"
          element={
            <PrivateRoute>
              <Consulting />
            </PrivateRoute>
          }
        />
        <Route
          path="/indicators"
          element={<Navigate to="/indicators/invoices" replace />}
        />
        <Route
          path="/indicators/invoices"
          element={
            <PrivateRoute>
              <InvoiceHistory />
            </PrivateRoute>
          }
        />
        <Route
          path="/indicators/dashboard"
          element={
            <PrivateRoute>
              <KPIPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/indicators/matrix/:type/:year"
          element={
            <PrivateRoute>
              <IndicatorsMatrix />
            </PrivateRoute>
          }
        />
        <Route
          path="/tutorials"
          element={
            <PrivateRoute>
              <Tutorials />
            </PrivateRoute>
          }
        />
        <Route
          path="/support"
          element={
            <PrivateRoute>
              <Support />
            </PrivateRoute>
          }
        />
        <Route
          path="/help"
          element={
            <PrivateRoute>
              <Help />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
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
        <Route
          path="/action-plan/:diagnosticId/:responseId"
          element={
            <PrivateRoute>
              <ActionPlanView />
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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter basename="/abey">
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
