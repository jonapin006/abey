import React from 'react';
import { Box, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { useNavigate } from 'react-router-dom';

export const MatrixButtons = ({ year, onNewInvoice }) => {
    const navigate = useNavigate();

    const goToMatriz = (type) => {
        navigate(`/indicators/matrix/${type}/${year}`);
    };

    return (
        <>
            {/* Row 2: Matrix Buttons */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 2,
                    mb: 2,
                    flexWrap: 'wrap',
                }}
            >
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

            {/* Row 3: Nueva Factura Button */}
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={onNewInvoice}
                    sx={{ minWidth: '300px' }}
                >
                    Nueva Factura
                </Button>
            </Box>
        </>
    );
};
