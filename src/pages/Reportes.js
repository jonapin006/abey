import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Alert,
  CircularProgress,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import { BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabaseClient';

function Reportes() {
  const [diagnostics, setDiagnostics] = useState([]);
  const [selectedDiagnostic, setSelectedDiagnostic] = useState(null);
  const [diagnosticDetails, setDiagnosticDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartType, setChartType] = useState('bar');

  useEffect(() => {
    fetchDiagnostics();
  }, []);

  const fetchDiagnostics = async () => {
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
      const diagnosticsUrl = `${API_URL}/environmental_diagnostics?user_id=eq.${user.id}&order=created_at.desc`;

      const response = await fetch(diagnosticsUrl, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}`);
      }

      const data = await response.json();

      // Calculate completion for each diagnostic
      const diagnosticsWithStats = await Promise.all(
        data.map(async (diagnostic) => {
          const statsUrl = `${API_URL}/diagnostic_responses_with_questions?diagnostic_id=eq.${diagnostic.id}`;
          const statsResponse = await fetch(statsUrl, {
            headers: {
              'Accept': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });

          if (statsResponse.ok) {
            const responses = await statsResponse.json();
            const withActionPlan = responses.filter(r => r.action_plan_id !== null);
            const total = withActionPlan.length;
            const completed = withActionPlan.filter(r => r.action_plan_status === 'Completado').length;
            const inProgress = withActionPlan.filter(r => r.action_plan_status === 'En progreso').length;
            const pending = withActionPlan.filter(r => r.action_plan_status === 'Por hacer').length;

            return {
              ...diagnostic,
              total,
              completed,
              inProgress,
              pending,
              completionPercentage: total > 0 ? Math.round((completed / total) * 100) : 0,
            };
          }

          return diagnostic;
        })
      );

      setDiagnostics(diagnosticsWithStats);
    } catch (err) {
      console.error('Error fetching diagnostics:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDiagnosticDetails = async (diagnostic) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

      const url = `${API_URL}/diagnostic_responses_with_questions?diagnostic_id=eq.${diagnostic.id}`;
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const responses = await response.json();

        // Group by part
        const byPart = responses.reduce((acc, r) => {
          if (!acc[r.part_description]) {
            acc[r.part_description] = {
              total: 0,
              completed: 0,
              inProgress: 0,
              pending: 0,
            };
          }

          if (r.action_plan_id) {
            acc[r.part_description].total++;
            if (r.action_plan_status === 'Completado') acc[r.part_description].completed++;
            if (r.action_plan_status === 'En progreso') acc[r.part_description].inProgress++;
            if (r.action_plan_status === 'Por hacer') acc[r.part_description].pending++;
          }

          return acc;
        }, {});

        setDiagnosticDetails(byPart);
      }
    } catch (err) {
      console.error('Error fetching diagnostic details:', err);
    }
  };

  const handleViewDetails = (diagnostic) => {
    setSelectedDiagnostic(diagnostic);
    fetchDiagnosticDetails(diagnostic);
  };

  const handleBack = () => {
    setSelectedDiagnostic(null);
    setDiagnosticDetails(null);
    fetchDiagnostics(); // Refresh the list to show updated data
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Vista de detalle con gráfica
  if (selectedDiagnostic && diagnosticDetails) {
    // Only include sections that have action plans (total > 0)
    const chartData = Object.entries(diagnosticDetails)
      .filter(([part, stats]) => stats.total > 0)
      .map(([part, stats]) => ({
        name: part,
        Completado: stats.completed,
        'En progreso': stats.inProgress,
        'Por hacer': stats.pending,
      }));

    return (
      <Layout>
        <Container maxWidth="xl">
          <Box sx={{ mb: 3 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={handleBack}
              sx={{ mb: 2 }}
            >
              Volver a la lista
            </Button>
            <Typography variant="h4" component="h1" gutterBottom>
              {selectedDiagnostic.title || `Diagnóstico - ${formatDate(selectedDiagnostic.created_at)}`}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Reporte de completitud por sección
            </Typography>
          </Box>

          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Total Planes
                  </Typography>
                  <Typography variant="h4">
                    {selectedDiagnostic.total || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ backgroundColor: '#e8f5e9' }}>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Completados
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {selectedDiagnostic.completed || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ backgroundColor: '#e3f2fd' }}>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    En Progreso
                  </Typography>
                  <Typography variant="h4" color="primary.main">
                    {selectedDiagnostic.inProgress || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ backgroundColor: '#fff3e0' }}>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Por Hacer
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {selectedDiagnostic.pending || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Chart Section */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                Estado por Sección
              </Typography>
              <ToggleButtonGroup
                value={chartType}
                exclusive
                onChange={(e, newType) => newType && setChartType(newType)}
                size="small"
              >
                <ToggleButton value="bar">
                  <BarChartIcon sx={{ mr: 1 }} />
                  Barras
                </ToggleButton>
                <ToggleButton value="pie">
                  <PieChartIcon sx={{ mr: 1 }} />
                  Torta
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {chartType === 'bar' ? (
              <ResponsiveContainer width="100%" height={450}>
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={120}
                    interval={0}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    label={{ value: 'Cantidad de Planes', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip />
                  <Legend
                    verticalAlign="top"
                    wrapperStyle={{ paddingBottom: '20px' }}
                  />
                  <Bar dataKey="Completado" fill="#4caf50" />
                  <Bar dataKey="En progreso" fill="#2196f3" />
                  <Bar dataKey="Por hacer" fill="#ff9800" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <ResponsiveContainer width="100%" height={500}>
                  <PieChart>
                    <Pie
                      data={[
                        {
                          name: 'Completado',
                          value: chartData.reduce((sum, item) => sum + item.Completado, 0),
                          fill: '#4caf50'
                        },
                        {
                          name: 'En progreso',
                          value: chartData.reduce((sum, item) => sum + item['En progreso'], 0),
                          fill: '#2196f3'
                        },
                        {
                          name: 'Por hacer',
                          value: chartData.reduce((sum, item) => sum + item['Por hacer'], 0),
                          fill: '#ff9800'
                        },
                      ].filter(item => item.value > 0)}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={150}
                      dataKey="value"
                      fill="fill"
                    />
                    <Tooltip
                      formatter={(value, name) => [`${value} planes`, name]}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            )}
          </Paper>

          {/* Details Table */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Sección</TableCell>
                  <TableCell align="center">Total</TableCell>
                  <TableCell align="center">Completado</TableCell>
                  <TableCell align="center">En Progreso</TableCell>
                  <TableCell align="center">Por Hacer</TableCell>
                  <TableCell align="center">% Completitud</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(diagnosticDetails)
                  .filter(([part, stats]) => stats.total > 0)
                  .map(([part, stats]) => (
                    <TableRow key={part} hover>
                      <TableCell>{part}</TableCell>
                      <TableCell align="center">{stats.total}</TableCell>
                      <TableCell align="center" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                        {stats.completed}
                      </TableCell>
                      <TableCell align="center" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                        {stats.inProgress}
                      </TableCell>
                      <TableCell align="center" sx={{ color: 'warning.main', fontWeight: 'bold' }}>
                        {stats.pending}
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                        {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
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
        ) : diagnostics.length === 0 ? (
          <Alert severity="info">No tienes diagnósticos para mostrar.</Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Diagnóstico</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell align="center">Total Planes</TableCell>
                  <TableCell align="center">Completados</TableCell>
                  <TableCell align="center">En Progreso</TableCell>
                  <TableCell align="center">Por Hacer</TableCell>
                  <TableCell align="center">% Completitud</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {diagnostics.map((diagnostic) => (
                  <TableRow key={diagnostic.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AssessmentIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body2">
                          {diagnostic.title || 'Diagnóstico Ambiental'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{formatDate(diagnostic.created_at)}</TableCell>
                    <TableCell align="center">{diagnostic.total || 0}</TableCell>
                    <TableCell align="center" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                      {diagnostic.completed || 0}
                    </TableCell>
                    <TableCell align="center" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                      {diagnostic.inProgress || 0}
                    </TableCell>
                    <TableCell align="center" sx={{ color: 'warning.main', fontWeight: 'bold' }}>
                      {diagnostic.pending || 0}
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" fontWeight="bold">
                        {diagnostic.completionPercentage || 0}%
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleViewDetails(diagnostic)}
                      >
                        Ver Detalle
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>
    </Layout>
  );
}

export default Reportes;
