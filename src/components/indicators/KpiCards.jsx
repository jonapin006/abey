import React from 'react';
import { Grid, Typography, Paper } from '@mui/material';
import { useKpiDashboard } from '../../hooks/indicators/useKpiDashboard';
import { KpiStatusCard } from './KpiStatusCard';

/**
 * KPI Cards Component - Shows only the KPI summary cards
 * Used in the main dashboard for a quick overview
 */
export const KpiCards = ({ companyId, year }) => {
    const { baselines, currentAverages, loading } = useKpiDashboard(companyId, year);

    if (loading) {
        return (
            <Typography color="text.secondary" align="center">
                Cargando KPIs...
            </Typography>
        );
    }

    if (!companyId) {
        return (
            <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'background.default' }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                    Selecciona una empresa
                </Typography>
                <Typography color="text.secondary">
                    Para visualizar los indicadores de desempeño, por favor selecciona una empresa.
                </Typography>
            </Paper>
        );
    }

    if (baselines.length === 0) {
        return (
            <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'background.default' }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                    No hay KPIs generados
                </Typography>
                <Typography color="text.secondary">
                    Genera KPIs desde la página de Indicadores para visualizarlos aquí.
                </Typography>
            </Paper>
        );
    }

    return (
        <Grid container spacing={3}>
            {baselines.map((baseline) => {
                const currentValue = currentAverages[baseline.invoice_type] || 0;
                const target = baseline.target_value || baseline.baseline_value;

                return (
                    <Grid item xs={12} md={4} key={baseline.id}>
                        <KpiStatusCard
                            type={baseline.invoice_type}
                            value={currentValue}
                            target={target}
                            unit={baseline.unit}
                            selected={false}
                            onClick={() => { }} // No action needed in dashboard
                            onEdit={null} // No edit in dashboard
                        />
                    </Grid>
                );
            })}
        </Grid>
    );
};
