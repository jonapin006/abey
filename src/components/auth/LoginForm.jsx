import React, { useState } from 'react';
import {
    Box,
    Button,
    TextField,
    Alert,
    CircularProgress,
    InputAdornment,
    IconButton,
    Typography,
    Link,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { Link as RouterLink } from 'react-router-dom';

export const LoginForm = ({
    formData,
    loading,
    error,
    onChange,
    onSubmit
}) => {
    const [showPassword, setShowPassword] = useState(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    return (
        <Box component="form" onSubmit={onSubmit} sx={{ width: '100%', maxWidth: 400, mx: 'auto' }}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ textAlign: 'center', mb: 3, fontWeight: 'bold', color: '#333' }}>
                Iniciar Sesión
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Correo Electrónico"
                name="email"
                autoComplete="email"
                autoFocus
                value={formData.email}
                onChange={onChange('email')}
                disabled={loading}
                placeholder="ejemplo@correo.com"
                sx={{ mb: 2 }}
            />

            <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={onChange('password')}
                disabled={loading}
                placeholder="••••••"
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                                aria-label="toggle password visibility"
                                onClick={handleClickShowPassword}
                                edge="end"
                            >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
                sx={{ mb: 3 }}
            />

            <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    textTransform: 'none',
                    borderRadius: 2
                }}
            >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Entrar'}
            </Button>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Link component={RouterLink} to="/signup" variant="body2" underline="hover">
                    ¿No tienes cuenta? Regístrate aquí
                </Link>
            </Box>
        </Box>
    );
};
