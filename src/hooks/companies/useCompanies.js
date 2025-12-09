import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { companiesService } from '../../services/companies/companiesService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

/**
 * Shared hook for fetching companies
 * Can be reused across the application
 */
export const useCompanies = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            setLoading(true);
            setError(null);
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            const data = await companiesService.fetchCompanies(token);
            setCompanies(data);
        } catch (err) {
            console.error('Error fetching companies:', err);
            setError('Error al cargar empresas');
            setCompanies([]);
        } finally {
            setLoading(false);
        }
    };

    const deleteCompany = async (companyId) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            await companiesService.deleteCompany(companyId, token);
            await fetchCompanies(); // Refresh list
        } catch (err) {
            console.error('Error deleting company:', err);
            throw err;
        }
    };

    return { companies, loading, error, refetch: fetchCompanies, deleteCompany };
};

