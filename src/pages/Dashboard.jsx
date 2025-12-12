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
import {
  filterCompaniesByUserRole,
  shouldShowCompanySelector,
  getDisplayName,
  getAutoSelectedCompany,
  isDashboardLoading,
  getWelcomeMessage,
  getCurrentYear
} from '../services/dashboard/dashboardBusinessService';

/**
 * Dashboard Component
 * Main dashboard page showing KPI cards and company selector
 * Business logic delegated to dashboardBusinessService
 */
function Dashboard() {
  const { user } = useAuth();
  const { userProfile, loading: profileLoading } = useUserProfile();
  const { companies, loading: companiesLoading } = useCompanies();
  const [selectedCompany, setSelectedCompany] = useState('');

  // Use business logic service for company filtering
  const filteredCompanies = filterCompaniesByUserRole(companies, userProfile);

  // Use business logic service for UI state
  const showCompanySelector = shouldShowCompanySelector(
    filteredCompanies,
    profileLoading,
    companiesLoading
  );

  const displayName = getDisplayName(userProfile, user, profileLoading);
  const isLoading = isDashboardLoading(profileLoading, companiesLoading);
  const welcomeMessage = getWelcomeMessage(displayName);
  const currentYear = getCurrentYear();

  // Auto-select company when user has only one company
  useEffect(() => {
    const autoSelected = getAutoSelectedCompany(filteredCompanies);
    if (autoSelected) {
      setSelectedCompany(autoSelected);
    }
  }, [filteredCompanies]);

  return (
    <Layout>
      <Container maxWidth="xl">
        {!isLoading && (
          <>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                {welcomeMessage}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Panel de control de Abey Consultores
              </Typography>
            </Box>

            {/* Company Selector - Only show when user has multiple companies */}
            {showCompanySelector && (
              <Paper sx={{ p: 2, mb: 3 }}>
                <FormControl sx={{ minWidth: 250 }}>
                  <InputLabel>Seleccionar Empresa</InputLabel>
                  <Select
                    value={selectedCompany}
                    label="Seleccionar Empresa"
                    onChange={(e) => setSelectedCompany(e.target.value)}
                  >
                    {filteredCompanies.map((company) => (
                      <MenuItem key={company.id} value={company.id}>
                        {company.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Paper>
            )}

            {/* KPI Cards Only - No graphs or tables */}
            {console.log('🔍 Dashboard - selectedCompany:', selectedCompany, 'currentYear:', currentYear)}
            <KpiCards companyId={selectedCompany} year={currentYear} />
          </>
        )}
      </Container>
    </Layout>
  );
}

export default Dashboard;
