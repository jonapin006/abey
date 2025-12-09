import React, { useState } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    Alert,
    CircularProgress,
} from '@mui/material';
import Layout from '../../components/Layout.jsx';
import { useCompanies } from '../../hooks/companies/useCompanies';
import { KPI } from '../../components/indicators/KPI';
import { invoiceService } from '../../services/indicators/invoiceService';
import { supabase } from '../../lib/supabaseClient';

function KPIPage() {
    const [selectedCompany, setSelectedCompany] = React.useState('');
    const [selectedYear, setSelectedYear] = React.useState(new Date().getFullYear());
    const [selectedTypeToGenerate, setSelectedTypeToGenerate] = useState('');
    const [generating, setGenerating] = useState(false);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);
    const { companies } = useCompanies();

    // Generate years array (current year + 5 years back)
    const years = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);

    const handleGenerateSelectedType = async () => {
        if (!selectedCompany) {
            setError('Por favor selecciona una empresa primero');
            return;
        }
        if (!selectedTypeToGenerate) {
            setError('Por favor selecciona un tipo de factura');
            return;
        }

        try {
            setGenerating(true);
            setError(null);
            setSuccess(null);

            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            if (!token) {
                throw new Error('No hay sesión activa');
            }

            // Pass year to generateKpis
            await invoiceService.generateKpis(selectedCompany, selectedTypeToGenerate, selectedYear, token);

            setSuccess(`KPIs de ${selectedTypeToGenerate} generados exitosamente`);
            setSelectedTypeToGenerate('');

            // Refresh the page after 1 second
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (err) {
            console.error('Error generating KPIs:', err);
            setError(err.message || 'Error al generar KPIs');
        } finally {
            setGenerating(false);
        }
    };

    return (
        <Layout>
            <Container maxWidth="xl">
                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        KPIs
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Indicadores de desempeño y metas de consumo
                    </Typography>
                </Box>

                {/* Alerts */}
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}
                {success && (
                    <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
                        {success}
                    </Alert>
                )}

                {/* Company Filter + Year Filter + KPI Generation */}
                <Paper sx={{ p: 2, mb: 3 }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                        {/* Company Selector */}
                        <FormControl sx={{ minWidth: 200 }}>
                            <InputLabel>Empresa</InputLabel>
                            <Select
                                value={selectedCompany}
                                label="Empresa"
                                onChange={(e) => setSelectedCompany(e.target.value)}
                            >
                                {companies.map((company) => (
                                    <MenuItem key={company.id} value={company.id}>
                                        {company.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {/* Year Selector */}
                        <FormControl sx={{ minWidth: 120 }}>
                            <InputLabel>Año</InputLabel>
                            <Select
                                value={selectedYear}
                                label="Año"
                                onChange={(e) => setSelectedYear(e.target.value)}
                            >
                                {years.map((year) => (
                                    <MenuItem key={year} value={year}>
                                        {year}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {/* Type Selector for Generation */}
                        <FormControl sx={{ minWidth: 200 }}>
                            <InputLabel>Tipo de Factura</InputLabel>
                            <Select
                                value={selectedTypeToGenerate}
                                label="Tipo de Factura"
                                onChange={(e) => setSelectedTypeToGenerate(e.target.value)}
                                disabled={!selectedCompany}
                            >
                                <MenuItem value="Energía">Energía</MenuItem>
                                <MenuItem value="Agua">Agua</MenuItem>
                                <MenuItem value="Gas">Gas</MenuItem>
                                <MenuItem value="Actas">Actas</MenuItem>
                            </Select>
                        </FormControl>

                        {/* Generate Button */}
                        <Button
                            variant="contained"
                            onClick={handleGenerateSelectedType}
                            disabled={!selectedCompany || !selectedTypeToGenerate || generating}
                            startIcon={generating ? <CircularProgress size={20} /> : null}
                        >
                            {generating ? 'Generando...' : 'Generar KPIs'}
                        </Button>
                    </Box>
                </Paper>

                {/* KPI Dashboard */}
                <KPI companyId={selectedCompany} year={selectedYear} />
            </Container>
        </Layout>
    );
}

export default KPIPage;
