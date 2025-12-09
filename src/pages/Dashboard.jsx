import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
} from '@mui/material';
import Layout from '../components/Layout.jsx';
import { useAuth } from '../context/AuthContext';
import { useUserProfile } from '../hooks/userProfile/useUserProfile';
import { useCompanies } from '../hooks/companies/useCompanies';
import { KpiCards } from '../components/indicators/KpiCards';

function Dashboard() {
  const { user } = useAuth();
  const { userProfile } = useUserProfile();
  const { companies } = useCompanies();
  const [selectedCompany, setSelectedCompany] = useState('');

  const displayName = userProfile?.full_name || user?.email || 'Usuario';

  // Check if user is admin (can see all companies)
  const isAdmin = companies.length > 1;

  // Auto-select company for non-admin users
  useEffect(() => {
    if (!isAdmin && companies.length === 1) {
      setSelectedCompany(companies[0].id);
    }
  }, [companies, isAdmin]);

  return (
    <Layout>
      <Container maxWidth="xl">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            ¡Bienvenido {displayName}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Panel de control de Abey Consultores
          </Typography>
        </Box>

        {/* Company Selector - Only for admins */}
        {isAdmin && (
          <Paper sx={{ p: 2, mb: 3 }}>
            <FormControl sx={{ minWidth: 250 }}>
              <InputLabel>Seleccionar Empresa</InputLabel>
              <Select
                value={selectedCompany}
                label="Seleccionar Empresa"
                onChange={(e) => setSelectedCompany(e.target.value)}
              >
                {companies.map((company) => (
                  <MenuItem key={company.id} value={company.id}>
                    {company.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Paper>
        )}

        {/* KPI Cards Only - No graphs or tables */}
        <KpiCards companyId={selectedCompany} year={new Date().getFullYear()} />
      </Container>
    </Layout>
  );
}

export default Dashboard;
