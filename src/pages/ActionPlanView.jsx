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
    Divider,
    Chip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AssignmentIcon from '@mui/icons-material/Assignment';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
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
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '60vh',
                        gap: 2
                    }}>
                        <CircularProgress size={48} thickness={4} />
                        <Typography variant="body1" color="text.secondary">
                            Cargando información...
                        </Typography>
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
                    <Box sx={{ py: 4 }}>
                        <Button
                            startIcon={<ArrowBackIcon />}
                            onClick={handleBack}
                            variant="outlined"
                            sx={{
                                mb: 3,
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 500
                            }}
                        >
                            Volver
                        </Button>
                        <Alert
                            severity="error"
                            sx={{
                                borderRadius: 2,
                                boxShadow: '0 2px 8px rgba(211, 47, 47, 0.1)'
                            }}
                        >
                            Error: {error}
                        </Alert>
                    </Box>
                </Container>
            </Layout>
        );
    }

    // Render action plan content
    const renderActionPlanContent = () => {
        if (!actionPlanData) {
            return (
                <Box sx={{
                    textAlign: 'center',
                    py: 6,
                    color: 'text.secondary'
                }}>
                    <AssignmentIcon sx={{ fontSize: 64, opacity: 0.3, mb: 2 }} />
                    <Typography variant="body1" color="text.secondary">
                        No hay plan de acción disponible
                    </Typography>
                </Box>
            );
        }

        if (actionPlanData.error) {
            return (
                <Alert
                    severity="error"
                    sx={{
                        borderRadius: 2,
                        boxShadow: '0 2px 8px rgba(211, 47, 47, 0.1)'
                    }}
                >
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
                        backgroundColor: '#fafafa',
                        p: 4,
                        borderRadius: 2,
                        overflow: 'auto',
                        border: '1px solid',
                        borderColor: 'divider',
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
                        backgroundColor: '#fafafa',
                        p: 4,
                        borderRadius: 2,
                        overflow: 'auto',
                        border: '1px solid',
                        borderColor: 'divider',
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
                    backgroundColor: '#fafafa',
                    p: 4,
                    borderRadius: 2,
                    overflow: 'auto',
                    whiteSpace: 'pre-wrap',
                    wordWrap: 'break-word',
                    border: '1px solid',
                    borderColor: 'divider',
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    lineHeight: 1.6
                }}
            >
                {JSON.stringify(actionPlanData, null, 2)}
            </Box>
        );
    };

    return (
        <Layout>
            <Container maxWidth="xl" sx={{ py: 4 }}>
                {/* Header Section */}
                <Box sx={{ mb: 4 }}>
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={handleBack}
                        variant="outlined"
                        sx={{
                            mb: 3,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 500,
                            px: 3,
                            py: 1,
                            '&:hover': {
                                transform: 'translateX(-4px)',
                                transition: 'transform 0.2s ease-in-out'
                            }
                        }}
                    >
                        Volver
                    </Button>

                    <Box sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: 3,
                        p: 4,
                        color: 'white',
                        boxShadow: '0 8px 24px rgba(102, 126, 234, 0.25)',
                        mb: 4
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <AssignmentIcon sx={{ fontSize: 40 }} />
                            <Typography
                                variant="h3"
                                component="h1"
                                sx={{
                                    fontWeight: 700,
                                    letterSpacing: '-0.5px'
                                }}
                            >
                                Plan de Acción
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Question Information Card */}
                {responseData && (
                    <Paper
                        elevation={0}
                        sx={{
                            p: 4,
                            mb: 3,
                            borderRadius: 3,
                            border: '1px solid',
                            borderColor: 'divider',
                            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
                            transition: 'box-shadow 0.3s ease-in-out',
                            '&:hover': {
                                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)'
                            }
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                            <InfoOutlinedIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                            <Typography
                                variant="h5"
                                sx={{
                                    fontWeight: 600,
                                    color: 'text.primary'
                                }}
                            >
                                Información de la Pregunta
                            </Typography>
                        </Box>

                        <Divider sx={{ mb: 3 }} />

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                            <Box>
                                <Typography
                                    variant="overline"
                                    sx={{
                                        color: 'text.secondary',
                                        fontWeight: 600,
                                        letterSpacing: '0.5px',
                                        fontSize: '0.75rem'
                                    }}
                                >
                                    Parte
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        mt: 0.5,
                                        fontSize: '1rem',
                                        lineHeight: 1.6
                                    }}
                                >
                                    {responseData.part_description}
                                </Typography>
                            </Box>

                            <Box>
                                <Typography
                                    variant="overline"
                                    sx={{
                                        color: 'text.secondary',
                                        fontWeight: 600,
                                        letterSpacing: '0.5px',
                                        fontSize: '0.75rem'
                                    }}
                                >
                                    Pregunta
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        mt: 0.5,
                                        fontSize: '1rem',
                                        lineHeight: 1.6
                                    }}
                                >
                                    {responseData.question_text}
                                </Typography>
                            </Box>

                            <Box>
                                <Typography
                                    variant="overline"
                                    sx={{
                                        color: 'text.secondary',
                                        fontWeight: 600,
                                        letterSpacing: '0.5px',
                                        fontSize: '0.75rem'
                                    }}
                                >
                                    Respuesta
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        mt: 0.5,
                                        fontSize: '1rem',
                                        lineHeight: 1.6
                                    }}
                                >
                                    {responseData.user_response}
                                </Typography>
                            </Box>

                            <Box>
                                <Typography
                                    variant="overline"
                                    sx={{
                                        color: 'text.secondary',
                                        fontWeight: 600,
                                        letterSpacing: '0.5px',
                                        fontSize: '0.75rem',
                                        mb: 1,
                                        display: 'block'
                                    }}
                                >
                                    Estado
                                </Typography>
                                <Chip
                                    icon={<CheckCircleOutlineIcon />}
                                    label={responseData.action_plan_status || 'Por hacer'}
                                    color={responseData.action_plan_status === 'Completado' ? 'success' : 'default'}
                                    sx={{
                                        fontWeight: 500,
                                        px: 1,
                                        height: 32
                                    }}
                                />
                            </Box>
                        </Box>
                    </Paper>
                )}

                {/* Action Plan Card */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 4,
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: 'divider',
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
                        transition: 'box-shadow 0.3s ease-in-out',
                        '&:hover': {
                            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)'
                        }
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                        <AssignmentIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                        <Typography
                            variant="h5"
                            sx={{
                                fontWeight: 600,
                                color: 'primary.main'
                            }}
                        >
                            Plan de Acción Generado
                        </Typography>
                    </Box>

                    <Divider sx={{ mb: 3 }} />

                    {generatingPlan ? (
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            py: 8,
                            gap: 3
                        }}>
                            <CircularProgress size={48} thickness={4} />
                            <Typography
                                variant="body1"
                                sx={{
                                    color: 'text.secondary',
                                    fontWeight: 500
                                }}
                            >
                                Generando plan de acción...
                            </Typography>
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
