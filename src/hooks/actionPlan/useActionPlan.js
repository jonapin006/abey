import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { actionPlanService } from '../../services/actionPlan/actionPlanService';

/**
 * Custom hook for managing action plan state and operations
 */
export const useActionPlan = (responseId) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [responseData, setResponseData] = useState(null);
    const [actionPlanData, setActionPlanData] = useState(null);
    const [generatingPlan, setGeneratingPlan] = useState(false);

    useEffect(() => {
        if (responseId) {
            fetchResponseData();
        }
    }, [responseId]);

    const fetchResponseData = async () => {
        try {
            setLoading(true);
            setError(null);

            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            const data = await actionPlanService.fetchDiagnosticResponse(responseId, token);
            setResponseData(data);

            // If there's a generated plan, load it
            if (data.generated_plan) {
                setActionPlanData(data.generated_plan);
            } else if (!data.action_plan_id) {
                // No action plan exists, generate one
                await generateActionPlan(data);
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
            const planData = await actionPlanService.generateActionPlanWithAI(item.question_id);

            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            const newActionPlan = await actionPlanService.saveActionPlan(
                item.id,
                item.action_plan_id,
                planData,
                token
            );

            setActionPlanData(planData);

            if (newActionPlan) {
                setResponseData(prev => ({
                    ...prev,
                    action_plan_id: newActionPlan.id,
                    generated_plan: planData,
                    generated_at: new Date().toISOString()
                }));
            }
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

    return {
        loading,
        error,
        responseData,
        actionPlanData,
        generatingPlan,
        refetch: fetchResponseData,
    };
};
