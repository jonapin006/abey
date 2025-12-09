import React from 'react';
import { Card, CardContent, Typography, Box, Chip, IconButton } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import EditIcon from '@mui/icons-material/Edit';

export const KpiStatusCard = ({ type, value, target, unit, onClick, selected, onEdit }) => {
    const isWithinTarget = value <= target;
    const deviation = target > 0 ? ((value - target) / target) * 100 : 0;
    const deviationText = `${Math.abs(deviation).toFixed(1)}%`;

    const handleEditClick = (e) => {
        e.stopPropagation();
        if (onEdit) onEdit();
    };

    return (
        <Card
            sx={{
                cursor: 'pointer',
                border: selected ? 2 : 0,
                borderColor: 'primary.main',
                height: '100%',
                transition: 'transform 0.2s',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                }
            }}
            onClick={onClick}
        >
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography color="text.secondary" gutterBottom variant="h6">
                        {type}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        {onEdit && (
                            <IconButton
                                size="small"
                                onClick={handleEditClick}
                                sx={{ '&:hover': { color: 'primary.main' } }}
                            >
                                <EditIcon fontSize="small" />
                            </IconButton>
                        )}
                        <Chip
                            label={isWithinTarget ? 'En Meta' : 'Fuera de Meta'}
                            color={isWithinTarget ? 'success' : 'error'}
                            size="small"
                        />
                    </Box>
                </Box>

                <Typography variant="h4" component="div" sx={{ mb: 1, fontWeight: 'bold' }}>
                    {value.toLocaleString()} <Typography component="span" variant="body1" color="text.secondary">{unit}</Typography>
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                        Meta: {target.toLocaleString()} {unit}
                    </Typography>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        color: isWithinTarget ? 'success.main' : 'error.main',
                        bgcolor: isWithinTarget ? 'success.lighter' : 'error.lighter',
                        px: 0.5,
                        borderRadius: 1
                    }}>
                        {isWithinTarget ? <TrendingDownIcon fontSize="small" /> : <TrendingUpIcon fontSize="small" />}
                        <Typography variant="caption" fontWeight="bold">
                            {deviationText}
                        </Typography>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};
