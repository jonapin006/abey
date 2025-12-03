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

export const UsersTable = ({ users, loading, onEdit, onDelete }) => {
    const getRoleColor = (hierarchyLevel) => {
        if (hierarchyLevel === 1) return 'error';
        if (hierarchyLevel === 2) return 'warning';
        if (hierarchyLevel === 3) return 'info';
        return 'default';
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Email</TableCell>
                        <TableCell>Nombre</TableCell>
                        <TableCell>Rol</TableCell>
                        <TableCell>Nivel Jerárquico</TableCell>
                        <TableCell>Empresa</TableCell>
                        <TableCell align="right">Acciones</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user.user_id} hover>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.full_name || '-'}</TableCell>
                            <TableCell>
                                <Chip
                                    label={user.role_name}
                                    color={getRoleColor(user.hierarchy_level)}
                                    size="small"
                                />
                            </TableCell>
                            <TableCell>{user.hierarchy_level}</TableCell>
                            <TableCell>{user.company_name || '-'}</TableCell>
                            <TableCell align="right">
                                <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => onEdit(user)}
                                >
                                    <EditIcon />
                                </IconButton>
                                <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => onDelete(user.user_id)}
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
