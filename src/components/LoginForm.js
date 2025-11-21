import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <form className="login-visual-form" onSubmit={handleSubmit} autoComplete="on">
      {error && <div className="login-error">{error}</div>}
      <div className="form-group">
        <label htmlFor="email">Usuario</label>
        <input
          type="email"
          id="email"
          placeholder="pedro.perez@mymail.com"
          autoComplete="username"
          value={email}
          disabled={loading}
          required
          onChange={e => setEmail(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label htmlFor="password">Contraseña</label>
        <div className="password-box">
          <input
            type="password"
            id="password"
            placeholder="•••••"
            autoComplete="current-password"
            value={password}
            disabled={loading}
            required
            onChange={e => setPassword(e.target.value)}
          />
          {/* El ícono de "eye" puede colocarse aquí opcionalmente */}
        </div>
      </div>
      <button className="btn-login-main" type="submit" disabled={loading}>
        {loading ? 'Cargando...' : 'Entrar'}
      </button>
    </form>
  );
}

export default LoginForm;
