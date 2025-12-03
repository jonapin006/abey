const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

/**
 * Service for managing consulting/diagnostics operations
 */
export const consultingService = {
    /**
     * Fetch user diagnostics with aggregated data
     */
    fetchUserDiagnostics: async (userId, token) => {
        // 1. Fetch diagnostics for the user
        const diagnosticsResponse = await fetch(`${API_URL}/environmental_diagnostics_with_creator?user_id=eq.${userId}&order=created_at.desc`, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!diagnosticsResponse.ok) {
            throw new Error('Error al cargar diagnósticos');
        }

        const diagnostics = await diagnosticsResponse.json();

        // 2. For each diagnostic, fetch action plans stats
        const enrichedDiagnostics = await Promise.all(diagnostics.map(async (diagnostic) => {
            try {
                const actionPlansUrl = `${API_URL}/diagnostic_responses_with_questions?diagnostic_id=eq.${diagnostic.id}`;
                const actionPlansResponse = await fetch(actionPlansUrl, {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (actionPlansResponse.ok) {
                    const responses = await actionPlansResponse.json();

                    // Only count responses that have an action plan (action_plan_id is not null)
                    const responsesWithActionPlan = responses.filter(r => r.action_plan_id !== null);
                    const total = responsesWithActionPlan.length;
                    const completed = responsesWithActionPlan.filter(r => r.action_plan_status === 'Completado').length;
                    const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

                    return {
                        ...diagnostic,
                        completionPercentage,
                        totalActionPlans: total,
                        completedActionPlans: completed,
                    };
                }
            } catch (err) {
                console.error(`Error fetching stats for diagnostic ${diagnostic.id}:`, err);
            }

            return {
                ...diagnostic,
                completionPercentage: 0,
                totalActionPlans: 0,
                completedActionPlans: 0,
            };
        }));

        return enrichedDiagnostics;
    },

    /**
     * Fetch diagnostic responses with questions
     */
    fetchDiagnosticResponses: async (diagnosticId, token) => {
        if (!diagnosticId) throw new Error('Diagnostic ID inválido');

        const url = `${API_URL}/diagnostic_responses_with_questions?diagnostic_id=eq.${diagnosticId}&order=question_id.asc`;

        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Error HTTP ${response.status}: ${response.statusText} - ${text}`);
        }

        return await response.json();
    },

    /**
     * Update or create action plan status
     */
    updateActionPlanStatus: async (itemId, actionPlanId, newStatus, token) => {
        if (actionPlanId) {
            // Update existing action plan
            const response = await fetch(`${API_URL}/action_plans?id=eq.${actionPlanId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify({
                    status: newStatus
                })
            });

            if (!response.ok) {
                throw new Error(`Error al actualizar: ${response.statusText}`);
            }

            return null; // No new ID needed
        } else {
            // Create new action plan
            const response = await fetch(`${API_URL}/action_plans`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify({
                    diagnostic_response_id: itemId,
                    status: newStatus
                })
            });

            if (!response.ok) {
                throw new Error(`Error al crear plan de acción: ${response.statusText}`);
            }

            const newActionPlan = await response.json();
            return newActionPlan[0].id; // Return the new ID
        }
    },
};
