import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Chip,
    Box,
    CircularProgress,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export const CompaniesTable = ({ companies, loading, onEdit, onDelete }) => {
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!companies || companies.length === 0) {
        return (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Box sx={{ color: 'text.secondary' }}>
                    No hay empresas registradas
                </Box>
            </Paper>
        );
    }

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Nombre</TableCell>
                        <TableCell>NIT</TableCell>
                        <TableCell>Industria</TableCell>
                        <TableCell>Ciudad</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Estado</TableCell>
                        <TableCell align="right">Acciones</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {companies.map((company) => (
                        <TableRow key={company.id} hover>
                            <TableCell>
                                <strong>{company.name}</strong>
                            </TableCell>
                            <TableCell>{company.company_id || '-'}</TableCell>
                            <TableCell>{company.industry || '-'}</TableCell>
                            <TableCell>{company.city || '-'}</TableCell>
                            <TableCell>{company.contact_email || '-'}</TableCell>
                            <TableCell>
                                <Chip
                                    label={company.status === 'active' ? 'Activa' : 'Inactiva'}
                                    color={company.status === 'active' ? 'success' : 'default'}
                                    size="small"
                                />
                            </TableCell>
                            <TableCell align="right">
                                <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => onEdit(company)}
                                >
                                    <EditIcon />
                                </IconButton>
                                <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => onDelete(company.id)}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};
