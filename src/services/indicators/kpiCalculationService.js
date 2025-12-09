/**
 * KPI Calculation Service
 * Business logic for calculating KPI baselines, averages, and evaluations
 */

import { extractConsumption } from '../../utils/invoiceParser';
import { extractMonthFromInvoice } from '../../utils/dateExtractor';

/**
 * Calculate average consumption from invoices
 * @param {Array} invoices - Array of invoice objects
 * @returns {number} Average consumption
 */
export const calculateAverageConsumption = (invoices) => {
    if (!invoices || invoices.length === 0) return 0;

    let totalConsumption = 0;
    let validCount = 0;

    invoices.forEach(invoice => {
        const consumption = extractConsumption(invoice.data);
        if (consumption > 0) {
            totalConsumption += consumption;
            validCount++;
        }
    });

    return validCount > 0 ? totalConsumption / validCount : 0;
};

/**
 * Group invoices by month and calculate monthly totals
 * @param {Array} invoices - Array of invoice objects
 * @returns {Object} Monthly data grouped by month (YYYY-MM)
 */
export const groupInvoicesByMonth = (invoices) => {
    const monthlyData = {};

    invoices.forEach(invoice => {
        const month = extractMonthFromInvoice(invoice);

        if (month) {
            if (!monthlyData[month]) {
                monthlyData[month] = { total: 0, count: 0 };
            }

            const consumption = extractConsumption(invoice.data);
            if (consumption > 0) {
                monthlyData[month].total += consumption;
                monthlyData[month].count++;
            }
        }
    });

    return monthlyData;
};

/**
 * Generate evaluations from monthly data and baseline
 * @param {Object} monthlyData - Monthly consumption data
 * @param {Object} baseline - Baseline object with target_value
 * @returns {Array} Array of evaluation objects
 */
export const generateEvaluationsFromMonthlyData = (monthlyData, baseline) => {
    if (!monthlyData || !baseline) return [];

    return Object.keys(monthlyData)
        .sort() // Sort chronologically (oldest first)
        .map(month => {
            const data = monthlyData[month];
            const avgValue = data.total / data.count;
            const target = baseline.target_value || baseline.baseline_value;

            return {
                month,
                value: Math.round(avgValue * 100) / 100,
                target,
                status: avgValue <= target ? 'within_target' : 'out_of_target'
            };
        });
};

/**
 * Count invoices by type
 * @param {Array} invoices - Array of invoice objects
 * @returns {Object} Count of invoices by type
 */
export const countInvoicesByType = (invoices) => {
    const counts = {};

    invoices.forEach(invoice => {
        const type = invoice.type;
        counts[type] = (counts[type] || 0) + 1;
    });

    return counts;
};

/**
 * Group invoices by type
 * @param {Array} invoices - Array of invoice objects
 * @returns {Object} Invoices grouped by type
 */
export const groupInvoicesByType = (invoices) => {
    const grouped = {};

    invoices.forEach(invoice => {
        const type = invoice.type;
        if (!grouped[type]) {
            grouped[type] = [];
        }
        grouped[type].push(invoice);
    });

    return grouped;
};
