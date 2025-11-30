import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Chip,
  LinearProgress,
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Layout from '../components/Layout';
import DiagnosticResponsesTable from '../components/DiagnosticResponsesTable';
import { supabase } from '../lib/supabaseClient';

function Consultoria() {
  const [diagnostics, setDiagnostics] = useState([]);
  const [selectedDiagnostic, setSelectedDiagnostic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserDiagnostics();
  }, []);

  const fetchUserDiagnostics = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError('Usuario no autenticado');
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

      // Fetch diagnostics with creator information using the optimized view
      const diagnosticsUrl = `${API_URL}/environmental_diagnostics_with_creator?user_id=eq.${user.id}&order=created_at.desc`;
      const diagnosticsResponse = await fetch(diagnosticsUrl, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!diagnosticsResponse.ok) {
        throw new Error(`Error HTTP ${diagnosticsResponse.status}: ${diagnosticsResponse.statusText}`);
      }

      const diagnosticsData = await diagnosticsResponse.json();

      // For each diagnostic, calculate completion percentage
      const diagnosticsWithCompletion = await Promise.all(
        diagnosticsData.map(async (diagnostic) => { // Changed from diagnosticsWithUserInfo to diagnosticsData
          try {
            // Fetch all responses for this diagnostic (including all parts)
            const actionPlansUrl = `${API_URL}/diagnostic_responses_with_questions?diagnostic_id=eq.${diagnostic.id}`;
            const actionPlansResponse = await fetch(actionPlansUrl, {
              headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
            });

            if (actionPlansResponse.ok) {
              const responses = await actionPlansResponse.json();

              // Only count responses that have an action plan (action_plan_id is not null)
              const responsesWithActionPlan = responses.filter(r => r.action_plan_id !== null);
              const total = responsesWithActionPlan.length;
              const completed = responsesWithActionPlan.filter(r => r.action_plan_status === 'Completado').length;
              const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

              return {
                ...diagnostic,
                completionPercentage,
                totalActionPlans: total,
                completedActionPlans: completed,
              };
            }
          } catch (err) {
            console.error(`Error fetching action plans for diagnostic ${diagnostic.id}:`, err);
          }

          return {
            ...diagnostic,
            completionPercentage: 0,
            totalActionPlans: 0,
            completedActionPlans: 0,
          };
        })
      );

      setDiagnostics(diagnosticsWithCompletion || []);
    } catch (err) {
      console.error('Error fetching diagnostics:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDiagnostic = (diagnostic) => {
    setSelectedDiagnostic(diagnostic);
  };

  const handleBackToList = () => {
    setSelectedDiagnostic(null);
    fetchUserDiagnostics(); // Refresh the list to show updated data
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
          <DiagnosticResponsesTable diagnosticId={selectedDiagnostic.id} />
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
          <Grid container spacing={3}>
            {diagnostics.map((diagnostic) => (
              <Grid item xs={12} md={6} lg={4} key={diagnostic.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <AssignmentIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6" component="div">
                        {diagnostic.title || 'Diagnóstico Ambiental'}
                      </Typography>
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <strong>Fecha:</strong> {formatDate(diagnostic.created_at)}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <strong>Creado por:</strong> {diagnostic.creator_name || diagnostic.creator_email || 'Usuario desconocido'}
                    </Typography>

                    {/* Completion Percentage */}
                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          Progreso
                        </Typography>
                        <Typography variant="body2" fontWeight="bold" color="primary">
                          {diagnostic.completionPercentage || 0}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={diagnostic.completionPercentage || 0}
                        sx={{
                          height: 8,
                          borderRadius: 1,
                          backgroundColor: 'rgba(0, 0, 0, 0.1)',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 1,
                            backgroundColor:
                              (diagnostic.completionPercentage || 0) === 100 ? '#4caf50' :
                                (diagnostic.completionPercentage || 0) >= 50 ? '#2196f3' :
                                  '#ff9800'
                          }
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        {diagnostic.completedActionPlans || 0} de {diagnostic.totalActionPlans || 0} completados
                      </Typography>
                    </Box>
                  </CardContent>

                  <CardActions>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<VisibilityIcon />}
                      onClick={() => handleViewDiagnostic(diagnostic)}
                      fullWidth
                    >
                      Ver Detalle
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Layout>
  );
}

export default Consultoria;
