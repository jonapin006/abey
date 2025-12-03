import { useState } from 'react';
import { authService } from '../../services/auth/authService';

export const useSignup = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const handleChange = (prop) => (event) => {
        setFormData({ ...formData, [prop]: event.target.value });
        if (error) setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            setLoading(false);
            return;
        }

        try {
            await authService.signUp(formData.email, formData.password);
            setSuccessMessage('¡Usuario creado con éxito! Por favor revisa tu correo para confirmar tu cuenta.');
            setFormData({ email: '', password: '', confirmPassword: '' });
        } catch (err) {
            console.error('Signup error:', err);
            setError(err.message || 'Error al registrar usuario');
        } finally {
            setLoading(false);
        }
    };

    return {
        formData,
        loading,
        error,
        successMessage,
        handleChange,
        handleSubmit
    };
};
