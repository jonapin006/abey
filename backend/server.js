require('dotenv').config({ path: '../.env' });
const express = require('express');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.json());

const supabaseUrl = 'http://localhost:54321';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Debe coincidir con PGRST_JWT_SECRET en postgrest-abey.service
const PGRST_JWT_SECRET = 'PmJX+7gjVgHtDZmH70CJAKXMvZfk9bCLg8iNvfBDdr0=';

// Endpoint para generar token JWT PostgREST con claims role y aud
app.post('/api/postgrest-token', async (req, res) => {
  try {
    // Extraer token Supabase Auth enviado en Authorization header
    const authHeader = req.headers.authorization || '';
    const supabaseToken = authHeader.replace('Bearer ', '');

    if (!supabaseToken) {
      return res.status(401).json({ error: 'Token requerido' });
    }

    // Validar token Supabase y obtener usuario
    const { data, error } = await supabase.auth.getUser(supabaseToken);
    if (error || !data?.user) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    // Generar token JWT para PostgREST con claims necesarias
    const payload = {
      sub: data.user.id,
      role: 'authenticated',
      aud: 'authenticated',
      iss: 'supabase',
    };

    const token = jwt.sign(payload, PGRST_JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend escuchando en puerto ${PORT}`);
});
