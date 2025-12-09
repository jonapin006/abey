const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

/**
 * Service for managing company CRUD operations
 */
export const companiesService = {
    /**
     * Fetch all companies
     */
    fetchCompanies: async (token) => {
        const response = await fetch(`${API_URL}/companies`, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error fetching companies: ${response.status} - ${errorText}`);
        }

        return await response.json();
    },

    /**
     * Create or update company
     */
    saveCompany: async (companyData, isEditing, companyId, token) => {
        const payload = {
            name: companyData.name,
            company_id: companyData.company_id,
            industry: companyData.industry,
            address: companyData.address,
            city: companyData.city,
            country: companyData.country,
            phone: companyData.phone,
            website: companyData.website,
            contact_email: companyData.contact_email,
            status: companyData.status,
        };

        if (isEditing) {
            // Update existing company
            const response = await fetch(`${API_URL}/companies?id=eq.${companyId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Prefer': 'return=representation',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error al actualizar empresa: ${errorText}`);
            }

            const data = await response.json();
            return data[0]; // Return updated company
        } else {
            // Create new company
            const response = await fetch(`${API_URL}/companies`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Prefer': 'return=representation',
                },
                body: JSON.stringify({
                    ...payload,
                    status: payload.status || 'active',
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error al crear empresa: ${errorText}`);
            }

            const data = await response.json();
            return data[0]; // Return created company with ID
        }
    },

    /**
     * Delete company
     */
    deleteCompany: async (companyId, token) => {
        const response = await fetch(`${API_URL}/companies?id=eq.${companyId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error al eliminar empresa: ${errorText}`);
        }
    },
};
