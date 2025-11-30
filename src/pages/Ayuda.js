import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import Layout from '../components/Layout';

function Ayuda() {
  return (
    <Layout>
      <Container maxWidth="xl">
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Ayuda
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Centro de ayuda
          </Typography>
        </Box>
      </Container>
    </Layout>
  );
}

export default Ayuda;
