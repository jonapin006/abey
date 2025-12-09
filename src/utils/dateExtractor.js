/**
 * Date Extraction Utilities for Invoices
 * Handles extraction of month and year from periodo_facturado field
 */

/**
 * Month name to number mapping (Spanish and English)
 */
const MONTH_MAP = {
    'ENE': '01', 'FEB': '02', 'MAR': '03', 'ABR': '04',
    'MAY': '05', 'JUN': '06', 'JUL': '07', 'AGO': '08',
    'SEP': '09', 'OCT': '10', 'NOV': '11', 'DIC': '12',
    'JAN': '01', 'APR': '04', 'AUG': '08', 'DEC': '12'
};

/**
 * Extract month in YYYY-MM format from periodo_facturado field
 * Supports multiple formats:
 * - "08 OCT/2025 A 06 NOV/2025"
 * - "JUN/21/2025 - AGO/20/2025"
 * - "MAY/01/2025 - JUN/30/2025"
 * - "DIC/24/2024 FEB/20/2025"
 * 
 * @param {string} periodoFacturado - Billing period string
 * @returns {string|null} Month in YYYY-MM format or null
 */
export const extractMonthFromPeriodo = (periodoFacturado) => {
    if (!periodoFacturado) return null;

    // Pattern 1: "08 OCT/2025 A 06 NOV/2025" or "OCT/2025"
    let match = periodoFacturado.match(/(\w{3})\/(\d{4})/);

    // Pattern 2: "JUN/21/2025 - AGO/20/2025" or "MAY/01/2025 - JUN/30/2025"
    if (!match) {
        match = periodoFacturado.match(/(\w{3})\/\d{2}\/(\d{4})/);
    }

    // Pattern 3: "DIC/24/2024 FEB/20/2025" - take the last date
    if (!match) {
        const matches = periodoFacturado.match(/(\w{3})\/\d{2}\/(\d{4})/g);
        if (matches && matches.length > 0) {
            // Take the last date in the range
            const lastDate = matches[matches.length - 1];
            match = lastDate.match(/(\w{3})\/\d{2}\/(\d{4})/);
        }
    }

    if (match) {
        const monthName = match[1].toUpperCase();
        const year = match[2];
        const monthNumber = MONTH_MAP[monthName] || '01';
        return `${year}-${monthNumber}`;
    }

    return null;
};

/**
 * Extract month from invoice object
 * Tries periodo_facturado first, then falls back to created_at
 * 
 * @param {Object} invoice - Invoice object
 * @returns {string|null} Month in YYYY-MM format or null
 */
export const extractMonthFromInvoice = (invoice) => {
    if (!invoice) return null;

    // Try periodo_facturado first
    if (invoice.data?.periodo_facturado) {
        const month = extractMonthFromPeriodo(invoice.data.periodo_facturado);
        if (month) return month;
    }

    // Fallback to created_at
    if (invoice.created_at) {
        return invoice.created_at.substring(0, 7); // YYYY-MM
    }

    return null;
};

/**
 * Extract year from periodo_facturado, taking the last year in the period
 * @param {string} periodoFacturado - Billing period string
 * @returns {number|null} Year or null
 */
export const extractYearFromPeriodo = (periodoFacturado) => {
    if (!periodoFacturado) return null;

    // Find all years in the string
    const matches = periodoFacturado.match(/(\d{4})/g);
    if (matches && matches.length > 0) {
        // Take the last year (end of billing period)
        return parseInt(matches[matches.length - 1]);
    }

    return null;
};
