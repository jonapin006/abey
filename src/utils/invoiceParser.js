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
