import React from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="dashboard">
        <h1>¡Bienvenido {user?.email}!</h1>
        <p>Panel de control de Abey Consultores</p>
        
        {/* Aquí puedes añadir tus gráficas y widgets */}
        <div className="dashboard-grid">
          {/* Cards del dashboard */}
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;
