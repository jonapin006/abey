import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { usersService } from '../../services/users/usersService';

/**
 * Custom hook for managing user form (create/edit)
 */
export const useUserForm = (onSuccess) => {
    const [openDialog, setOpenDialog] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        full_name: '',
        role_id: '',
        company_id: '',
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const handleOpenDialog = (user = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                email: user.email || '',
                password: '',
                full_name: user.full_name || '',
                role_id: user.role_id || '',
                company_id: user.company_id || '',
            });
        } else {
            setEditingUser(null);
            setFormData({
                email: '',
                password: '',
                full_name: '',
                role_id: '',
                company_id: '',
            });
        }
        setOpenDialog(true);
        setError(null);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingUser(null);
        setFormData({
            email: '',
            password: '',
            full_name: '',
            role_id: '',
            company_id: '',
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
            setSaving(true);
            setError(null);

            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            await usersService.saveUser(
                formData,
                !!editingUser,
                editingUser?.user_id,
                token
            );

            handleCloseDialog();
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error('Error saving user:', err);
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    return {
        openDialog,
        editingUser,
        formData,
        saving,
        error,
        handleOpenDialog,
        handleCloseDialog,
        handleFormChange,
        handleSave,
    };
};
