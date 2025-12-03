import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { usersService } from '../../services/users/usersService';

/**
 * Custom hook for managing users list
 */
export const useUsers = () => {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            // Fetch users and roles in parallel
            const [usersData, rolesData] = await Promise.all([
                usersService.fetchUsers(token),
                usersService.fetchRoles(token),
            ]);

            setUsers(usersData);
            setRoles(rolesData);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const deleteUser = async (userId) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            await usersService.deleteUser(userId, token);
            await fetchData(); // Refresh list
        } catch (err) {
            console.error('Error deleting user:', err);
            throw err;
        }
    };

    return {
        users,
        roles,
        loading,
        error,
        refetch: fetchData,
        deleteUser,
    };
};
