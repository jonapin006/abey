/**
 * Invoice Upload Service
 * Handles file validation, processing, and upload orchestration
 * Separates upload logic from UI components
 */

import { invoiceService } from './invoiceService';
import { validateInvoiceData } from './invoiceBusinessService';

/**
 * Allowed file types for invoice uploads
 */
const ALLOWED_FILE_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png'
];

/**
 * Maximum file size in bytes (10MB)
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Validate invoice file
 * @param {File} file - File to validate
 * @returns {Object} { isValid: boolean, error: string | null }
 */
export const validateInvoiceFile = (file) => {
    if (!file) {
        return {
            isValid: false,
            error: 'No se ha seleccionado ningún archivo'
        };
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        return {
            isValid: false,
            error: 'Tipo de archivo no permitido. Solo se permiten PDF, JPG y PNG'
        };
    }

    if (file.size > MAX_FILE_SIZE) {
        return {
            isValid: false,
            error: `El archivo es demasiado grande. Tamaño máximo: ${MAX_FILE_SIZE / (1024 * 1024)}MB`
        };
    }

    return {
        isValid: true,
        error: null
    };
};

/**
 * Upload invoice file and save data to database
 * Orchestrates the entire upload process
 * @param {File} file - File to upload
 * @param {Object} invoiceData - Invoice metadata
 * @param {string} userId - User ID
 * @param {string} token - Auth token
 * @returns {Promise<Object>} Uploaded invoice data
 */
export const uploadAndSaveInvoice = async (file, invoiceData, userId, token) => {
    // Step 1: Validate file
    const fileValidation = validateInvoiceFile(file);
    if (!fileValidation.isValid) {
        throw new Error(fileValidation.error);
    }

    // Step 2: Validate invoice data
    const dataValidation = validateInvoiceData(invoiceData);
    if (!dataValidation.isValid) {
        throw new Error(dataValidation.errors.join(', '));
    }

    // Step 3: Upload file to storage
    const fileUrl = await invoiceService.uploadInvoiceFile(file, userId);

    // Step 4: Prepare complete invoice data
    const completeInvoiceData = {
        ...invoiceData,
        file_url: fileUrl,
        file_name: file.name,
        user_id: userId,
        status: 'uploaded',
        created_at: new Date().toISOString()
    };

    // Step 5: Save to database
    const savedInvoice = await invoiceService.saveInvoiceToDatabase(completeInvoiceData, token);

    return savedInvoice;
};

/**
 * Extract basic invoice information from filename
 * @param {string} filename - Invoice filename
 * @returns {Object} Extracted information
 */
export const extractInfoFromFilename = (filename) => {
    const info = {
        type: null,
        month: null,
        year: null
    };

    const lowerFilename = filename.toLowerCase();

    // Try to extract type
    if (lowerFilename.includes('enel') || lowerFilename.includes('energia') || lowerFilename.includes('energy')) {
        info.type = 'Energía';
    } else if (lowerFilename.includes('agua') || lowerFilename.includes('water') || lowerFilename.includes('acueducto')) {
        info.type = 'Agua';
    } else if (lowerFilename.includes('acta') || lowerFilename.includes('minutes')) {
        info.type = 'Actas';
    }

    // Try to extract month (Spanish month names)
    const months = {
        'enero': 1, 'febrero': 2, 'marzo': 3, 'abril': 4,
        'mayo': 5, 'junio': 6, 'julio': 7, 'agosto': 8,
        'septiembre': 9, 'octubre': 10, 'noviembre': 11, 'diciembre': 12
    };

    for (const [monthName, monthNum] of Object.entries(months)) {
        if (lowerFilename.includes(monthName)) {
            info.month = monthNum;
            break;
        }
    }

    // Try to extract year (4-digit number)
    const yearMatch = filename.match(/20\d{2}/);
    if (yearMatch) {
        info.year = parseInt(yearMatch[0]);
    }

    return info;
};

/**
 * Generate suggested filename for invoice
 * @param {Object} invoiceData - Invoice data
 * @returns {string} Suggested filename
 */
export const generateSuggestedFilename = (invoiceData) => {
    const parts = [];

    if (invoiceData.type) {
        parts.push(invoiceData.type);
    }

    if (invoiceData.year) {
        parts.push(invoiceData.year);
    }

    if (invoiceData.month) {
        const monthNames = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        parts.push(monthNames[invoiceData.month - 1]);
    }

    return parts.join('_') + '.pdf';
};

/**
 * Check if file is a PDF
 * @param {File} file - File to check
 * @returns {boolean} True if PDF
 */
export const isPDF = (file) => {
    return file && file.type === 'application/pdf';
};

/**
 * Check if file is an image
 * @param {File} file - File to check
 * @returns {boolean} True if image
 */
export const isImage = (file) => {
    return file && (
        file.type === 'image/jpeg' ||
        file.type === 'image/jpg' ||
        file.type === 'image/png'
    );
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted size
 */
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};
