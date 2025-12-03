import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Button,
    Paper,
    CircularProgress,
    Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Layout from '../components/Layout.jsx';
import { useActionPlan } from '../hooks/actionPlan/useActionPlan';

function ActionPlanView() {
    const { responseId } = useParams();
    const navigate = useNavigate();
    const {
        loading,
        error,
        responseData,
        actionPlanData,
        generatingPlan
    } = useActionPlan(responseId);

    const handleBack = () => {
        navigate(`/consulting`);
    };

    // Loading state
    if (loading) {
        return (
            <Layout>
                <Container maxWidth="xl">
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress />
                    </Box>
                </Container>
            </Layout>
        );
    }

    // Error state
    if (error) {
        return (
            <Layout>
                <Container maxWidth="xl">
                    <Box sx={{ mb: 3 }}>
                        <Button
                            startIcon={<ArrowBackIcon />}
                            onClick={handleBack}
                            sx={{ mb: 2 }}
                        >
                            Volver
                        </Button>
                    </Box>
                    <Alert severity="error">Error: {error}</Alert>
                </Container>
            </Layout>
        );
    }

    // Render action plan content
    const renderActionPlanContent = () => {
        if (!actionPlanData) {
            return (
                <Typography variant="body2" color="text.secondary">
                    <em>No hay plan de acción disponible</em>
                </Typography>
            );
        }

        if (actionPlanData.error) {
            return (
                <Alert severity="error">
                    <strong>Error:</strong> {actionPlanData.error}
                    {actionPlanData.details && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                            {actionPlanData.details}
                        </Typography>
                    )}
                </Alert>
            );
        }

        // Check for HTML content in various possible fields
        if (actionPlanData.output || actionPlanData.html || actionPlanData.content || actionPlanData.plan) {
            const htmlContent = actionPlanData.output || actionPlanData.html || actionPlanData.content || actionPlanData.plan;
            return (
                <Box
                    sx={{
                        backgroundColor: '#f5f5f5',
                        p: 3,
                        borderRadius: 1,
                        overflow: 'auto',
                        '& > div': {
                            maxWidth: '100% !important',
                            width: '100%',
                        }
                    }}
                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                />
            );
        }

        // Check if it's a string with HTML
        if (typeof actionPlanData === 'string' && actionPlanData.includes('<')) {
            return (
                <Box
                    sx={{
                        backgroundColor: '#f5f5f5',
                        p: 3,
                        borderRadius: 1,
                        overflow: 'auto'
                    }}
                    dangerouslySetInnerHTML={{ __html: actionPlanData }}
                />
            );
        }

        // Fallback: render as JSON
        return (
            <Box
                component="pre"
                sx={{
                    backgroundColor: '#f5f5f5',
                    p: 3,
                    borderRadius: 1,
                    overflow: 'auto',
                    whiteSpace: 'pre-wrap',
                    wordWrap: 'break-word'
                }}
            >
                {JSON.stringify(actionPlanData, null, 2)}
            </Box>
        );
    };

    return (
        <Layout>
            <Container maxWidth="xl">
                {/* Header */}
                <Box sx={{ mb: 3 }}>
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={handleBack}
                        sx={{ mb: 2 }}
                    >
                        Volver
                    </Button>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Plan de Acción
                    </Typography>
                </Box>

                {/* Question Information */}
                {responseData && (
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Información de la Pregunta
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                            <strong>Parte:</strong> {responseData.part_description}
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                            <strong>Pregunta:</strong> {responseData.question_text}
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                            <strong>Respuesta:</strong> {responseData.user_response}
                        </Typography>
                        <Typography variant="body1">
                            <strong>Estado:</strong> {responseData.action_plan_status || 'Por hacer'}
                        </Typography>
                    </Paper>
                )}

                {/* Action Plan */}
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom color="primary">
                        Plan de Acción Generado
                    </Typography>

                    {generatingPlan ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                            <CircularProgress />
                            <Typography sx={{ ml: 2 }}>Generando plan de acción...</Typography>
                        </Box>
                    ) : (
                        renderActionPlanContent()
                    )}
                </Paper>
            </Container>
        </Layout>
    );
}

export default ActionPlanView;
