import { supabase } from '../../lib/supabaseClient';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

/**
 * Service for managing invoice API operations
 * Only handles API calls - business logic is in invoiceBusinessService
 */
export const invoiceService = {
    /**
     * Fetch invoices with filters
     * @param {Object} filters - Filter object
     * @param {string} token - Auth token
     * @returns {Promise<Array>} Array of invoices
     */
    fetchInvoices: async (filters, token) => {
        let query =
            `?year=eq.${filters.year}` +
            '&order=created_at.desc' +
            '&select=*,headquarters!inner(company_id,name)';

        if (filters.type) {
            query += `&type=eq.${filters.type}`;
        }

        if (filters.company_id) {
            query += `&headquarters.company_id=eq.${filters.company_id}`;
        }

        if (filters.headquarters_id) {
            query += `&headquarters_id=eq.${filters.headquarters_id}`;
        }

        const response = await fetch(`${API_URL}/invoices${query}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Error al cargar las facturas');
        }

        return await response.json();
    },

    /**
     * Upload invoice file to Supabase Storage
     * @param {File} file - File to upload
     * @param {string} userId - User ID
     * @returns {Promise<string>} File URL
     */
    uploadInvoiceFile: async (file, userId) => {
        const filePath = `${userId}/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage
            .from('invoices')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false,
            });

        if (uploadError) throw uploadError;

        const authenticatedUrl = `${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/invoices/${filePath}`;
        return authenticatedUrl;
    },

    /**
     * Save invoice data to database
     * @param {Object} invoiceData - Invoice data
     * @param {string} token - Auth token
     * @returns {Promise<Object>} Saved invoice
     */
    saveInvoiceToDatabase: async (invoiceData, token) => {
        const response = await fetch(`${API_URL}/invoices`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                Prefer: 'return=representation',
            },
            body: JSON.stringify(invoiceData),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error al guardar: ${response.status} - ${errorText}`);
        }

        return await response.json();
    },

    /**
     * Delete invoice
     * @param {string} invoiceId - Invoice ID
     * @param {string} token - Auth token
     * @returns {Promise<void>}
     */
    deleteInvoice: async (invoiceId, token) => {
        const response = await fetch(`${API_URL}/invoices?id=eq.${invoiceId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Error al eliminar la factura');
        }
    },

    /**
     * Update invoice
     * @param {string} invoiceId - Invoice ID
     * @param {Object} updateData - Data to update
     * @param {string} token - Auth token
     * @returns {Promise<Object>} Updated invoice
     */
    updateInvoice: async (invoiceId, updateData, token) => {
        const response = await fetch(`${API_URL}/invoices?id=eq.${invoiceId}`, {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                Prefer: 'return=representation',
            },
            body: JSON.stringify(updateData),
        });

        if (!response.ok) {
            throw new Error('Error al actualizar la factura');
        }

        return await response.json();
    }
};
