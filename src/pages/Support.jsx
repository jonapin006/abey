import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import Layout from '../components/Layout.jsx';

function Soporte() {
  return (
    <Layout>
      <Container maxWidth="xl">
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Soporte
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestión de Soporte
          </Typography>
        </Box>
      </Container>
    </Layout>
  );
}

export default Soporte;
