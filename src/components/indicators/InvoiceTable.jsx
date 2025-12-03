import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Typography,
    Box,
    Chip,
    Button,
    Tooltip,
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';

const getStatusColor = (status) => {
    switch (status) {
        case 'Procesado':
            return 'success';
        case 'Error':
            return 'error';
        default:
            return 'warning';
    }
};

export const InvoiceTable = ({ invoices, loading, onViewFile }) => {
    return (
        <TableContainer>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Fecha Carga</TableCell>
                        <TableCell>Archivo</TableCell>
                        <TableCell>Tipo</TableCell>
                        <TableCell>Año</TableCell>
                        <TableCell>Sede</TableCell>
                        <TableCell>Detalles</TableCell>
                        <TableCell>Estado</TableCell>
                        <TableCell align="right">Acciones</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                                <CircularProgress />
                            </TableCell>
                        </TableRow>
                    ) : invoices.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                                <Typography color="text.secondary">
                                    No hay facturas registradas con estos filtros
                                </Typography>
                            </TableCell>
                        </TableRow>
                    ) : (
                        invoices.map((invoice) => (
                            <TableRow key={invoice.id}>
                                <TableCell>
                                    {new Date(invoice.created_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <DescriptionIcon
                                            fontSize="small"
                                            sx={{ mr: 1, color: 'text.secondary' }}
                                        />
                                        {invoice.file_name}
                                    </Box>
                                </TableCell>
                                <TableCell>{invoice.type}</TableCell>
                                <TableCell>{invoice.year}</TableCell>
                                <TableCell>
                                    {invoice.headquarters?.name || 'Desconocida'}
                                </TableCell>
                                <TableCell>
                                    {invoice.data && (
                                        <Tooltip
                                            title={JSON.stringify(invoice.data, null, 2)}
                                        >
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    cursor: 'help',
                                                    textDecoration: 'underline',
                                                }}
                                            >
                                                Ver datos
                                            </Typography>
                                        </Tooltip>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={invoice.status}
                                        color={getStatusColor(invoice.status)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <Button
                                        size="small"
                                        onClick={() => onViewFile(invoice)}
                                    >
                                        Ver
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};
