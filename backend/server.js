require('dotenv').config({ path: '/var/www/abey/build/.env' });
const express = require('express');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.json());

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('ERROR: REACT_APP_SUPABASE_ANON_KEY is not defined in environment variables');
  console.error('Loaded env vars:', Object.keys(process.env).filter(k => k.startsWith('REACT_APP')));
  process.exit(1);
}

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

// Endpoint para crear usuario en Supabase Auth y perfil
app.post('/api/create-user', async (req, res) => {
  try {
    // Extraer token Supabase Auth para validar permisos
    const authHeader = req.headers.authorization || '';
    const supabaseToken = authHeader.replace('Bearer ', '');

    if (!supabaseToken) {
      return res.status(401).json({ error: 'Token requerido' });
    }

    // Validar que el usuario esté autenticado
    const { data: authData, error: authError } = await supabase.auth.getUser(supabaseToken);
    if (authError || !authData?.user) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const { email, password, full_name, role_id, company_id } = req.body;

    // Validaciones
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // Crear usuario en Supabase Auth usando Admin API
    const supabaseAdmin = createClient(
      supabaseUrl, // URL pública para Auth
      process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Cliente para PostgREST local (para crear perfil)
    const supabaseDB = createClient(
      'http://localhost:3001', // PostgREST local en puerto 3001
      process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        db: {
          schema: 'public'
        }
      }
    );

    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirmar email
      user_metadata: {
        full_name,
      }
    });

    if (createError) {
      console.error('Error creating auth user:', createError);
      console.error('Error message type:', typeof createError.message);
      console.error('Error message content:', createError.message);

      // Mejorar mensaje de error para email duplicado
      // Normalizamos el mensaje a minúsculas para la comparación
      const errorMsg = (createError.message || JSON.stringify(createError)).toLowerCase();

      if (errorMsg.includes('already registered') ||
        errorMsg.includes('already been registered') ||
        errorMsg.includes('duplicate key')) {
        return res.status(400).json({
          error: `El email ${email} ya está registrado. Por favor usa otro email.`
        });
      }

      return res.status(400).json({ error: `Error al crear usuario: ${createError.message}` });
    }

    // Actualizar perfil de usuario en user_profiles (el trigger ya lo creó)
    console.log('Updating profile with data:', {
      user_id: newUser.user.id,
      full_name,
      role_id,
      company_id,
    });

    try {
      const profileResponse = await fetch(`http://localhost:3001/user_profiles?user_id=eq.${newUser.user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseKey}`,
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          full_name,
          role_id,
          company_id,
        }),
      });

      console.log('Profile response status:', profileResponse.status);

      if (!profileResponse.ok) {
        const errorText = await profileResponse.text();
        console.error('Profile update failed:', errorText);

        // Intentar parsear el error para dar un mensaje más claro
        let errorMessage = 'Error al actualizar el perfil del usuario';
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.message) {
            errorMessage = errorJson.message;
          }
        } catch (e) {
          errorMessage = errorText;
        }

        // Eliminar el usuario de Auth si falla la actualización del perfil
        await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
        return res.status(400).json({
          error: `Error al crear perfil: ${errorMessage}`
        });
      }

      const profile = await profileResponse.json();
      console.log('Profile created successfully:', profile);

      res.json({
        success: true,
        user: {
          id: newUser.user.id,
          email: newUser.user.email,
          profile: Array.isArray(profile) ? profile[0] : profile,
        }
      });
    } catch (profileError) {
      console.error('Error creating user profile:', profileError);
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
      return res.status(400).json({
        error: `Error al crear perfil: ${profileError.message}`
      });
    }
  } catch (err) {
    console.error('Error in create-user:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Endpoint para eliminar usuario de Supabase Auth y perfil
app.delete('/api/delete-user/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    // Extraer token Supabase Auth para validar permisos
    const authHeader = req.headers.authorization || '';
    const supabaseToken = authHeader.replace('Bearer ', '');

    if (!supabaseToken) {
      return res.status(401).json({ error: 'Token requerido' });
    }

    // Validar que el usuario esté autenticado
    const { data: authData, error: authError } = await supabase.auth.getUser(supabaseToken);
    if (authError || !authData?.user) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    // Crear cliente admin
    const supabaseAdmin = createClient(
      supabaseUrl,
      process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    console.log(`Deleting user ${userId}...`);

    // Eliminar usuario de Supabase Auth
    const { data, error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) {
      console.error('Error deleting auth user:', error);
      return res.status(400).json({ error: `Error al eliminar usuario: ${error.message}` });
    }

    // También intentamos eliminar el perfil explícitamente por si acaso no hay cascada
    try {
      await fetch(`http://localhost:3001/user_profiles?user_id=eq.${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseKey}`,
        }
      });
    } catch (e) {
      console.warn('Error deleting profile (might have been deleted by cascade):', e);
    }

    console.log(`User ${userId} deleted successfully`);
    res.json({ success: true });

  } catch (err) {
    console.error('Error in delete-user:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend escuchando en puerto ${PORT}`);
});
