import React from 'react';
import {
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    Typography,
    Box,
    LinearProgress,
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import VisibilityIcon from '@mui/icons-material/Visibility';

export const DiagnosticsList = ({ diagnostics, onViewDetail }) => {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
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
                                onClick={() => onViewDetail(diagnostic)}
                                fullWidth
                            >
                                Ver Detalle
                            </Button>
                        </CardActions>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};
