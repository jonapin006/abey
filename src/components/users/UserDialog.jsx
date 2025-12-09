import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Box,
    Alert,
} from '@mui/material';

export const UserDialog = ({
    open,
    onClose,
    isEditing,
    formData,
    onFormChange,
    onSave,
    saving,
    error,
    roles,
    companies,
}) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
            </DialogTitle>
            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => onFormChange('email', e.target.value)}
                        fullWidth
                        required
                        disabled={isEditing}
                    />
                    {!isEditing && (
                        <TextField
                            label="Contraseña"
                            type="password"
                            value={formData.password}
                            onChange={(e) => onFormChange('password', e.target.value)}
                            fullWidth
                            required
                            placeholder="Mínimo 6 caracteres"
                        />
                    )}
                    <TextField
                        label="Nombre Completo"
                        value={formData.full_name}
                        onChange={(e) => onFormChange('full_name', e.target.value)}
                        fullWidth
                        required
                    />
                    <FormControl fullWidth>
                        <InputLabel>Rol</InputLabel>
                        <Select
                            value={formData.role_id}
                            onChange={(e) => onFormChange('role_id', e.target.value)}
                            label="Rol"
                        >
                            {roles.map((role) => (
                                <MenuItem key={role.id} value={role.id}>
                                    {role.name} (Nivel {role.hierarchy_level})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth>
                        <InputLabel>Empresa</InputLabel>
                        <Select
                            value={formData.company_id}
                            onChange={(e) => onFormChange('company_id', e.target.value)}
                            label="Empresa"
                        >
                            {companies.map((company) => (
                                <MenuItem key={company.id} value={company.id}>
                                    {company.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
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
