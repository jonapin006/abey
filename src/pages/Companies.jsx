import React from 'react';
import {
    Container,
    Typography,
    Box,
    Button,
    Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import Layout from '../components/Layout.jsx';
import { useCompanies } from '../hooks/companies/useCompanies';
import { useCompanyForm } from '../hooks/companies/useCompanyForm';
import { CompaniesTable } from '../components/companies/CompaniesTable';
import { CompanyDialog } from '../components/companies/CompanyDialog';

function Companies() {
    // Custom hooks
    const { companies, loading, error, refetch, deleteCompany } = useCompanies();
    const {
        openDialog,
        editingCompany,
        formData,
        saving,
        error: formError,
        handleOpenDialog,
        handleCloseDialog,
        handleFormChange,
        handleSave,
    } = useCompanyForm(refetch);

    const handleDelete = async (companyId) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar esta empresa?')) {
            try {
                await deleteCompany(companyId);
            } catch (err) {
                alert('Error al eliminar empresa');
            }
        }
    };

    return (
        <Layout>
            <Container maxWidth="xl">
                {/* Header */}
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <Typography variant="h4" component="h1" gutterBottom>
                            Gestión de Empresas
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Administra las empresas del sistema
                        </Typography>
                    </div>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenDialog()}
                    >
                        Nueva Empresa
                    </Button>
                </Box>

                {/* Error Alert */}
                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                {/* Companies Table */}
                <CompaniesTable
                    companies={companies}
                    loading={loading}
                    onEdit={handleOpenDialog}
                    onDelete={handleDelete}
                />

                {/* Create/Edit Dialog */}
                <CompanyDialog
                    open={openDialog}
                    onClose={handleCloseDialog}
                    isEditing={!!editingCompany}
                    formData={formData}
                    onFormChange={handleFormChange}
                    onSave={handleSave}
                    saving={saving}
                    error={formError}
                />
            </Container>
        </Layout>
    );
}

export default Companies;
