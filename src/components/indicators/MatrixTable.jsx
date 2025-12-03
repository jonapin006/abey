import React from 'react';
import {
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Box,
    CircularProgress,
    Paper,
} from '@mui/material';

export const MatrixTable = ({ rows, loading, headerUnit }) => {
    if (loading) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Paper>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Fecha carga</TableCell>
                        <TableCell>Cliente</TableCell>
                        <TableCell>N° cliente</TableCell>
                        <TableCell>Período</TableCell>
                        <TableCell align="right">Consumo ({headerUnit})</TableCell>
                        <TableCell align="right">Costo total</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                No hay indicadores disponibles.
                            </TableCell>
                        </TableRow>
                    ) : (
                        rows.map((row) => (
                            <TableRow key={row.id}>
                                <TableCell>{row.fechaCarga}</TableCell>
                                <TableCell>{row.nombreCliente}</TableCell>
                                <TableCell>{row.numeroCliente}</TableCell>
                                <TableCell>{row.periodo}</TableCell>
                                <TableCell align="right">
                                    {row.consumption.toLocaleString()}
                                </TableCell>
                                <TableCell align="right">
                                    {row.rawTotalText || '$ 0'}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </Paper>
    );
};
