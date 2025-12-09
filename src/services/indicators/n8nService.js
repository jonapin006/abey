const N8N_BASE_URL = process.env.REACT_APP_N8N_WEBHOOK_URL || 'http://localhost:5678';

/**
 * Service for N8N workflow integrations
 */
export const n8nService = {
    /**
     * Process invoice with AI via N8N
     */
    processInvoiceWithAI: async (fileUrl, metadata) => {
        const webhookUrl = `${N8N_BASE_URL}/webhook/5ef3c9a0-0044-4163-8017-a676402d57ff`;

        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                file_url: fileUrl,
                file_name: metadata.fileName,
                type: metadata.type,
                year: metadata.year,
                headquarters_id: metadata.headquartersId,
                user_id: metadata.userId,
                access_token: `Bearer ${metadata.token}`,
            }),
        });

        if (!response.ok) {
            throw new Error('Error al procesar la factura con N8N');
        }

        let extractedData = await response.json();

        if (Array.isArray(extractedData) && extractedData.length > 0) {
            extractedData = extractedData[0];
        } else if (Array.isArray(extractedData) && extractedData.length === 0) {
            throw new Error('N8N no pudo extraer datos de la factura');
        }

        if (!extractedData || Object.keys(extractedData).length === 0) {
            throw new Error('N8N retornó datos vacíos');
        }

        return extractedData;
    },

    /**
     * Download invoice file via N8N
     */
    downloadInvoiceFile: async (invoiceId, fileUrl, token) => {
        const webhookUrl = `${N8N_BASE_URL}/webhook/download-invoice`;

        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                invoice_id: invoiceId,
                file_url: fileUrl,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error al descargar: ${response.status} - ${errorText || response.statusText}`);
        }

        return await response.blob();
    },

    /**
     * Trigger KPI generation workflow for a specific type
     */
    generateKpis: async (companyId, invoiceType, invoiceData, token) => {
        const webhookUrl = `${N8N_BASE_URL}/webhook/generate-kpis`;

        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                company_id: companyId,
                invoice_type: invoiceType,
                invoices: invoiceData
            }),
        });

        if (!response.ok) {
            throw new Error('Error al iniciar la generación de KPIs');
        }

        return await response.json();
    }
};
