import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Divider,
    Paper,
    Grid,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useHeadquarters } from '../../hooks/headquarters/useHeadquarters';

export const CompanyDialog = ({
    open,
    onClose,
    isEditing,
    formData,
    onFormChange,
    onSave,
    saving,
    error,
}) => {
    const [newHeadquarterName, setNewHeadquarterName] = useState('');
    const [editingHeadquarter, setEditingHeadquarter] = useState(null);
    const [headquarterError, setHeadquarterError] = useState(null);

    // Only fetch headquarters if editing an existing company
    const {
        headquarters,
        loading: hqLoading,
        createHeadquarters,
        updateHeadquarters,
        deleteHeadquarters,
    } = useHeadquarters(isEditing ? formData.id : null);

    useEffect(() => {
        if (!open) {
            setNewHeadquarterName('');
            setEditingHeadquarter(null);
            setHeadquarterError(null);
        }
    }, [open]);

    const handleAddHeadquarter = async () => {
        if (!newHeadquarterName.trim()) {
            setHeadquarterError('El nombre de la sede es requerido');
            return;
        }

        try {
            setHeadquarterError(null);
            await createHeadquarters({
                name: newHeadquarterName,
                company_id: formData.id,
            });
            setNewHeadquarterName('');
        } catch (err) {
            setHeadquarterError(err.message);
        }
    };

    const handleUpdateHeadquarter = async () => {
        if (!newHeadquarterName.trim()) {
            setHeadquarterError('El nombre de la sede es requerido');
            return;
        }

        try {
            setHeadquarterError(null);
            await updateHeadquarters(editingHeadquarter.id, {
                name: newHeadquarterName,
            });
            setNewHeadquarterName('');
            setEditingHeadquarter(null);
        } catch (err) {
            setHeadquarterError(err.message);
        }
    };

    const handleDeleteHeadquarter = async (hqId) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar esta sede?')) {
            try {
                setHeadquarterError(null);
                await deleteHeadquarters(hqId);
            } catch (err) {
                setHeadquarterError(err.message);
            }
        }
    };

    const handleEditHeadquarter = (hq) => {
        setEditingHeadquarter(hq);
        setNewHeadquarterName(hq.name);
    };

    const handleCancelEditHeadquarter = () => {
        setEditingHeadquarter(null);
        setNewHeadquarterName('');
        setHeadquarterError(null);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                {isEditing ? 'Editar Empresa' : 'Nueva Empresa'}
            </DialogTitle>
            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {/* Success message after creating company */}
                {!error && isEditing && formData.id && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        Empresa guardada exitosamente. Ahora puedes agregar sedes.
                    </Alert>
                )}

                {/* Company Information */}
                <Box sx={{ pt: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Información de la Empresa
                    </Typography>

                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                label="Nombre de la Empresa"
                                value={formData.name}
                                onChange={(e) => onFormChange('name', e.target.value)}
                                fullWidth
                                required
                                autoFocus
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="NIT / ID Fiscal"
                                value={formData.company_id}
                                onChange={(e) => onFormChange('company_id', e.target.value)}
                                fullWidth
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Industria"
                                value={formData.industry}
                                onChange={(e) => onFormChange('industry', e.target.value)}
                                fullWidth
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                label="Dirección"
                                value={formData.address}
                                onChange={(e) => onFormChange('address', e.target.value)}
                                fullWidth
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Ciudad"
                                value={formData.city}
                                onChange={(e) => onFormChange('city', e.target.value)}
                                fullWidth
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="País"
                                value={formData.country}
                                onChange={(e) => onFormChange('country', e.target.value)}
                                fullWidth
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Teléfono"
                                value={formData.phone}
                                onChange={(e) => onFormChange('phone', e.target.value)}
                                fullWidth
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Sitio Web"
                                value={formData.website}
                                onChange={(e) => onFormChange('website', e.target.value)}
                                fullWidth
                                placeholder="https://www.ejemplo.com"
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Email de Contacto"
                                value={formData.contact_email}
                                onChange={(e) => onFormChange('contact_email', e.target.value)}
                                fullWidth
                                type="email"
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Estado</InputLabel>
                                <Select
                                    value={formData.status}
                                    onChange={(e) => onFormChange('status', e.target.value)}
                                    label="Estado"
                                >
                                    <MenuItem value="active">Activa</MenuItem>
                                    <MenuItem value="inactive">Inactiva</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </Box>

                {/* Headquarters Section - Only show when editing */}
                {isEditing && (
                    <>
                        <Divider sx={{ my: 3 }} />

                        <Box>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                                Sedes de la Empresa
                            </Typography>

                            {headquarterError && (
                                <Alert severity="error" sx={{ mb: 2 }}>
                                    {headquarterError}
                                </Alert>
                            )}

                            {/* Add/Edit Headquarter Form */}
                            <Paper sx={{ p: 2, mb: 2, backgroundColor: '#f5f5f5' }}>
                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                    <TextField
                                        label={editingHeadquarter ? 'Editar Sede' : 'Nueva Sede'}
                                        value={newHeadquarterName}
                                        onChange={(e) => setNewHeadquarterName(e.target.value)}
                                        fullWidth
                                        size="small"
                                        placeholder="Nombre de la sede"
                                    />
                                    {editingHeadquarter ? (
                                        <>
                                            <Button
                                                variant="contained"
                                                onClick={handleUpdateHeadquarter}
                                                size="small"
                                            >
                                                Actualizar
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                onClick={handleCancelEditHeadquarter}
                                                size="small"
                                            >
                                                Cancelar
                                            </Button>
                                        </>
                                    ) : (
                                        <Button
                                            variant="contained"
                                            startIcon={<AddIcon />}
                                            onClick={handleAddHeadquarter}
                                            size="small"
                                        >
                                            Agregar
                                        </Button>
                                    )}
                                </Box>
                            </Paper>

                            {/* Headquarters List */}
                            {hqLoading ? (
                                <Typography variant="body2" color="text.secondary">
                                    Cargando sedes...
                                </Typography>
                            ) : headquarters.length === 0 ? (
                                <Typography variant="body2" color="text.secondary">
                                    No hay sedes registradas. Agrega una sede para comenzar.
                                </Typography>
                            ) : (
                                <List>
                                    {headquarters.map((hq) => (
                                        <ListItem
                                            key={hq.id}
                                            sx={{
                                                border: '1px solid #e0e0e0',
                                                borderRadius: 1,
                                                mb: 1,
                                            }}
                                        >
                                            <ListItemText primary={hq.name} />
                                            <ListItemSecondaryAction>
                                                <IconButton
                                                    edge="end"
                                                    size="small"
                                                    onClick={() => handleEditHeadquarter(hq)}
                                                    sx={{ mr: 1 }}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton
                                                    edge="end"
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleDeleteHeadquarter(hq.id)}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </Box>
                    </>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={saving}>
                    Cancelar
                </Button>
                <Button onClick={onSave} variant="contained" disabled={saving}>
                    {saving ? 'Guardando...' : 'Guardar'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
