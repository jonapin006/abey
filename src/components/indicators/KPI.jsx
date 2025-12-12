
import React, { useState, useEffect } from 'react';
import {
    Grid,
    Box,
    Typography,
    CircularProgress,
    Alert,
    Paper,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import { useKpiDashboard } from '../../hooks/indicators/useKpiDashboard';
import { kpiService } from '../../services/indicators/kpiService';
import { supabase } from '../../lib/supabaseClient';
import { KpiStatusCard } from './KpiStatusCard';
import { KpiTrendChart } from './KpiTrendChart';
import { KpiHistoricalTable } from './KpiHistoricalTable';
import { EditTargetDialog } from './EditTargetDialog';

export const KPI = ({ companyId, year = new Date().getFullYear(), onUploadClick }) => {
    const {
        loading,
        error,
        baselines,
        evaluations,
        invoiceCounts,
        currentAverages,
        refetch,
        generateKpis
    } = useKpiDashboard(companyId, year);

    const [selectedType, setSelectedType] = useState(null);
    const [selectedTypeToGenerate, setSelectedTypeToGenerate] = useState('');
    const [generationSuccess, setGenerationSuccess] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [baselineToEdit, setBaselineToEdit] = useState(null);

    // Update selected type when baselines load
    useEffect(() => {
        if (baselines.length > 0 && !selectedType) {
            setSelectedType(baselines[0].invoice_type);
        }
    }, [baselines, selectedType]);

    // Handler for opening edit dialog
    const handleEditTarget = (baseline) => {
        setBaselineToEdit(baseline);
        setEditDialogOpen(true);
    };

    // Handler for saving new target
    const handleSaveTarget = async (newTargetValue) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            if (!token) throw new Error('No hay sesión activa');

            await kpiService.updateKpiTarget(baselineToEdit.id, newTargetValue, token);

            // Refetch data to show updated target
            refetch();
        } catch (err) {
            console.error('Error updating target:', err);
        }
    };

    if (!companyId) {
        return (
            <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'background.default' }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                    Selecciona una empresa
                </Typography>
                <Typography color="text.secondary">
                    Para visualizar los indicadores de desempeño, metas de consumo y gráficas históricas,
                    por favor selecciona una empresa en el filtro superior.
                </Typography>
            </Paper>
        );
    }

    // Get available types that have enough invoices
    const availableTypes = Object.keys(invoiceCounts).filter(type => invoiceCounts[type] >= 3);

    // Check if we have enough data for at least one type (e.g., > 3 invoices)
    // Or if we have baselines configured.
    const hasEnoughData = Object.values(invoiceCounts).some(count => count >= 3);
    const hasBaselines = baselines.length > 0;

    // Handler for generating KPIs for selected type only
    const handleGenerateSelectedType = async () => {
        if (!selectedTypeToGenerate) {
            return;
        }
        setGenerationSuccess(false);
        const success = await generateKpis(selectedTypeToGenerate);
        if (success) {
            setGenerationSuccess(true);
            // Force immediate refetch
            setTimeout(() => {
                refetch();
                setGenerationSuccess(false);
            }, 2000);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" action={
                <Button color="inherit" size="small" onClick={refetch}>
                    Reintentar
                </Button>
            }>
                {error}
            </Alert>
        );
    }

    // Case 1: Enough data uploaded, but no Baselines generated/configured yet.
    if (hasEnoughData && !hasBaselines) {
        return (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                    Facturas detectadas
                </Typography>
                <Typography color="text.secondary" paragraph>
                    Hemos detectado suficientes facturas para calcular tus indicadores, pero aún no se han generado las líneas base (KPIs).
                </Typography>
                <Alert severity="info" sx={{ maxWidth: 600, mx: 'auto', mb: 2 }}>
                    Utiliza los filtros en la parte superior para seleccionar el tipo de factura y generar el KPI.
                </Alert>
            </Paper>
        );
    }

    // Case 2: Not enough data AND no baselines. (Onboarding)
    if (!hasEnoughData && !hasBaselines) {
        return (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h5" gutterBottom>
                    Comienza a medir tu desempeño ambiental
                </Typography>
                <Typography color="text.secondary" paragraph>
                    Sube al menos 3 meses de facturas de energía o agua para que podamos calcular tus KPIs y establecer una línea base.
                </Typography>
                <Button variant="contained" onClick={onUploadClick}>
                    Subir Facturas
                </Button>
            </Paper>
        );
    }

    const selectedBaseline = baselines.find(b => b.invoice_type === selectedType);
    const selectedEvaluations = evaluations[selectedType] || [];

    // Prepare chart data
    const chartData = selectedEvaluations.map(e => ({
        month: e.month,
        value: e.value,
        target: e.target,
        status: e.status
    })); // Already sorted chronologically (oldest to newest)

    return (
        <Box>
            {/* KPI Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {baselines.map((baseline) => {
                    const latestEval = evaluations[baseline.invoice_type]?.[0];
                    return (
                        <Grid item xs={12} md={4} key={baseline.id}>
                            <KpiStatusCard
                                type={baseline.invoice_type}
                                value={currentAverages[baseline.invoice_type] || 0}
                                target={baseline.target_value || baseline.baseline_value}
                                unit={baseline.unit}
                                selected={selectedType === baseline.invoice_type}
                                onClick={() => setSelectedType(baseline.invoice_type)}
                                onEdit={() => handleEditTarget(baseline)}
                            />
                        </Grid>
                    );
                })}
            </Grid>

            {/* Edit Target Dialog */}
            <EditTargetDialog
                open={editDialogOpen}
                onClose={() => setEditDialogOpen(false)}
                baseline={baselineToEdit}
                currentAverage={baselineToEdit ? currentAverages[baselineToEdit.invoice_type] : 0}
                onSave={handleSaveTarget}
            />

            {/* Full-width Trend Chart */}
            {selectedType && (
                <>
                    <Box sx={{ mb: 4 }}>
                        <KpiTrendChart
                            data={chartData}
                            unit={selectedBaseline?.unit}
                            title={selectedType}
                        />
                    </Box>

                    {/* Evaluation History Table */}
                    <Box sx={{ mb: 4 }}>
                        <KpiHistoricalTable
                            data={selectedEvaluations}
                            unit={selectedBaseline?.unit}
                            type={selectedType}
                        />
                    </Box>
                </>
            )}
        </Box>
    );
};
