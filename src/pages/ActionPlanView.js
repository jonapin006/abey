import React, { useState, useEffect } from 'react';
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
import Layout from '../components/Layout';
import { supabase } from '../lib/supabaseClient';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function ActionPlanView() {
    const { diagnosticId, responseId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [responseData, setResponseData] = useState(null);
    const [actionPlanData, setActionPlanData] = useState(null);
    const [generatingPlan, setGeneratingPlan] = useState(false);

    useEffect(() => {
        fetchResponseData();
    }, [responseId]);

    const fetchResponseData = async () => {
        try {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            // Fetch response with question details
            const url = `${API_URL}/diagnostic_responses_with_questions?id=eq.${responseId}`;
            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Error al cargar datos: ${response.statusText}`);
            }

            const data = await response.json();
            if (data.length === 0) {
                throw new Error('No se encontró la respuesta');
            }

            setResponseData(data[0]);

            // If there's a generated plan, load it
            if (data[0].generated_plan) {
                setActionPlanData(data[0].generated_plan);
            } else if (!data[0].action_plan_id) {
                // No action plan exists, generate one
                await generateActionPlan(data[0]);
            }
        } catch (err) {
            console.error('Error fetching response data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const generateActionPlan = async (item) => {
        setGeneratingPlan(true);
        try {
            const params = new URLSearchParams({
                question_id: item.question_id
            });

            const url = `${process.env.REACT_APP_N8N_WEBHOOK_URL}/webhook/6bd9eda3-8a6d-4916-bfec-a66fd5276cec?${params.toString()}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                const errorMessage = response.status === 500
                    ? 'Error en el servidor de N8N. Por favor verifica que el workflow esté activo y configurado correctamente.'
                    : `Error al obtener plan de acción: ${response.statusText}`;
                throw new Error(errorMessage);
            }

            const data = await response.json();
            await saveActionPlanToDatabase(item.id, item.action_plan_id, data);
            setActionPlanData(data);
        } catch (err) {
            console.error('Error generating action plan:', err);
            setActionPlanData({
                error: err.message,
                details: 'Verifica que el workflow de N8N esté activo y que el webhook esté configurado correctamente.'
            });
        } finally {
            setGeneratingPlan(false);
        }
    };

    const saveActionPlanToDatabase = async (diagnosticResponseId, actionPlanId, planData) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            if (actionPlanId) {
                await fetch(`${API_URL}/action_plans?id=eq.${actionPlanId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        generated_plan: planData,
                        generated_at: new Date().toISOString()
                    })
                });
            } else {
                const response = await fetch(`${API_URL}/action_plans`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify({
                        diagnostic_response_id: diagnosticResponseId,
                        status: 'Por hacer',
                        generated_plan: planData,
                        generated_at: new Date().toISOString()
                    })
                });

                if (response.ok) {
                    const newActionPlan = await response.json();
                    setResponseData(prev => ({
                        ...prev,
                        action_plan_id: newActionPlan[0].id,
                        generated_plan: planData,
                        generated_at: new Date().toISOString()
                    }));
                }
            }
        } catch (err) {
            console.error('Error saving action plan to database:', err);
        }
    };

    const handleBack = () => {
        navigate(`/consultoria`);
    };

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
                    <Typography variant="h4" component="h1" gutterBottom>
                        Plan de Acción
                    </Typography>
                </Box>

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

                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom color="primary">
                        Plan de Acción Generado
                    </Typography>

                    {generatingPlan ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                            <CircularProgress />
                            <Typography sx={{ ml: 2 }}>Generando plan de acción...</Typography>
                        </Box>
                    ) : actionPlanData ? (
                        actionPlanData.error ? (
                            <Alert severity="error">
                                <strong>Error:</strong> {actionPlanData.error}
                                {actionPlanData.details && (
                                    <Typography variant="body2" sx={{ mt: 1 }}>
                                        {actionPlanData.details}
                                    </Typography>
                                )}
                            </Alert>
                        ) : (
                            <Box>
                                {(() => {
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
                                })()}
                            </Box>
                        )
                    ) : (
                        <Typography variant="body2" color="text.secondary">
                            <em>No hay plan de acción disponible</em>
                        </Typography>
                    )}
                </Paper>
            </Container>
        </Layout>
    );
}

export default ActionPlanView;
