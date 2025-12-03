import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    Alert,
    Button,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Layout from '../components/Layout.jsx';
import { useMatrixData } from '../hooks/indicators/useMatrixData';
import { MatrixTable } from '../components/indicators/MatrixTable';

function IndicadoresMatriz() {
    const { type, year } = useParams();
    const navigate = useNavigate();

    const { rows, loading, error, dbType, headerUnit } = useMatrixData(type, year);

    const getTitleByType = () => `Matriz de Indicadores de ${dbType || ''}`;

    return (
        <Layout>
            <Container maxWidth="lg">
                <Box sx={{ mt: 4, mb: 3 }}>
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate('/indicators')}
                        sx={{ mb: 2 }}
                    >
                        Volver
                    </Button>
                    <Typography variant="h4" component="h1" gutterBottom>
                        {getTitleByType()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Resumen de consumo y costos por factura. Año {year}.
                    </Typography>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <MatrixTable
                    rows={rows}
                    loading={loading}
                    headerUnit={headerUnit}
                />
            </Container>
        </Layout>
    );
}

export default IndicadoresMatriz;
