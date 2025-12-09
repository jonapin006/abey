import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { headquartersService } from '../../services/headquarters/headquartersService';

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
            setError(null);
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            const data = await headquartersService.fetchHeadquarters(companyId, token);
            setHeadquarters(data);
        } catch (err) {
            console.error('Error fetching headquarters:', err);
            setError('Error al cargar sedes');
            setHeadquarters([]);
        } finally {
            setLoading(false);
        }
    };

    const createHeadquarters = async (headquartersData) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            await headquartersService.createHeadquarters(headquartersData, token);
            await fetchHeadquarters();
        } catch (err) {
            console.error('Error creating headquarters:', err);
            throw err;
        }
    };

    const updateHeadquarters = async (headquartersId, headquartersData) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            await headquartersService.updateHeadquarters(headquartersId, headquartersData, token);
            await fetchHeadquarters();
        } catch (err) {
            console.error('Error updating headquarters:', err);
            throw err;
        }
    };

    const deleteHeadquarters = async (headquartersId) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            await headquartersService.deleteHeadquarters(headquartersId, token);
            await fetchHeadquarters();
        } catch (err) {
            console.error('Error deleting headquarters:', err);
            throw err;
        }
    };

    return {
        headquarters,
        loading,
        error,
        refetch: fetchHeadquarters,
        createHeadquarters,
        updateHeadquarters,
        deleteHeadquarters,
    };
};

