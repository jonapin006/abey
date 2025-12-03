import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import Layout from '../components/Layout.jsx';
import DiagnosticResponsesTable from '../components/consulting/DiagnosticResponsesTable';
import { DiagnosticsList } from '../components/consulting/DiagnosticsList';
import { useDiagnostics } from '../hooks/consulting/useDiagnostics';
import { useDiagnosticResponses } from '../hooks/consulting/useDiagnosticResponses';

function Consultoria() {
  // Hook for list view
  const { diagnostics, loading, error, refetch } = useDiagnostics();

  // State for selected diagnostic
  const [selectedDiagnostic, setSelectedDiagnostic] = useState(null);

  // Hook for detail view (only active when selectedDiagnostic is set)
  const {
    responses,
    loading: responsesLoading,
    error: responsesError,
    updating,
    updateStatus
  } = useDiagnosticResponses(selectedDiagnostic?.id);

  const handleViewDiagnostic = (diagnostic) => {
    setSelectedDiagnostic(diagnostic);
  };

  const handleBackToList = () => {
    setSelectedDiagnostic(null);
    refetch(); // Refresh the list to show updated data
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Si hay un diagnóstico seleccionado, mostrar el detalle
  if (selectedDiagnostic) {
    return (
      <Layout>
        <Container maxWidth="xl">
          <Box sx={{ mb: 3 }}>
            <Button
              variant="outlined"
              onClick={handleBackToList}
              sx={{ mb: 2 }}
            >
              ← Volver a la lista
            </Button>
            <Typography variant="h4" component="h1" gutterBottom>
              {selectedDiagnostic.title || `Diagnóstico - ${formatDate(selectedDiagnostic.created_at)}`}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Creado el {formatDate(selectedDiagnostic.created_at)}
            </Typography>
          </Box>

          <DiagnosticResponsesTable
            responses={responses}
            loading={responsesLoading}
            error={responsesError}
            updating={updating}
            onStatusChange={updateStatus}
            diagnosticId={selectedDiagnostic.id}
          />
        </Container>
      </Layout>
    );
  }

  // Vista de lista de diagnósticos
  return (
    <Layout>
      <Container maxWidth="xl">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Diagnósticos y Mejora Continua
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestiona tus diagnósticos ambientales y planes de acción
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">Error: {error}</Alert>
        ) : diagnostics.length === 0 ? (
          <Alert severity="info">
            No tienes diagnósticos creados aún.
          </Alert>
        ) : (
          <DiagnosticsList
            diagnostics={diagnostics}
            onViewDetail={handleViewDiagnostic}
          />
        )}
      </Container>
    </Layout>
  );
}

export default Consultoria;
