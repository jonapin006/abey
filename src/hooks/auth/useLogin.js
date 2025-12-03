import { useState } from 'react';
import { authService } from '../../services/auth/authService';

export const useLogin = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (prop) => (event) => {
        setFormData({ ...formData, [prop]: event.target.value });
        if (error) setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await authService.signIn(formData.email, formData.password);
            // Navigation is usually handled by a listener in App.js or AuthContext, 
            // but if we needed to redirect here we could accept a navigate callback
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return {
        formData,
        loading,
        error,
        handleChange,
        handleSubmit
    };
};
