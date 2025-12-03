import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

/**
 * Custom hook for fetching user profile
 */
export const useUserProfile = () => {
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setLoading(false);
                return;
            }

            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

            const response = await fetch(`${API_URL}/user_profiles_with_email?user_id=eq.${user.id}`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data && data.length > 0) {
                    setUserProfile(data[0]);
                }
            }
        } catch (err) {
            console.error('Error fetching user profile:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return {
        userProfile,
        loading,
        error,
        refetch: fetchUserProfile,
    };
};
