import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { consultingService } from '../../services/consulting/consultingService';

/**
 * Custom hook for managing diagnostic responses
 */
export const useDiagnosticResponses = (diagnosticId) => {
    const [responses, setResponses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [updating, setUpdating] = useState({});

    useEffect(() => {
        if (diagnosticId) {
            fetchResponses();
        } else {
            setResponses([]);
        }
    }, [diagnosticId]);

    const fetchResponses = async () => {
        try {
            setLoading(true);
            setError(null);

            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            const data = await consultingService.fetchDiagnosticResponses(diagnosticId, token);

            // Sort by part_id and then question_id
            const sortedData = data.sort((a, b) => {
                if (a.part_id !== b.part_id) {
                    return a.part_id - b.part_id;
                }
                return a.question_id - b.question_id;
            });

            setResponses(sortedData);
        } catch (err) {
            console.error('Error fetching responses:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (itemId, actionPlanId, newStatus) => {
        setUpdating(prev => ({ ...prev, [itemId]: true }));

        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            const newId = await consultingService.updateActionPlanStatus(
                itemId,
                actionPlanId,
                newStatus,
                token
            );

            // Update local state
            setResponses(prev => prev.map(item => {
                if (item.id === itemId) {
                    const updatedItem = { ...item, action_plan_status: newStatus };
                    if (newId) {
                        updatedItem.action_plan_id = newId;
                    }
                    return updatedItem;
                }
                return item;
            }));

        } catch (err) {
            console.error('Error updating status:', err);
            setError(err.message);
        } finally {
            setUpdating(prev => ({ ...prev, [itemId]: false }));
        }
    };

    return {
        responses,
        loading,
        error,
        updating,
        updateStatus,
        refetch: fetchResponses,
    };
};
