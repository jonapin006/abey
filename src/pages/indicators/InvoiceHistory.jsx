import React, { useState } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Alert,
    IconButton,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import Layout from '../../components/Layout.jsx';
import { supabase } from '../../lib/supabaseClient';
import { n8nService } from '../../services/indicators/n8nService';
import { useInvoiceFilters } from '../../hooks/indicators/useInvoiceFilters';
import { useInvoices } from '../../hooks/indicators/useInvoices';
import { useInvoiceUpload } from '../../hooks/indicators/useInvoiceUpload';
import { useCompanies } from '../../hooks/companies/useCompanies';
import { useHeadquarters } from '../../hooks/headquarters/useHeadquarters';
import { InvoiceFilters } from '../../components/indicators/InvoiceFilters';
import { MatrixButtons } from '../../components/indicators/MatrixButtons';
import { InvoiceTable } from '../../components/indicators/InvoiceTable';
import { InvoiceUploadModal } from '../../components/indicators/InvoiceUploadModal';

// Generate years array (current year + 5 years back)
const generateYears = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, i) => currentYear - i);
};

function InvoiceHistory() {
    const [success, setSuccess] = useState(null);
    const years = generateYears();

    // Filters
    const { filters, updateFilter } = useInvoiceFilters();

    // Data fetching
    const { companies } = useCompanies();
    const { headquarters } = useHeadquarters(filters.company_id);
    const { invoices, loading, error: fetchError, refetch } = useInvoices(filters);

    // Upload
    const {
        openModal,
        uploading,
        error: uploadError,
        selectedFile,
        uploadForm,
        handleOpenModal,
        handleCloseModal,
        handleFileChange,
        handleFormChange,
        handleUpload,
    } = useInvoiceUpload(() => {
        setSuccess('Factura procesada y guardada exitosamente');
        refetch();
    });

    // Upload headquarters (separate from filter headquarters)
    const { headquarters: uploadHeadquarters } = useHeadquarters(uploadForm.company_id);

    // View file handler
    const handleViewFile = async (invoice) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            if (!token) {
                throw new Error('No hay sesión activa');
            }

            const blob = await n8nService.downloadInvoiceFile(
                invoice.id,
                invoice.file_url,
                token
            );

            const blobUrl = URL.createObjectURL(blob);
            window.open(blobUrl, '_blank');
            setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
        } catch (err) {
            console.error('Error viewing file:', err);
            setSuccess(null);
        }
    };

    return (
        <Layout>
            <Container maxWidth="xl">
                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Historial de Facturas
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Gestión y carga de facturas de servicios públicos
                    </Typography>
                </Box>

                {/* Alerts */}
                {fetchError && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => { }}>
                        {fetchError}
                    </Alert>
                )}
                {success && (
                    <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
                        {success}
                    </Alert>
                )}

                {/* Filters + Matrix Buttons */}
                <Paper sx={{ p: 3, mb: 4 }}>
                    <InvoiceFilters
                        filters={filters}
                        onFilterChange={updateFilter}
                        companies={companies}
                        headquarters={headquarters}
                        years={years}
                    />
                    <MatrixButtons
                        year={filters.year}
                        onNewInvoice={handleOpenModal}
                    />
                </Paper>

                {/* Invoice Table */}
                <Paper>
                    <Box
                        sx={{
                            p: 2,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <Typography variant="h6">Facturas Cargadas</Typography>
                        <IconButton onClick={refetch}>
                            <RefreshIcon />
                        </IconButton>
                    </Box>
                    <InvoiceTable
                        invoices={invoices}
                        loading={loading}
                        onViewFile={handleViewFile}
                    />
                </Paper>

                {/* Upload Modal */}
                <InvoiceUploadModal
                    open={openModal}
                    onClose={handleCloseModal}
                    uploadForm={uploadForm}
                    onFormChange={handleFormChange}
                    selectedFile={selectedFile}
                    onFileChange={handleFileChange}
                    onUpload={handleUpload}
                    uploading={uploading}
                    error={uploadError}
                    companies={companies}
                    headquarters={uploadHeadquarters}
                    years={years}
                />
            </Container>
        </Layout>
    );
}

export default InvoiceHistory;
