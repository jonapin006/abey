const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

/**
 * Service for managing reports data
 */
export const reportsService = {
    /**
     * Fetch diagnostics with completion stats
     */
    fetchDiagnosticsWithStats: async (userId, token) => {
        const diagnosticsUrl = `${API_URL}/environmental_diagnostics?user_id=eq.${userId}&order=created_at.desc`;

        const response = await fetch(diagnosticsUrl, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Error HTTP ${response.status}`);
        }

        const data = await response.json();

        // Calculate completion for each diagnostic
        const diagnosticsWithStats = await Promise.all(
            data.map(async (diagnostic) => {
                const statsUrl = `${API_URL}/diagnostic_responses_with_questions?diagnostic_id=eq.${diagnostic.id}`;
                const statsResponse = await fetch(statsUrl, {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (statsResponse.ok) {
                    const responses = await statsResponse.json();
                    const withActionPlan = responses.filter(r => r.action_plan_id !== null);
                    const total = withActionPlan.length;
                    const completed = withActionPlan.filter(r => r.action_plan_status === 'Completado').length;
                    const inProgress = withActionPlan.filter(r => r.action_plan_status === 'En progreso').length;
                    const pending = withActionPlan.filter(r => r.action_plan_status === 'Por hacer').length;

                    return {
                        ...diagnostic,
                        total,
                        completed,
                        inProgress,
                        pending,
                        completionPercentage: total > 0 ? Math.round((completed / total) * 100) : 0,
                    };
                }

                return diagnostic;
            })
        );

        return diagnosticsWithStats;
    },

    /**
     * Fetch detailed stats for a specific diagnostic grouped by part
     */
    fetchDiagnosticDetails: async (diagnosticId, token) => {
        const url = `${API_URL}/diagnostic_responses_with_questions?diagnostic_id=eq.${diagnosticId}`;
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Error fetching diagnostic details');
        }

        const responses = await response.json();

        // Group by part
        const byPart = responses.reduce((acc, r) => {
            if (!acc[r.part_description]) {
                acc[r.part_description] = {
                    total: 0,
                    completed: 0,
                    inProgress: 0,
                    pending: 0,
                };
            }

            if (r.action_plan_id) {
                acc[r.part_description].total++;
                if (r.action_plan_status === 'Completado') acc[r.part_description].completed++;
                if (r.action_plan_status === 'En progreso') acc[r.part_description].inProgress++;
                if (r.action_plan_status === 'Por hacer') acc[r.part_description].pending++;
            }

            return acc;
        }, {});

        return byPart;
    }
};
