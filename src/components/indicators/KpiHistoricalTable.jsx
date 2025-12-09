import React from 'react';
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Chip,
    Box
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

export const KpiHistoricalTable = ({ data, unit }) => {
    if (!data || data.length === 0) {
        return null;
    }

    return (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <Box sx={{ p: 2 }}>
                <Typography variant="h6">Histórico de Evaluaciones</Typography>
            </Box>
            <TableContainer sx={{ maxHeight: 440 }}>
                <Table stickyHeader aria-label="sticky table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Mes</TableCell>
                            <TableCell align="right">Consumo Real</TableCell>
                            <TableCell align="right">Meta</TableCell>
                            <TableCell align="center">Estado</TableCell>
                            <TableCell align="right">Desviación</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map((row) => {
                            const isWithinTarget = row.value <= row.target;
                            // Calculate deviation as savings: (target - actual) / target
                            // Positive = saved (consumed less than target) = green
                            // Negative = exceeded (consumed more than target) = red
                            const deviation = row.target > 0 ? ((row.target - row.value) / row.target) * 100 : 0;

                            return (
                                <TableRow hover role="checkbox" tabIndex={-1} key={row.month}>
                                    <TableCell component="th" scope="row">
                                        {row.month}
                                    </TableCell>
                                    <TableCell align="right">
                                        {row.value.toLocaleString()} {unit}
                                    </TableCell>
                                    <TableCell align="right">
                                        {row.target.toLocaleString()} {unit}
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            icon={isWithinTarget ? <CheckCircleIcon /> : <CancelIcon />}
                                            label={isWithinTarget ? 'Cumple' : 'No Cumple'}
                                            color={isWithinTarget ? 'success' : 'error'}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell align="right" sx={{
                                        color: deviation >= 0 ? 'success.main' : 'error.main',
                                        fontWeight: 'bold'
                                    }}>
                                        {deviation > 0 ? '+' : ''}{deviation.toFixed(1)}%
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
};
