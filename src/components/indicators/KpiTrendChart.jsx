import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';

export const KpiTrendChart = ({ data, unit, title }) => {
    if (!data || data.length === 0) {
        return (
            <Paper sx={{ p: 3, height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">No hay datos suficientes para mostrar la tendencia</Typography>
            </Paper>
        );
    }

    // Calculate min and max for Y-axis domain to make chart look better
    const values = data.map(d => Math.max(d.value, d.target));
    const maxValue = Math.max(...values) * 1.1; // Add 10% padding

    return (
        <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
                {title} - Tendencia Mensual
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={data}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" />
                    <YAxis unit={unit} domain={[0, maxValue]} />
                    <Tooltip
                        formatter={(value) => [`${value} ${unit}`, '']}
                        contentStyle={{ borderRadius: 8, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
                    />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="value"
                        name="Consumo Real"
                        stroke="#2196f3"
                        strokeWidth={3}
                        activeDot={{ r: 8 }}
                        dot={{ r: 4 }}
                    />
                    <Line
                        type="step"
                        dataKey="target"
                        name="Meta"
                        stroke="#4caf50"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </Paper>
    );
};
