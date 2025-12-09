-- ============================================
-- CONFIGURAR PERMISOS PARA LA TABLA USER_PROFILES
-- ============================================
-- Ejecutar en el SQL Editor de Supabase

-- 1. Dar permisos de lectura y escritura a usuarios autenticados
GRANT SELECT, INSERT, UPDATE, DELETE ON user_profiles TO authenticated;

-- 2. Habilitar RLS (Row Level Security) si no está habilitado
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 3. Crear políticas RLS para permitir operaciones CRUD

-- Política para SELECT (lectura)
CREATE POLICY "Allow authenticated users to view user_profiles"
ON user_profiles FOR SELECT
TO authenticated
USING (true);

-- Política para INSERT (crear)
CREATE POLICY "Allow authenticated users to create user_profiles"
ON user_profiles FOR INSERT
TO authenticated
WITH CHECK (true);

-- Política para UPDATE (actualizar)
CREATE POLICY "Allow authenticated users to update user_profiles"
ON user_profiles FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Política para DELETE (eliminar)
CREATE POLICY "Allow authenticated users to delete user_profiles"
ON user_profiles FOR DELETE
TO authenticated
USING (true);

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Ver las políticas creadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'user_profiles';

-- Ver los permisos de la tabla
SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'user_profiles';
