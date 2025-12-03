const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
const N8N_BASE_URL = process.env.REACT_APP_N8N_WEBHOOK_URL || 'http://localhost:5678';

/**
 * Service for managing action plan operations
 */
export const actionPlanService = {
    /**
     * Fetch diagnostic response with question details
     */
    fetchDiagnosticResponse: async (responseId, token) => {
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

        return data[0];
    },

    /**
     * Generate action plan using N8N AI workflow
     */
    generateActionPlanWithAI: async (questionId) => {
        const params = new URLSearchParams({ question_id: questionId });
        const url = `${N8N_BASE_URL}/webhook/6bd9eda3-8a6d-4916-bfec-a66fd5276cec?${params.toString()}`;

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

        return await response.json();
    },

    /**
     * Save or update action plan in database
     */
    saveActionPlan: async (diagnosticResponseId, actionPlanId, planData, token) => {
        if (actionPlanId) {
            // Update existing plan
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
            return null;
        } else {
            // Create new plan
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
                return newActionPlan[0];
            }
            return null;
        }
    },
};
