import React from 'react';
import { Grid, Box, Paper } from '@mui/material';
import { useLogin } from '../hooks/auth/useLogin';
import { LoginForm } from '../components/auth/LoginForm';
import bgLogin from '../assets/bg-login.png';
import logo from '../assets/logo.png';

function LoginPage() {
  const {
    formData,
    loading,
    error,
    handleChange,
    handleSubmit
  } = useLogin();

  return (
    <Grid container component="main" sx={{ height: '100vh' }}>
      {/* Left Side - Image */}
      <Grid
        item
        xs={false}
        sm={4}
        md={7}
        sx={{
          backgroundImage: `url(${bgLogin})`,
          backgroundRepeat: 'no-repeat',
          backgroundColor: (t) =>
            t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: { xs: 'none', sm: 'block' }
        }}
      />

      {/* Right Side - Form */}
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Box
          sx={{
            my: 8,
            mx: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Box sx={{ mb: 4 }}>
            <img
              src={logo}
              alt="Abey Consultores"
              style={{ maxWidth: '200px', height: 'auto' }}
            />
          </Box>

          <LoginForm
            formData={formData}
            loading={loading}
            error={error}
            onChange={handleChange}
            onSubmit={handleSubmit}
          />
        </Box>
      </Grid>
    </Grid>
  );
}

export default LoginPage;
