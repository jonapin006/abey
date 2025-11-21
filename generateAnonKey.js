import jwt from 'jsonwebtoken';

// Usa aquí el mismo secreto que tienes en PGRST_JWT_SECRET
const secret = 'PmJX+7gjVgHtDZmH70CJAKXMvZfk9bCLg8iNvfBDdr0=';

const payload = {
  role: 'anon',
  // Puedes añadir más claims si los usas (ejemplo: sub, exp, iat)
};

const token = jwt.sign(payload, secret, { expiresIn: '30d' });

console.log('Tu clave anon token es:', token);

