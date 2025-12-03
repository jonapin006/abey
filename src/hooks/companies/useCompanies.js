import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

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
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            const response = await fetch(`${API_URL}/companies`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setCompanies(data);
            } else {
                setCompanies([]);
            }
        } catch (err) {
            console.error('Error fetching companies:', err);
            setError('Error al cargar empresas');
            setCompanies([]);
        } finally {
            setLoading(false);
        }
    };

    return { companies, loading, error, refetch: fetchCompanies };
};
