import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { consultingService } from '../../services/consulting/consultingService';

/**
 * Custom hook for managing diagnostics list
 */
export const useDiagnostics = () => {
    const [diagnostics, setDiagnostics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDiagnostics();
    }, []);

    const fetchDiagnostics = async () => {
        try {
            setLoading(true);
            setError(null);

            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            const user = session?.user;

            if (!user) return;

            const data = await consultingService.fetchUserDiagnostics(user.id, token);
            setDiagnostics(data);
        } catch (err) {
            console.error('Error fetching diagnostics:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return {
        diagnostics,
        loading,
        error,
        refetch: fetchDiagnostics,
    };
};
