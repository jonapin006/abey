import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage('¡Usuario creado! Revisa tu email para confirmar tu cuenta antes de iniciar sesión.');
    }
  };

  return (
    <div>
      <h2>Crear nuevo usuario</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Correo electrónico:
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </label>
        <br />
        <label>
          Contraseña:
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </label>
        <br />
        <button type="submit">Registrarse</button>
      </form>
      {error && <div style={{color: 'red'}}>Error: {error}</div>}
      {message && <div style={{color: 'green'}}>{message}</div>}
    </div>
  );
}

export default SignupPage;