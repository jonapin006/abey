const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

/**
 * Service for managing headquarters CRUD operations
 */
export const headquartersService = {
    /**
     * Fetch headquarters by company ID
     */
    fetchHeadquarters: async (companyId, token) => {
        const response = await fetch(`${API_URL}/headquarters?company_id=eq.${companyId}`, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error fetching headquarters: ${response.status} - ${errorText}`);
        }

        return await response.json();
    },

    /**
     * Create headquarters
     */
    createHeadquarters: async (headquartersData, token) => {
        const response = await fetch(`${API_URL}/headquarters`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Prefer': 'return=representation',
            },
            body: JSON.stringify({
                name: headquartersData.name,
                company_id: headquartersData.company_id,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error al crear sede: ${errorText}`);
        }

        return await response.json();
    },

    /**
     * Update headquarters
     */
    updateHeadquarters: async (headquartersId, headquartersData, token) => {
        const response = await fetch(`${API_URL}/headquarters?id=eq.${headquartersId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                name: headquartersData.name,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error al actualizar sede: ${errorText}`);
        }
    },

    /**
     * Delete headquarters
     */
    deleteHeadquarters: async (headquartersId, token) => {
        const response = await fetch(`${API_URL}/headquarters?id=eq.${headquartersId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error al eliminar sede: ${errorText}`);
        }
    },
};
