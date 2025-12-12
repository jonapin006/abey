import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { invoiceService } from '../../services/indicators/invoiceService';
import { transformInvoiceForDisplay } from '../../services/indicators/invoiceBusinessService';

/**
 * Custom hook for managing invoices list
 * Uses invoiceBusinessService for data transformation
 */
export const useInvoices = (filters) => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            setError(null);

            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            const data = await invoiceService.fetchInvoices(filters, token);

            // Transform data for display using business logic service
            const transformedData = data.map(transformInvoiceForDisplay);
            setInvoices(transformedData);
        } catch (err) {
            console.error('Error fetching invoices:', err);
            setError('Error al cargar las facturas');
            setInvoices([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, [filters.year, filters.company_id, filters.type, filters.headquarters_id]);

    return {
        invoices,
        loading,
        error,
        refetch: fetchInvoices,
    };
};
