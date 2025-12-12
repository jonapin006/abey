import { useState, useCallback } from 'react';

/**
 * Custom hook for managing invoice filters
 */
export const useInvoiceFilters = () => {
    const currentYear = new Date().getFullYear();

    const [filters, setFilters] = useState({
        year: currentYear,
        company_id: '',
        type: '',
        headquarters_id: '',
    });

    const updateFilter = useCallback((key, value) => {
        setFilters(prev => {
            const newFilters = { ...prev, [key]: value };

            // Reset headquarters when company changes
            if (key === 'company_id') {
                newFilters.headquarters_id = '';
            }

            return newFilters;
        });
    }, []);

    const resetFilters = useCallback(() => {
        setFilters({
            year: currentYear,
            company_id: '',
            type: '',
            headquarters_id: '',
        });
    }, [currentYear]);

    return {
        filters,
        updateFilter,
        resetFilters,
    };
};
