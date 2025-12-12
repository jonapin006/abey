import { supabase } from '../../lib/supabaseClient';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

/**
 * Service for managing KPI API operations
 * Handles KPI baselines, evaluations, and related data
 */
export const kpiService = {
    /**
     * Fetch KPI baselines for a company and year
     * @param {string} companyId - Company ID
     * @param {number} year - Year
     * @param {string} token - Auth token
     * @returns {Promise<Array>} Array of baselines
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
     * @param {string} companyId - Company ID
     * @param {string} type - Invoice type (optional)
     * @param {string} token - Auth token
     * @returns {Promise<Array>} Array of evaluations
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
     * Fetch invoice counts by type for a company
     * @param {string} companyId - Company ID
     * @param {string} token - Auth token
     * @returns {Promise<Object>} Count of invoices by type
     */
    fetchInvoiceCounts: async (companyId, token) => {
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
     * @param {string} companyId - Company ID
     * @param {string} invoiceType - Invoice type
     * @param {number} year - Year
     * @param {string} token - Auth token
     * @returns {Promise<Object>} Generation result
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
     * @param {string} baselineId - Baseline ID
     * @param {number} targetValue - New target value
     * @param {string} token - Auth token
     * @returns {Promise<Object>} Updated baseline
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
