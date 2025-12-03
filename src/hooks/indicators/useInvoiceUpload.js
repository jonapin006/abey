import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { invoiceService } from '../../services/indicators/invoiceService';
import { n8nService } from '../../services/indicators/n8nService';

/**
 * Custom hook for managing invoice upload
 */
export const useInvoiceUpload = (onSuccess) => {
    const [openModal, setOpenModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadForm, setUploadForm] = useState({
        year: new Date().getFullYear(),
        type: '',
        company_id: '',
        headquarters_id: '',
    });

    const handleOpenModal = () => {
        setOpenModal(true);
        setUploadForm({
            year: new Date().getFullYear(),
            type: '',
            company_id: '',
            headquarters_id: '',
        });
        setSelectedFile(null);
        setError(null);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedFile(null);
        setError(null);
    };

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
        setError(null);
    };

    const handleFormChange = (key, value) => {
        setUploadForm(prev => {
            const newForm = { ...prev, [key]: value };

            // Reset headquarters when company changes
            if (key === 'company_id') {
                newForm.headquarters_id = '';
            }

            return newForm;
        });
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError('Por favor, selecciona un archivo primero.');
            return;
        }
        if (!uploadForm.company_id || !uploadForm.headquarters_id || !uploadForm.type || !uploadForm.year) {
            setError('Por favor, completa todos los campos del formulario.');
            return;
        }

        setUploading(true);
        setError(null);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            if (!token) {
                throw new Error('No estás autenticado');
            }

            // 1. Upload file to Storage
            const authenticatedUrl = await invoiceService.uploadInvoiceFile(
                selectedFile,
                session.user.id
            );

            // 2. Process with N8N
            const extractedData = await n8nService.processInvoiceWithAI(
                authenticatedUrl,
                {
                    fileName: selectedFile.name,
                    type: uploadForm.type,
                    year: uploadForm.year,
                    headquartersId: uploadForm.headquarters_id,
                    userId: session.user.id,
                    token,
                }
            );

            // 3. Save to Database
            const invoiceData = {
                user_id: session.user.id,
                file_url: authenticatedUrl,
                file_name: selectedFile.name,
                type: uploadForm.type,
                year: uploadForm.year,
                headquarters_id: uploadForm.headquarters_id,
                status: 'Procesado',
                data: extractedData,
            };

            await invoiceService.saveInvoiceToDatabase(invoiceData, token);

            handleCloseModal();
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error('Error uploading invoice:', err);
            setError(err.message || 'Error al subir la factura');
        } finally {
            setUploading(false);
        }
    };

    return {
        openModal,
        uploading,
        error,
        selectedFile,
        uploadForm,
        handleOpenModal,
        handleCloseModal,
        handleFileChange,
        handleFormChange,
        handleUpload,
    };
};
