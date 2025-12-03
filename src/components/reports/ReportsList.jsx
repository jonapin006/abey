import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Box,
    Button,
    Alert,
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';

export const ReportsList = ({ diagnostics, onViewDetails }) => {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    if (diagnostics.length === 0) {
        return <Alert severity="info">No tienes diagnósticos para mostrar.</Alert>;
    }

    return (
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
                                    onClick={() => onViewDetails(diagnostic)}
                                >
                                    Ver Detalle
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};
