import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { reportsService } from '../../services/reports/reportsService';

export const useReports = () => {
    const [diagnostics, setDiagnostics] = useState([]);
    const [selectedDiagnostic, setSelectedDiagnostic] = useState(null);
    const [diagnosticDetails, setDiagnosticDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [chartType, setChartType] = useState('bar');

    useEffect(() => {
        fetchDiagnostics();
    }, []);

    const fetchDiagnostics = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setError('Usuario no autenticado');
                setLoading(false);
                return;
            }

            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            const data = await reportsService.fetchDiagnosticsWithStats(user.id, token);
            setDiagnostics(data);
        } catch (err) {
            console.error('Error fetching diagnostics:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (diagnostic) => {
        setSelectedDiagnostic(diagnostic);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            const details = await reportsService.fetchDiagnosticDetails(diagnostic.id, token);
            setDiagnosticDetails(details);
        } catch (err) {
            console.error('Error fetching details:', err);
            // Optional: set error state specific to details
        }
    };

    const handleBack = () => {
        setSelectedDiagnostic(null);
        setDiagnosticDetails(null);
        fetchDiagnostics(); // Refresh list
    };

    return {
        diagnostics,
        selectedDiagnostic,
        diagnosticDetails,
        loading,
        error,
        chartType,
        setChartType,
        handleViewDetails,
        handleBack,
        refetch: fetchDiagnostics
    };
};
