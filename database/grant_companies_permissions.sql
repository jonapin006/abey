-- ============================================
-- CONFIGURAR PERMISOS PARA LAS TABLAS COMPANIES Y HEADQUARTERS
-- ============================================
-- Ejecutar en el SQL Editor de Supabase

-- ============================================
-- TABLA: COMPANIES
-- ============================================

-- 1. Dar permisos de lectura y escritura a usuarios autenticados
GRANT SELECT, INSERT, UPDATE, DELETE ON companies TO authenticated;

-- 2. Habilitar RLS (Row Level Security) si no está habilitado
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- 3. Crear políticas RLS para permitir operaciones CRUD

-- Política para SELECT (lectura)
CREATE POLICY "Allow authenticated users to view companies"
ON companies FOR SELECT
TO authenticated
USING (true);

-- Política para INSERT (crear)
CREATE POLICY "Allow authenticated users to create companies"
ON companies FOR INSERT
TO authenticated
WITH CHECK (true);

-- Política para UPDATE (actualizar)
CREATE POLICY "Allow authenticated users to update companies"
ON companies FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Política para DELETE (eliminar)
CREATE POLICY "Allow authenticated users to delete companies"
ON companies FOR DELETE
TO authenticated
USING (true);

-- ============================================
-- TABLA: HEADQUARTERS
-- ============================================

-- 1. Dar permisos de lectura y escritura a usuarios autenticados
GRANT SELECT, INSERT, UPDATE, DELETE ON headquarters TO authenticated;

-- 2. Habilitar RLS (Row Level Security) si no está habilitado
ALTER TABLE headquarters ENABLE ROW LEVEL SECURITY;

-- 3. Crear políticas RLS para permitir operaciones CRUD

-- Política para SELECT (lectura)
CREATE POLICY "Allow authenticated users to view headquarters"
ON headquarters FOR SELECT
TO authenticated
USING (true);

-- Política para INSERT (crear)
CREATE POLICY "Allow authenticated users to create headquarters"
ON headquarters FOR INSERT
TO authenticated
WITH CHECK (true);

-- Política para UPDATE (actualizar)
CREATE POLICY "Allow authenticated users to update headquarters"
ON headquarters FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Política para DELETE (eliminar)
CREATE POLICY "Allow authenticated users to delete headquarters"
ON headquarters FOR DELETE
TO authenticated
USING (true);

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Ver las políticas creadas para companies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'companies';

-- Ver las políticas creadas para headquarters
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'headquarters';

-- Ver los permisos de la tabla companies
SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'companies';

-- Ver los permisos de la tabla headquarters
SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'headquarters';
