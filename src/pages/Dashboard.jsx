import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import Layout from '../components/Layout.jsx';
import { useAuth } from '../context/AuthContext';
import { useUserProfile } from '../hooks/userProfile/useUserProfile';

function Dashboard() {
  const { user } = useAuth();
  const { userProfile } = useUserProfile();

  const displayName = userProfile?.full_name || user?.email || 'Usuario';

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

        {/* Dashboard Grid */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Usuarios
                </Typography>
                <Typography variant="h5" component="div">
                  --
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Reportes
                </Typography>
                <Typography variant="h5" component="div">
                  --
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Consultas
                </Typography>
                <Typography variant="h5" component="div">
                  --
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Indicadores
                </Typography>
                <Typography variant="h5" component="div">
                  --
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Tutoriales
                </Typography>
                <Typography variant="h5" component="div">
                  --
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Layout>
  );
}

export default Dashboard;
