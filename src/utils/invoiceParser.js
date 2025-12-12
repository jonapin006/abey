/**
 * Invoice Data Parsing Utilities
 * Handles parsing of invoice data values with different formats
 */

/**
 * Parse a value that may contain commas, currency symbols, or units
 * @param {string|number} val - Value to parse
 * @returns {number} Parsed numeric value
 */
export const parseNumericValue = (val) => {
    if (!val) return 0;

    // Convert to string and handle decimal commas
    const str = String(val)
        .replace(/,/g, '.') // Replace comma with dot for decimals
        .replace(/[^\d.]/g, ''); // Remove non-numeric chars except dot

    return parseFloat(str) || 0;
};

/**
 * Extract consumption value from invoice data
 * @param {Object} invoiceData - Invoice data object
 * @returns {number} Consumption value
 */
export const extractConsumption = (invoiceData) => {
    if (!invoiceData) return 0;

    const consumoKwh = invoiceData.consumo_kwh || invoiceData.consumption_kwh;
    const consumoM3 = invoiceData.consumo_m3 || invoiceData.consumption_m3;
    const totalConsumption = invoiceData.total_consumption;

    return parseNumericValue(consumoKwh) ||
        parseNumericValue(consumoM3) ||
        parseNumericValue(totalConsumption);
};

/**
 * Extract invoice date from invoice data
 * @param {Object} invoiceData - Invoice data object
 * @returns {Date|null} Parsed date or null
 */
export const extractInvoiceDate = (invoiceData) => {
    if (!invoiceData) return null;

    const dateFields = [
        invoiceData.fecha_factura,
        invoiceData.invoice_date,
        invoiceData.date,
        invoiceData.fecha
    ];

    for (const field of dateFields) {
        if (field) {
            const date = new Date(field);
            if (!isNaN(date.getTime())) {
                return date;
            }
        }
    }

    return null;
};

/**
 * Extract invoice number from invoice data
 * @param {Object} invoiceData - Invoice data object
 * @returns {string} Invoice number or empty string
 */
export const extractInvoiceNumber = (invoiceData) => {
    if (!invoiceData) return '';

    return invoiceData.numero_factura ||
        invoiceData.invoice_number ||
        invoiceData.number ||
        invoiceData.numero ||
        '';
};

/**
 * Extract company/provider info from invoice data
 * @param {Object} invoiceData - Invoice data object
 * @returns {string} Company name or empty string
 */
export const extractCompanyInfo = (invoiceData) => {
    if (!invoiceData) return '';

    return invoiceData.empresa ||
        invoiceData.proveedor ||
        invoiceData.provider ||
        invoiceData.company ||
        '';
};

/**
 * Parse invoice type from string
 * Normalizes different type formats
 * @param {string} type - Type string
 * @returns {string} Normalized type
 */
export const parseInvoiceType = (type) => {
    if (!type) return '';

    const normalized = type.toLowerCase().trim();

    if (normalized.includes('energ') || normalized.includes('electric') || normalized.includes('luz')) {
        return 'Energía';
    }

    if (normalized.includes('agua') || normalized.includes('water') || normalized.includes('acueducto')) {
        return 'Agua';
    }

    if (normalized.includes('acta') || normalized.includes('minute')) {
        return 'Actas';
    }

    // Return capitalized version of original
    return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
};

/**
 * Extract total amount from invoice data
 * @param {Object} invoiceData - Invoice data object
 * @returns {number} Total amount
 */
export const extractTotalAmount = (invoiceData) => {
    if (!invoiceData) return 0;

    const totalFields = [
        invoiceData.total,
        invoiceData.total_amount,
        invoiceData.monto_total,
        invoiceData.valor_total
    ];

    for (const field of totalFields) {
        if (field) {
            const amount = parseNumericValue(field);
            if (amount > 0) return amount;
        }
    }

    return 0;
};

/**
 * Extract period (month/year) from invoice data
 * @param {Object} invoiceData - Invoice data object
 * @returns {Object} { month: number, year: number } or null
 */
export const extractPeriod = (invoiceData) => {
    if (!invoiceData) return null;

    const period = {
        month: null,
        year: null
    };

    // Try to extract month
    if (invoiceData.mes || invoiceData.month) {
        period.month = parseInt(invoiceData.mes || invoiceData.month);
    }

    // Try to extract year
    if (invoiceData.año || invoiceData.year) {
        period.year = parseInt(invoiceData.año || invoiceData.year);
    }

    // Try to parse from period string (e.g., "2025-01")
    if (invoiceData.periodo || invoiceData.period) {
        const periodStr = String(invoiceData.periodo || invoiceData.period);
        const match = periodStr.match(/(\d{4})-(\d{1,2})/);
        if (match) {
            period.year = parseInt(match[1]);
            period.month = parseInt(match[2]);
        }
    }

    return (period.month || period.year) ? period : null;
};
