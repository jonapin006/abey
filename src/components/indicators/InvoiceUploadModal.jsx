import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    CircularProgress,
    Box,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const INVOICE_TYPES = ['Energía', 'Agua', 'Actas'];

export const InvoiceUploadModal = ({
    open,
    onClose,
    uploadForm,
    onFormChange,
    selectedFile,
    onFileChange,
    onUpload,
    uploading,
    error,
    companies,
    headquarters,
    years,
}) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Nueva Factura</DialogTitle>
            <DialogContent>
                <Box sx={{ pt: 2 }}>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {/* Onboarding / Status Message */}
                    {uploadForm.type && uploadForm.company_id && (
                        <Alert severity="info" sx={{ mb: 2 }}>
                            {/* This would ideally be dynamic based on actual counts passed as props, 
                                but for now we'll show a generic helpful message since we don't have the counts prop yet 
                                or we can add it to the component props. 
                                Let's assume we want to be helpful. */}
                            Subiendo factura de {uploadForm.type}.
                            Los nuevos datos actualizarán tus indicadores automáticamente.
                        </Alert>
                    )}

                    <Grid container spacing={2}>
                        {/* Year */}
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Año</InputLabel>
                                <Select
                                    value={uploadForm.year}
                                    label="Año"
                                    onChange={(e) => onFormChange('year', e.target.value)}
                                >
                                    {years.map((year) => (
                                        <MenuItem key={year} value={year}>
                                            {year}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Type */}
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Tipo de Factura</InputLabel>
                                <Select
                                    value={uploadForm.type}
                                    label="Tipo de Factura"
                                    onChange={(e) => onFormChange('type', e.target.value)}
                                >
                                    {INVOICE_TYPES.map((type) => (
                                        <MenuItem key={type} value={type}>
                                            {type}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Company */}
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Empresa</InputLabel>
                                <Select
                                    value={uploadForm.company_id}
                                    label="Empresa"
                                    onChange={(e) => onFormChange('company_id', e.target.value)}
                                >
                                    {companies.map((company) => (
                                        <MenuItem key={company.id} value={company.id}>
                                            {company.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Headquarters */}
                        <Grid item xs={12}>
                            <FormControl fullWidth disabled={!uploadForm.company_id}>
                                <InputLabel>Sede</InputLabel>
                                <Select
                                    value={uploadForm.headquarters_id}
                                    label="Sede"
                                    onChange={(e) => onFormChange('headquarters_id', e.target.value)}
                                >
                                    {headquarters.map((hq) => (
                                        <MenuItem key={hq.id} value={hq.id}>
                                            {hq.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* File Upload */}
                        <Grid item xs={12}>
                            <Button
                                variant="outlined"
                                component="label"
                                fullWidth
                                startIcon={<CloudUploadIcon />}
                            >
                                {selectedFile ? selectedFile.name : 'Seleccionar Archivo'}
                                <input
                                    type="file"
                                    hidden
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={onFileChange}
                                />
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={uploading}>
                    Cancelar
                </Button>
                <Button
                    onClick={onUpload}
                    variant="contained"
                    disabled={uploading || !selectedFile}
                >
                    {uploading ? (
                        <>
                            <CircularProgress size={20} sx={{ mr: 1 }} />
                            Procesando...
                        </>
                    ) : (
                        'Subir y Procesar'
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
