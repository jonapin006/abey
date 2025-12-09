import { supabase } from '../../lib/supabaseClient';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

/**
 * Service for managing invoice operations
 */
export const invoiceService = {
    /**
     * Fetch invoices with filters
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
     * Fetch KPI baselines for a company and year
     */
    fetchBaselines: async (companyId, year, token) => {
        const response = await fetch(`${API_URL}/kpi_baselines?company_id=eq.${companyId}&year=eq.${year}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Error al cargar las líneas base');
        }

        return await response.json();
    },

    /**
     * Fetch monthly evaluations for a company
     */
    fetchMonthlyEvaluations: async (companyId, type, token) => {
        let query = `?company_id=eq.${companyId}&order=month.desc&limit=12`;
        if (type) {
            query += `&invoice_type=eq.${type}`;
        }

        const response = await fetch(`${API_URL}/kpi_monthly_evaluations${query}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Error al cargar las evaluaciones mensuales');
        }

        return await response.json();
    },

    /**
     * Fetch invoice counts by type for a company to determine onboarding status
     */
    fetchInvoiceCounts: async (companyId, token) => {
        // This is a bit tricky with PostgREST to get counts by group directly without a stored proc or view.
        // For now, we'll fetch all invoices (lightweight select) and count client-side, 
        // or we can assume there's an endpoint for this. 
        // Given the constraints, let's try to fetch a summary view if it existed, but since we can't modify DB,
        // we will fetch all invoices for the company with a minimal select.

        const response = await fetch(`${API_URL}/invoices?headquarters.company_id=eq.${companyId}&select=type,headquarters!inner(company_id)`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Error al contar facturas');
        }

        const invoices = await response.json();

        // Group by type
        const counts = invoices.reduce((acc, curr) => {
            acc[curr.type] = (acc[curr.type] || 0) + 1;
            return acc;
        }, {});

        return counts;
    },

    /**
     * Trigger KPI generation via N8N for a specific invoice type
     */
    generateKpis: async (companyId, invoiceType, year, token) => {
        // Fetch all invoices for the company and year
        const response = await fetch(`${API_URL}/invoices?headquarters.company_id=eq.${companyId}&year=eq.${year}&select=*,headquarters!inner(company_id)&order=created_at.desc`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Error al obtener facturas para generar KPIs');
        }

        const allInvoices = await response.json();

        // Filter invoices by the requested type only
        const filteredInvoices = allInvoices.filter(inv => inv.type === invoiceType);

        if (filteredInvoices.length === 0) {
            throw new Error(`No se encontraron facturas del tipo: ${invoiceType} para el año ${year}`);
        }

        // Import and call n8nService with filtered invoices
        const { n8nService } = require('./n8nService');
        return await n8nService.generateKpis(companyId, invoiceType, filteredInvoices, token);
    },

    /**
     * Update KPI target value
     */
    updateKpiTarget: async (baselineId, targetValue, token) => {
        const response = await fetch(`${API_URL}/kpi_baselines?id=eq.${baselineId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                target_value: targetValue,
                updated_at: new Date().toISOString()
            })
        });

        if (!response.ok) {
            throw new Error('Error al actualizar la meta del KPI');
        }

        return await response.json();
    }
};
