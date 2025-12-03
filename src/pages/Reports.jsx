import React from 'react';
import {
  Container,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import Layout from '../components/Layout.jsx';
import { useReports } from '../hooks/reports/useReports';
import { ReportsList } from '../components/reports/ReportsList';
import { ReportDetail } from '../components/reports/ReportDetail';

function Reportes() {
  const {
    diagnostics,
    selectedDiagnostic,
    diagnosticDetails,
    loading,
    error,
    chartType,
    setChartType,
    handleViewDetails,
    handleBack
  } = useReports();

  // Detail View
  if (selectedDiagnostic && diagnosticDetails) {
    return (
      <Layout>
        <Container maxWidth="xl">
          <ReportDetail
            diagnostic={selectedDiagnostic}
            details={diagnosticDetails}
            chartType={chartType}
            onChartTypeChange={setChartType}
            onBack={handleBack}
          />
        </Container>
      </Layout>
    );
  }

  // List View
  return (
    <Layout>
      <Container maxWidth="xl">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Reportes
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Visualiza el estado de completitud de tus diagnósticos
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">Error: {error}</Alert>
        ) : (
          <ReportsList
            diagnostics={diagnostics}
            onViewDetails={handleViewDetails}
          />
        )}
      </Container>
    </Layout>
  );
}

export default Reportes;
