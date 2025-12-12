import { useState, useEffect, useCallback } from 'react';
import { kpiService } from '../../services/indicators/kpiService';
import { supabase } from '../../lib/supabaseClient';
import {
    calculateAverageConsumption,
    groupInvoicesByMonth,
    generateEvaluationsFromMonthlyData,
    countInvoicesByType,
    groupInvoicesByType
} from '../../services/indicators/kpiCalculationService';

/**
 * Custom hook for KPI Dashboard data management
 * Handles fetching, processing, and state management for KPI data
 * 
 * @param {string} companyId - Company ID to fetch data for
 * @param {number} year - Year to filter data by
 * @returns {Object} KPI dashboard data and methods
 */
export const useKpiDashboard = (companyId, year = new Date().getFullYear()) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [baselines, setBaselines] = useState([]);
    const [evaluations, setEvaluations] = useState({});
    const [invoiceCounts, setInvoiceCounts] = useState({});
    const [currentAverages, setCurrentAverages] = useState({});

    const fetchData = useCallback(async () => {
        if (!companyId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            if (!token) throw new Error('No hay sesión activa');

            // Fetch all data in parallel
            const [counts, baselinesData, invoicesResponse] = await Promise.all([
                kpiService.fetchInvoiceCounts(companyId, token),
                kpiService.fetchBaselines(companyId, year, token),
                fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/invoices?headquarters.company_id=eq.${companyId}&select=*,headquarters!inner(company_id)`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json',
                    },
                })
            ]);

            if (!invoicesResponse.ok) {
                throw new Error('Error al cargar facturas');
            }

            const invoices = await invoicesResponse.json();

            // Use calculation services for business logic
            const invoiceCountsByType = countInvoicesByType(invoices);
            const groupedByType = groupInvoicesByType(invoices);
            const averages = {};
            const monthlyDataByType = {};
            const evaluationsByType = {};

            // Process each invoice type
            Object.keys(groupedByType).forEach(type => {
                const typeInvoices = groupedByType[type];

                // Calculate current average
                averages[type] = calculateAverageConsumption(typeInvoices);

                // Group by month for chart data
                monthlyDataByType[type] = groupInvoicesByMonth(typeInvoices);
            });

            // Generate evaluations for each baseline
            baselinesData.forEach(baseline => {
                const type = baseline.invoice_type;

                // Get evaluations from database
                const typeEvaluations = []; // TODO: Fetch from kpi_monthly_evaluations table if exists

                // If no evaluations exist, generate from monthly invoice data
                let evaluationsToUse = typeEvaluations;
                if (typeEvaluations.length === 0 && monthlyDataByType[type]) {
                    evaluationsToUse = generateEvaluationsFromMonthlyData(
                        monthlyDataByType[type],
                        baseline
                    );
                }

                evaluationsByType[type] = evaluationsToUse;
            });

            setInvoiceCounts(invoiceCountsByType);
            setBaselines(baselinesData);
            setEvaluations(evaluationsByType);
            setCurrentAverages(averages);

        } catch (err) {
            console.error('Error fetching KPI data:', err);
            setError(err.message || 'Error al cargar los datos de KPIs');
        } finally {
            setLoading(false);
        }
    }, [companyId, year]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const generateKpis = async (invoiceType = null) => {
        if (!companyId) return;

        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            if (!token) throw new Error('No hay sesión activa');

            await kpiService.generateKpis(companyId, invoiceType, year, token);

            // Refetch data after generation
            await fetchData();
            return true;
        } catch (err) {
            console.error('Error generating KPIs:', err);
            setError(err.message || 'Error al generar KPIs');
            return false;
        }
    };

    return {
        loading,
        error,
        baselines,
        evaluations,
        invoiceCounts,
        currentAverages,
        refetch: fetchData,
        generateKpis
    };
};
