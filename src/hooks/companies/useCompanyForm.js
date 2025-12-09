import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { companiesService } from '../../services/companies/companiesService';

/**
 * Custom hook for managing company form (create/edit)
 */
export const useCompanyForm = (onSuccess) => {
    const [openDialog, setOpenDialog] = useState(false);
    const [editingCompany, setEditingCompany] = useState(null);
    const [formData, setFormData] = useState({
        id: null,
        name: '',
        company_id: '',
        industry: '',
        address: '',
        city: '',
        country: 'Colombia',
        phone: '',
        website: '',
        contact_email: '',
        status: 'active',
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const handleOpenDialog = (company = null) => {
        if (company) {
            setEditingCompany(company);
            setFormData({
                id: company.id,
                name: company.name || '',
                company_id: company.company_id || '',
                industry: company.industry || '',
                address: company.address || '',
                city: company.city || '',
                country: company.country || 'Colombia',
                phone: company.phone || '',
                website: company.website || '',
                contact_email: company.contact_email || '',
                status: company.status || 'active',
            });
        } else {
            setEditingCompany(null);
            setFormData({
                id: null,
                name: '',
                company_id: '',
                industry: '',
                address: '',
                city: '',
                country: 'Colombia',
                phone: '',
                website: '',
                contact_email: '',
                status: 'active',
            });
        }
        setOpenDialog(true);
        setError(null);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingCompany(null);
        setFormData({
            id: null,
            name: '',
            company_id: '',
            industry: '',
            address: '',
            city: '',
            country: 'Colombia',
            phone: '',
            website: '',
            contact_email: '',
            status: 'active',
        });
        setError(null);
    };

    const handleFormChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSave = async () => {
        try {
            // Validation
            if (!formData.name || formData.name.trim() === '') {
                setError('El nombre de la empresa es requerido');
                return;
            }

            setSaving(true);
            setError(null);

            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            const savedCompany = await companiesService.saveCompany(
                formData,
                !!editingCompany,
                editingCompany?.id,
                token
            );

            // If creating a new company, switch to edit mode with the new company data
            if (!editingCompany && savedCompany) {
                setEditingCompany(savedCompany);
                setFormData({
                    id: savedCompany.id,
                    name: savedCompany.name || '',
                    company_id: savedCompany.company_id || '',
                    industry: savedCompany.industry || '',
                    address: savedCompany.address || '',
                    city: savedCompany.city || '',
                    country: savedCompany.country || 'Colombia',
                    phone: savedCompany.phone || '',
                    website: savedCompany.website || '',
                    contact_email: savedCompany.contact_email || '',
                    status: savedCompany.status || 'active',
                });
                setError(null);
                // Don't close dialog, allow user to add headquarters
            } else {
                // If editing, close dialog and refresh
                handleCloseDialog();
                if (onSuccess) onSuccess();
            }
        } catch (err) {
            console.error('Error saving company:', err);
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    return {
        openDialog,
        editingCompany,
        formData,
        saving,
        error,
        handleOpenDialog,
        handleCloseDialog,
        handleFormChange,
        handleSave,
    };
};
