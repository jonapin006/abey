import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

/**
 * Shared hook for fetching headquarters by company
 * Can be reused across the application
 */
export const useHeadquarters = (companyId) => {
    const [headquarters, setHeadquarters] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (companyId) {
            fetchHeadquarters();
        } else {
            setHeadquarters([]);
        }
    }, [companyId]);

    const fetchHeadquarters = async () => {
        try {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            const response = await fetch(
                `${API_URL}/headquarters?company_id=eq.${companyId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json',
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                setHeadquarters(data);
            } else {
                setHeadquarters([]);
            }
        } catch (err) {
            console.error('Error fetching headquarters:', err);
            setError('Error al cargar sedes');
            setHeadquarters([]);
        } finally {
            setLoading(false);
        }
    };

    return { headquarters, loading, error, refetch: fetchHeadquarters };
};
