import React from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Avatar,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useSignup } from '../hooks/auth/useSignup';
import { SignupForm } from '../components/auth/SignupForm';

function SignupPage() {
  const {
    formData,
    loading,
    error,
    successMessage,
    handleChange,
    handleSubmit
  } = useSignup();

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Crear Cuenta
          </Typography>

          <SignupForm
            formData={formData}
            loading={loading}
            error={error}
            successMessage={successMessage}
            onChange={handleChange}
            onSubmit={handleSubmit}
          />
        </Paper>
      </Box>
    </Container>
  );
}

export default SignupPage;