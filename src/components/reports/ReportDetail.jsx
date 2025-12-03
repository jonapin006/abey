import React from 'react';
import {
    Typography,
    Box,
    Card,
    CardContent,
    Grid,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    ToggleButtonGroup,
    ToggleButton,
    Button,
} from '@mui/material';
import { BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';

export const ReportDetail = ({
    diagnostic,
    details,
    chartType,
    onChartTypeChange,
    onBack
}) => {
    if (!details) return null;

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    // Prepare chart data
    const chartData = Object.entries(details)
        .filter(([part, stats]) => stats.total > 0)
        .map(([part, stats]) => ({
            name: part,
            Completado: stats.completed,
            'En progreso': stats.inProgress,
            'Por hacer': stats.pending,
        }));

    return (
        <>
            <Box sx={{ mb: 3 }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={onBack}
                    sx={{ mb: 2 }}
                >
                    Volver a la lista
                </Button>
                <Typography variant="h4" component="h1" gutterBottom>
                    {diagnostic.title || `Diagnóstico - ${formatDate(diagnostic.created_at)}`}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Reporte de completitud por sección
                </Typography>
            </Box>

            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="text.secondary" gutterBottom>
                                Total Planes
                            </Typography>
                            <Typography variant="h4">
                                {diagnostic.total || 0}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ backgroundColor: '#e8f5e9' }}>
                        <CardContent>
                            <Typography color="text.secondary" gutterBottom>
                                Completados
                            </Typography>
                            <Typography variant="h4" color="success.main">
                                {diagnostic.completed || 0}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ backgroundColor: '#e3f2fd' }}>
                        <CardContent>
                            <Typography color="text.secondary" gutterBottom>
                                En Progreso
                            </Typography>
                            <Typography variant="h4" color="primary.main">
                                {diagnostic.inProgress || 0}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ backgroundColor: '#fff3e0' }}>
                        <CardContent>
                            <Typography color="text.secondary" gutterBottom>
                                Por Hacer
                            </Typography>
                            <Typography variant="h4" color="warning.main">
                                {diagnostic.pending || 0}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Chart Section */}
            <Paper sx={{ p: 3, mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6">
                        Estado por Sección
                    </Typography>
                    <ToggleButtonGroup
                        value={chartType}
                        exclusive
                        onChange={(e, newType) => newType && onChartTypeChange(newType)}
                        size="small"
                    >
                        <ToggleButton value="bar">
                            <BarChartIcon sx={{ mr: 1 }} />
                            Barras
                        </ToggleButton>
                        <ToggleButton value="pie">
                            <PieChartIcon sx={{ mr: 1 }} />
                            Torta
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Box>

                {chartType === 'bar' ? (
                    <ResponsiveContainer width="100%" height={450}>
                        <BarChart
                            data={chartData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="name"
                                angle={-45}
                                textAnchor="end"
                                height={120}
                                interval={0}
                                tick={{ fontSize: 11 }}
                            />
                            <YAxis
                                label={{ value: 'Cantidad de Planes', angle: -90, position: 'insideLeft' }}
                            />
                            <Tooltip />
                            <Legend
                                verticalAlign="top"
                                wrapperStyle={{ paddingBottom: '20px' }}
                            />
                            <Bar dataKey="Completado" fill="#4caf50" />
                            <Bar dataKey="En progreso" fill="#2196f3" />
                            <Bar dataKey="Por hacer" fill="#ff9800" />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <ResponsiveContainer width="100%" height={500}>
                            <PieChart>
                                <Pie
                                    data={[
                                        {
                                            name: 'Completado',
                                            value: chartData.reduce((sum, item) => sum + item.Completado, 0),
                                            fill: '#4caf50'
                                        },
                                        {
                                            name: 'En progreso',
                                            value: chartData.reduce((sum, item) => sum + item['En progreso'], 0),
                                            fill: '#2196f3'
                                        },
                                        {
                                            name: 'Por hacer',
                                            value: chartData.reduce((sum, item) => sum + item['Por hacer'], 0),
                                            fill: '#ff9800'
                                        },
                                    ].filter(item => item.value > 0)}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={true}
                                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                                    outerRadius={150}
                                    dataKey="value"
                                    fill="fill"
                                />
                                <Tooltip
                                    formatter={(value, name) => [`${value} planes`, name]}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </Box>
                )}
            </Paper>

            {/* Details Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Sección</TableCell>
                            <TableCell align="center">Total</TableCell>
                            <TableCell align="center">Completado</TableCell>
                            <TableCell align="center">En Progreso</TableCell>
                            <TableCell align="center">Por Hacer</TableCell>
                            <TableCell align="center">% Completitud</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {Object.entries(details)
                            .filter(([part, stats]) => stats.total > 0)
                            .map(([part, stats]) => (
                                <TableRow key={part} hover>
                                    <TableCell>{part}</TableCell>
                                    <TableCell align="center">{stats.total}</TableCell>
                                    <TableCell align="center" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                                        {stats.completed}
                                    </TableCell>
                                    <TableCell align="center" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                                        {stats.inProgress}
                                    </TableCell>
                                    <TableCell align="center" sx={{ color: 'warning.main', fontWeight: 'bold' }}>
                                        {stats.pending}
                                    </TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                                        {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
};
