/**
 * Invoice Business Logic Service
 * Pure business logic for invoice operations
 * No API calls - only data transformation and business rules
 */

/**
 * Validate invoice data before saving
 * @param {Object} invoiceData - Invoice data to validate
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
export const validateInvoiceData = (invoiceData) => {
    const errors = [];

    if (!invoiceData.headquarters_id) {
        errors.push('Sede es requerida');
    }

    if (!invoiceData.type) {
        errors.push('Tipo de factura es requerido');
    }

    if (!invoiceData.year) {
        errors.push('Año es requerido');
    }

    if (!invoiceData.file_url) {
        errors.push('Archivo es requerido');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Group invoices by type
 * @param {Array} invoices - Array of invoice objects
 * @returns {Object} Invoices grouped by type
 */
export const groupInvoicesByType = (invoices) => {
    if (!invoices || invoices.length === 0) return {};

    return invoices.reduce((grouped, invoice) => {
        const type = invoice.type;
        if (!grouped[type]) {
            grouped[type] = [];
        }
        grouped[type].push(invoice);
        return grouped;
    }, {});
};

/**
 * Group invoices by month
 * @param {Array} invoices - Array of invoice objects
 * @returns {Object} Invoices grouped by month (YYYY-MM)
 */
export const groupInvoicesByMonth = (invoices) => {
    if (!invoices || invoices.length === 0) return {};

    return invoices.reduce((grouped, invoice) => {
        const date = new Date(invoice.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        if (!grouped[monthKey]) {
            grouped[monthKey] = [];
        }
        grouped[monthKey].push(invoice);
        return grouped;
    }, {});
};

/**
 * Group invoices by headquarters
 * @param {Array} invoices - Array of invoice objects
 * @returns {Object} Invoices grouped by headquarters
 */
export const groupInvoicesByHeadquarters = (invoices) => {
    if (!invoices || invoices.length === 0) return {};

    return invoices.reduce((grouped, invoice) => {
        const hqId = invoice.headquarters_id;
        const hqName = invoice.headquarters?.name || 'Sin sede';

        if (!grouped[hqId]) {
            grouped[hqId] = {
                name: hqName,
                invoices: []
            };
        }
        grouped[hqId].invoices.push(invoice);
        return grouped;
    }, {});
};

/**
 * Calculate invoice statistics
 * @param {Array} invoices - Array of invoice objects
 * @returns {Object} Statistics object
 */
export const calculateInvoiceStatistics = (invoices) => {
    if (!invoices || invoices.length === 0) {
        return {
            total: 0,
            byType: {},
            byMonth: {},
            byHeadquarters: {}
        };
    }

    const byType = groupInvoicesByType(invoices);
    const byMonth = groupInvoicesByMonth(invoices);
    const byHeadquarters = groupInvoicesByHeadquarters(invoices);

    return {
        total: invoices.length,
        byType: Object.keys(byType).reduce((acc, type) => {
            acc[type] = byType[type].length;
            return acc;
        }, {}),
        byMonth: Object.keys(byMonth).reduce((acc, month) => {
            acc[month] = byMonth[month].length;
            return acc;
        }, {}),
        byHeadquarters: Object.keys(byHeadquarters).reduce((acc, hqId) => {
            acc[hqId] = {
                name: byHeadquarters[hqId].name,
                count: byHeadquarters[hqId].invoices.length
            };
            return acc;
        }, {})
    };
};

/**
 * Filter invoices by date range
 * @param {Array} invoices - Array of invoice objects
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Array} Filtered invoices
 */
export const filterInvoicesByDateRange = (invoices, startDate, endDate) => {
    if (!invoices || invoices.length === 0) return [];
    if (!startDate && !endDate) return invoices;

    return invoices.filter(invoice => {
        const invoiceDate = new Date(invoice.created_at);

        if (startDate && invoiceDate < startDate) return false;
        if (endDate && invoiceDate > endDate) return false;

        return true;
    });
};

/**
 * Transform invoice for display in table
 * @param {Object} invoice - Invoice object from API
 * @returns {Object} Transformed invoice for UI
 */
export const transformInvoiceForDisplay = (invoice) => {
    return {
        id: invoice.id,
        fileName: invoice.file_name,
        type: invoice.type,
        year: invoice.year,
        headquarters: invoice.headquarters?.name || 'N/A',
        headquartersId: invoice.headquarters_id,
        uploadDate: new Date(invoice.created_at).toLocaleDateString('es-CO'),
        fileUrl: invoice.file_url,
        status: invoice.status || 'processed',
        data: invoice.data
    };
};

/**
 * Sort invoices by date (newest first)
 * @param {Array} invoices - Array of invoice objects
 * @returns {Array} Sorted invoices
 */
export const sortInvoicesByDate = (invoices, ascending = false) => {
    if (!invoices || invoices.length === 0) return [];

    return [...invoices].sort((a, b) => {
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        return ascending ? dateA - dateB : dateB - dateA;
    });
};

/**
 * Get unique invoice types from array
 * @param {Array} invoices - Array of invoice objects
 * @returns {Array} Unique types
 */
export const getUniqueInvoiceTypes = (invoices) => {
    if (!invoices || invoices.length === 0) return [];

    const types = invoices.map(inv => inv.type).filter(Boolean);
    return [...new Set(types)];
};

/**
 * Get unique years from invoices
 * @param {Array} invoices - Array of invoice objects
 * @returns {Array} Unique years sorted descending
 */
export const getUniqueYears = (invoices) => {
    if (!invoices || invoices.length === 0) return [];

    const years = invoices.map(inv => inv.year).filter(Boolean);
    return [...new Set(years)].sort((a, b) => b - a);
};
