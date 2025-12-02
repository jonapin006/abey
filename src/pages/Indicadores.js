import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    CircularProgress,
    Alert,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DescriptionIcon from '@mui/icons-material/Description';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabaseClient';

function Indicadores() {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [invoices, setInvoices] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [headquarters, setHeadquarters] = useState([]);

    // Upload modal
    const [uploadForm, setUploadForm] = useState({
        year: new Date().getFullYear(),
        type: '',
        company_id: '',
        headquarters_id: '',
    });
    const [uploadHeadquarters, setUploadHeadquarters] = useState([]);
    const [openUploadModal, setOpenUploadModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Filters
    const [filters, setFilters] = useState({
        year: new Date().getFullYear(),
        type: '',
        company_id: '',
        headquarters_id: '',
    });

    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
    const invoiceTypes = ['Energía', 'Agua', 'Actas'];

    useEffect(() => {
        fetchCompanies();
    }, []);

    useEffect(() => {
        if (filters.company_id) {
            fetchHeadquarters(filters.company_id);
        } else {
            setHeadquarters([]);
        }
    }, [filters.company_id]);

    useEffect(() => {
        fetchInvoices();
    }, [filters]);

    const fetchCompanies = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

            const response = await fetch(`${API_URL}/companies?select=id,name`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setCompanies(data);
            }
        } catch (err) {
            console.error('Error fetching companies:', err);
        }
    };

    const fetchHeadquarters = async (companyId) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

            const response = await fetch(
                `${API_URL}/headquarters?company_id=eq.${companyId}&select=*`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json',
                    },
                },
            );

            if (response.ok) {
                const data = await response.json();
                setHeadquarters(data);
            } else {
                setHeadquarters([]);
            }
        } catch (err) {
            console.error('Error fetching headquarters:', err);
            setHeadquarters([]);
        }
    };

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

            let query =
                `?year=eq.${filters.year}` +
                '&order=created_at.desc' +
                '&select=*,headquarters!inner(company_id,name)';

            if (filters.type) {
                query += `&type=eq.${filters.type}`;
            }

            if (filters.company_id) {
                query += `&headquarters.company_id=eq.${filters.company_id}`;
            }

            if (filters.headquarters_id) {
                query += `&headquarters_id=eq.${filters.headquarters_id}`;
            }

            const response = await fetch(`${API_URL}/invoices${query}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setInvoices(data);
            } else {
                setInvoices([]);
            }
        } catch (err) {
            console.error('Error fetching invoices:', err);
            setError('Error al cargar las facturas');
        } finally {
            setLoading(false);
        }
    };

    const fetchHeadquartersForUpload = async (companyId) => {
        if (!companyId) {
            setUploadHeadquarters([]);
            return;
        }
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

            const response = await fetch(
                `${API_URL}/headquarters?company_id=eq.${companyId}&select=*`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json',
                    },
                },
            );

            if (response.ok) {
                const data = await response.json();
                setUploadHeadquarters(data);
            } else {
                setUploadHeadquarters([]);
            }
        } catch (err) {
            console.error('Error fetching upload headquarters:', err);
            setUploadHeadquarters([]);
        }
    };

    const handleOpenModal = () => {
        setOpenUploadModal(true);
        setUploadForm({
            year: new Date().getFullYear(),
            type: '',
            company_id: '',
            headquarters_id: '',
        });
        setUploadHeadquarters([]);
        setSelectedFile(null);
        setError(null);
        setSuccess(null);
    };

    const handleCloseModal = () => {
        setOpenUploadModal(false);
        setSelectedFile(null);
        setError(null);
    };

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
        setError(null);
    };

    const handleUploadSubmit = async () => {
        if (!selectedFile) {
            setError('Por favor, selecciona un archivo primero.');
            return;
        }
        if (!uploadForm.company_id || !uploadForm.headquarters_id || !uploadForm.type || !uploadForm.year) {
            setError('Por favor, completa todos los campos del formulario.');
            return;
        }

        setUploading(true);
        setError(null);
        setSuccess(null);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            if (!token) {
                throw new Error('No estás autenticado');
            }

            // 1. Subir archivo a Storage
            const filePath = `${session.user.id}/${Date.now()}_${selectedFile.name}`;
            const { error: uploadError } = await supabase.storage
                .from('invoices')
                .upload(filePath, selectedFile, {
                    cacheControl: '3600',
                    upsert: false,
                });

            if (uploadError) throw uploadError;

            const authenticatedUrl = `${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/invoices/${filePath}`;

            // 2. Enviar a N8N para extracción
            const webhookBase = process.env.REACT_APP_N8N_WEBHOOK_URL || 'http://localhost:5678';
            const webhookUrl = `${webhookBase}/webhook/5ef3c9a0-0044-4163-8017-a676402d57ff`;

            const n8nResponse = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    file_url: authenticatedUrl,
                    file_name: selectedFile.name,
                    type: uploadForm.type,
                    year: uploadForm.year,
                    headquarters_id: uploadForm.headquarters_id,
                    user_id: session.user.id,
                    access_token: `Bearer ${token}`,
                }),
            });

            if (!n8nResponse.ok) {
                throw new Error('Error al procesar la factura con N8N');
            }

            let extractedData = await n8nResponse.json();

            if (Array.isArray(extractedData) && extractedData.length > 0) {
                extractedData = extractedData[0];
            } else if (Array.isArray(extractedData) && extractedData.length === 0) {
                throw new Error('N8N no pudo extraer datos de la factura');
            }

            if (!extractedData || Object.keys(extractedData).length === 0) {
                throw new Error('N8N retornó datos vacíos');
            }

            // 3. Guardar en BD
            const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

            const invoiceData = {
                user_id: session.user.id,
                file_url: authenticatedUrl,
                file_name: selectedFile.name,
                type: uploadForm.type,
                year: uploadForm.year,
                headquarters_id: uploadForm.headquarters_id,
                status: 'Procesado',
                data: extractedData,
            };

            const dbResponse = await fetch(`${API_URL}/invoices`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    Prefer: 'return=representation',
                },
                body: JSON.stringify(invoiceData),
            });

            if (!dbResponse.ok) {
                const errorText = await dbResponse.text();
                throw new Error(`Error al guardar: ${dbResponse.status} - ${errorText}`);
            }

            setSuccess('Factura procesada y guardada exitosamente');
            handleCloseModal();
            fetchInvoices();
        } catch (err) {
            console.error('Error uploading invoice:', err);
            setError(err.message || 'Error al subir la factura');
        } finally {
            setUploading(false);
        }
    };

    const handleViewFile = async (invoice) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            if (!token) {
                throw new Error('No hay sesión activa');
            }

            const base = process.env.REACT_APP_N8N_WEBHOOK_URL || 'http://localhost:5678';
            const WEBHOOK_URL = `${base}/webhook/download-invoice`;

            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    invoice_id: invoice.id,
                    file_url: invoice.file_url,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error al descargar: ${response.status} - ${errorText || response.statusText}`);
            }

            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            window.open(blobUrl, '_blank');
            setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
        } catch (err) {
            console.error('Error viewing file:', err);
            setError('Error al abrir el archivo: ' + err.message);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Procesado':
                return 'success';
            case 'Error':
                return 'error';
            default:
                return 'warning';
        }
    };

    const goToMatriz = (type) => {
        // Ruta: /indicadores/matriz/:type/:year
        navigate(`/indicadores/matriz/${type}/${filters.year}`);
    };

    return (
        <Layout>
            <Container maxWidth="xl">
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Indicadores Ambientales
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Gestión y carga de facturas de servicios públicos
                    </Typography>
                </Box>

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

                {/* Filtros + botones de matriz */}
                <Paper sx={{ p: 3, mb: 4 }}>
                    {/* Fila 1: Solo Filtros */}
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={6} sm={3}>
                            <FormControl fullWidth sx={{ minWidth: '150px' }}>
                                <InputLabel>Año</InputLabel>
                                <Select
                                    value={filters.year}
                                    label="Año"
                                    onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                                >
                                    {years.map((year) => (
                                        <MenuItem key={year} value={year}>
                                            {year}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={6} sm={3}>
                            <FormControl fullWidth sx={{ minWidth: '150px' }}>
                                <InputLabel>Empresa</InputLabel>
                                <Select
                                    value={filters.company_id}
                                    label="Empresa"
                                    onChange={(e) =>
                                        setFilters({
                                            ...filters,
                                            company_id: e.target.value,
                                            headquarters_id: '',
                                        })
                                    }
                                >
                                    <MenuItem value="">Todas</MenuItem>
                                    {companies.map((company) => (
                                        <MenuItem key={company.id} value={company.id}>
                                            {company.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={6} sm={3}>
                            <FormControl fullWidth sx={{ minWidth: '150px' }}>
                                <InputLabel>Tipo</InputLabel>
                                <Select
                                    value={filters.type}
                                    label="Tipo"
                                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                                >
                                    <MenuItem value="">Todos</MenuItem>
                                    {invoiceTypes.map((type) => (
                                        <MenuItem key={type} value={type}>
                                            {type}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={6} sm={3}>
                            <FormControl fullWidth disabled={!filters.company_id} sx={{ minWidth: '150px' }}>
                                <InputLabel>Sede</InputLabel>
                                <Select
                                    value={filters.headquarters_id}
                                    label="Sede"
                                    onChange={(e) =>
                                        setFilters({ ...filters, headquarters_id: e.target.value })
                                    }
                                >
                                    <MenuItem value="">Todas</MenuItem>
                                    {headquarters.map((hq) => (
                                        <MenuItem key={hq.id} value={hq.id}>
                                            {hq.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>

                    {/* Fila 2: Botones de Matriz centrados */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<AssessmentIcon />}
                            onClick={() => goToMatriz('Energia')}
                        >
                            Matriz Energía
                        </Button>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<AssessmentIcon />}
                            onClick={() => goToMatriz('Agua')}
                        >
                            Matriz Agua
                        </Button>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<AssessmentIcon />}
                            onClick={() => goToMatriz('Actas')}
                        >
                            Matriz Actas
                        </Button>
                    </Box>

                    {/* Fila 3: Botón Nueva Factura */}
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleOpenModal}
                            sx={{ minWidth: '300px' }}
                        >
                            Nueva Factura
                        </Button>
                    </Box>
                </Paper>

                {/* Listado de facturas */}
                <Paper>
                    <Box
                        sx={{
                            p: 2,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <Typography variant="h6">Listado de Facturas</Typography>
                        <IconButton onClick={fetchInvoices}>
                            <RefreshIcon />
                        </IconButton>
                    </Box>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Fecha Carga</TableCell>
                                    <TableCell>Archivo</TableCell>
                                    <TableCell>Tipo</TableCell>
                                    <TableCell>Año</TableCell>
                                    <TableCell>Sede</TableCell>
                                    <TableCell>Detalles</TableCell>
                                    <TableCell>Estado</TableCell>
                                    <TableCell align="right">Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                                            <CircularProgress />
                                        </TableCell>
                                    </TableRow>
                                ) : invoices.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                                            <Typography color="text.secondary">
                                                No hay facturas registradas con estos filtros
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    invoices.map((invoice) => (
                                        <TableRow key={invoice.id}>
                                            <TableCell>
                                                {new Date(invoice.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <DescriptionIcon
                                                        fontSize="small"
                                                        sx={{ mr: 1, color: 'text.secondary' }}
                                                    />
                                                    {invoice.file_name}
                                                </Box>
                                            </TableCell>
                                            <TableCell>{invoice.type}</TableCell>
                                            <TableCell>{invoice.year}</TableCell>
                                            <TableCell>
                                                {invoice.headquarters?.name || 'Desconocida'}
                                            </TableCell>
                                            <TableCell>
                                                {invoice.data && (
                                                    <Tooltip
                                                        title={JSON.stringify(invoice.data, null, 2)}
                                                    >
                                                        <Typography
                                                            variant="caption"
                                                            sx={{
                                                                cursor: 'help',
                                                                textDecoration: 'underline',
                                                            }}
                                                        >
                                                            Ver datos
                                                        </Typography>
                                                    </Tooltip>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={invoice.status}
                                                    color={getStatusColor(invoice.status)}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                <Button
                                                    size="small"
                                                    onClick={() => handleViewFile(invoice)}
                                                >
                                                    Ver
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>

                {/* Modal de carga */}
                <Dialog open={openUploadModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
                    <DialogTitle>Subir Nueva Factura</DialogTitle>
                    <DialogContent>
                        <Box sx={{ pt: 2 }}>
                            {error && (
                                <Alert severity="error" sx={{ mb: 2 }}>
                                    {error}
                                </Alert>
                            )}

                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <FormControl fullWidth>
                                        <InputLabel>Año</InputLabel>
                                        <Select
                                            value={uploadForm.year}
                                            label="Año"
                                            onChange={(e) =>
                                                setUploadForm({
                                                    ...uploadForm,
                                                    year: e.target.value,
                                                })
                                            }
                                        >
                                            {years.map((year) => (
                                                <MenuItem key={year} value={year}>
                                                    {year}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12}>
                                    <FormControl fullWidth>
                                        <InputLabel>Tipo de Factura</InputLabel>
                                        <Select
                                            value={uploadForm.type}
                                            label="Tipo de Factura"
                                            onChange={(e) =>
                                                setUploadForm({
                                                    ...uploadForm,
                                                    type: e.target.value,
                                                })
                                            }
                                        >
                                            {invoiceTypes.map((type) => (
                                                <MenuItem key={type} value={type}>
                                                    {type}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12}>
                                    <FormControl fullWidth>
                                        <InputLabel>Empresa</InputLabel>
                                        <Select
                                            value={uploadForm.company_id}
                                            label="Empresa"
                                            onChange={(e) => {
                                                setUploadForm({
                                                    ...uploadForm,
                                                    company_id: e.target.value,
                                                    headquarters_id: '',
                                                });
                                                fetchHeadquartersForUpload(e.target.value);
                                            }}
                                        >
                                            {companies.map((company) => (
                                                <MenuItem key={company.id} value={company.id}>
                                                    {company.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12}>
                                    <FormControl fullWidth disabled={!uploadForm.company_id}>
                                        <InputLabel>Sede</InputLabel>
                                        <Select
                                            value={uploadForm.headquarters_id}
                                            label="Sede"
                                            onChange={(e) =>
                                                setUploadForm({
                                                    ...uploadForm,
                                                    headquarters_id: e.target.value,
                                                })
                                            }
                                        >
                                            {uploadHeadquarters.map((hq) => (
                                                <MenuItem key={hq.id} value={hq.id}>
                                                    {hq.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

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
                                            onChange={handleFileChange}
                                        />
                                    </Button>
                                </Grid>
                            </Grid>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseModal} disabled={uploading}>
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleUploadSubmit}
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
            </Container>
        </Layout>
    );
}

export default Indicadores;
