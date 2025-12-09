const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

/**
 * Service for managing user CRUD operations
 */
export const usersService = {
    /**
     * Fetch all users with enriched data (roles and companies)
     */
    fetchUsers: async (token) => {
        // Fetch user profiles
        const profilesResponse = await fetch(`${API_URL}/user_profiles_with_email`, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!profilesResponse.ok) {
            const errorText = await profilesResponse.text();
            throw new Error(`Error fetching users: ${profilesResponse.status} - ${errorText}`);
        }

        const profiles = await profilesResponse.json();

        // Fetch roles
        const rolesResponse = await fetch(`${API_URL}/roles`, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        const rolesData = rolesResponse.ok ? await rolesResponse.json() : [];

        // Fetch companies
        const companiesResponse = await fetch(`${API_URL}/companies`, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        const companiesData = companiesResponse.ok ? await companiesResponse.json() : [];

        // Enrich profiles with role and company names
        const enrichedUsers = profiles.map(profile => {
            const role = rolesData.find(r => r.id === profile.role_id);
            const company = companiesData.find(c => c.id === profile.company_id);

            return {
                id: profile.id, // Profile ID for deletion
                user_id: profile.user_id,
                email: profile.user_email,
                full_name: profile.full_name || '',
                role_id: profile.role_id,
                role_name: role?.name || 'Sin rol',
                hierarchy_level: role?.hierarchy_level || 0,
                company_id: profile.company_id,
                company_name: company?.name || 'Sin empresa',
                phone: profile.phone,
                position: profile.position,
                is_active: profile.is_active,
            };
        });

        return enrichedUsers;
    },

    /**
     * Fetch all roles
     */
    fetchRoles: async (token) => {
        const response = await fetch(`${API_URL}/roles?order=hierarchy_level.asc`, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Error fetching roles');
        }

        return await response.json();
    },

    /**
     * Create or update user
     */
    saveUser: async (userData, isEditing, userId, token) => {
        if (isEditing) {
            // Update existing user profile
            const response = await fetch(`${API_URL}/user_profiles?user_id=eq.${userId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    full_name: userData.full_name,
                    role_id: userData.role_id,
                    company_id: userData.company_id,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error al actualizar usuario: ${errorText}`);
            }
        } else {
            // Create new user in Supabase Auth first
            // This requires calling your backend endpoint that uses Supabase Admin API
            const createAuthUserResponse = await fetch(`${API_URL.replace('/api/v1', '')}/api/create-user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    email: userData.email,
                    password: userData.password,
                    full_name: userData.full_name,
                    role_id: userData.role_id,
                    company_id: userData.company_id,
                }),
            });

            if (!createAuthUserResponse.ok) {
                let errorMessage;
                try {
                    const errorData = await createAuthUserResponse.json();
                    errorMessage = errorData.error || 'Error desconocido al crear usuario';
                } catch (e) {
                    errorMessage = await createAuthUserResponse.text();
                }
                throw new Error(errorMessage);
            }

            const result = await createAuthUserResponse.json();
            return result;
        }
    },

    /**
     * Delete user
     */
    deleteUser: async (userId, token) => {
        // Call backend endpoint to delete user from Auth and Profile
        const response = await fetch(`${API_URL.replace('/api/v1', '')}/api/delete-user/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            let errorMessage;
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || 'Error desconocido al eliminar usuario';
            } catch (e) {
                errorMessage = await response.text();
            }
            throw new Error(errorMessage);
        }
    },
};
