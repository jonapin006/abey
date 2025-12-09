import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Typography,
    Box,
    Alert
} from '@mui/material';

export const EditTargetDialog = ({ open, onClose, baseline, currentAverage, onSave }) => {
    const [targetValue, setTargetValue] = useState('');
    const [error, setError] = useState('');

    // Set initial value when dialog opens
    useEffect(() => {
        if (open && baseline) {
            const initialValue = baseline.target_value || baseline.baseline_value * 0.9;
            setTargetValue(initialValue.toFixed(2));
        }
    }, [open, baseline]);

    const handleSave = () => {
        const value = parseFloat(targetValue);

        if (isNaN(value) || value <= 0) {
            setError('El valor debe ser un número positivo');
            return;
        }

        if (value >= currentAverage) {
            setError('La meta debe ser menor al promedio actual para lograr reducción');
            return;
        }

        onSave(value);
        onClose();
    };

    const reductionPercentage = currentAverage > 0 && targetValue > 0
        ? ((currentAverage - parseFloat(targetValue)) / currentAverage * 100).toFixed(1)
        : 0;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                Editar Meta de {baseline?.invoice_type}
            </DialogTitle>
            <DialogContent>
                <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        Promedio actual: <strong>{currentAverage?.toFixed(2)} {baseline?.unit}</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Baseline: <strong>{baseline?.baseline_value?.toFixed(2)} {baseline?.unit}</strong>
                    </Typography>
                </Box>

                <TextField
                    autoFocus
                    margin="dense"
                    label="Meta de Consumo"
                    type="number"
                    fullWidth
                    value={targetValue}
                    onChange={(e) => {
                        setTargetValue(e.target.value);
                        setError('');
                    }}
                    helperText={`Ingresa un valor menor a ${currentAverage?.toFixed(2)} ${baseline?.unit}`}
                    inputProps={{ step: 0.01, min: 0 }}
                />

                {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {error}
                    </Alert>
                )}

                {!error && targetValue > 0 && parseFloat(targetValue) < currentAverage && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                        Meta de reducción: <strong>{reductionPercentage}%</strong>
                    </Alert>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button onClick={handleSave} variant="contained">
                    Guardar Meta
                </Button>
            </DialogActions>
        </Dialog>
    );
};
