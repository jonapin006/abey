-- ============================================
-- AGREGAR MENÚ "EMPRESAS" AL SIDEBAR
-- ============================================
-- Este script agrega el menú "Empresas" y lo asigna solo al super_admin
-- Ejecutar en el SQL Editor de Supabase

-- PASO 1: Insertar el nuevo ítem de menú "Empresas"
-- Se posiciona con order_index = 3 (entre Usuarios y Reportes)
INSERT INTO menu_items (name, path, icon, order_index, is_active)
VALUES ('Empresas', '/companies', 'business', 3, true)
ON CONFLICT DO NOTHING;

-- PASO 2: Actualizar order_index de los menús siguientes para hacer espacio
-- Incrementar en 1 el order_index de Reportes, Consultoría, Indicadores y Tutoriales
UPDATE menu_items 
SET order_index = order_index + 1
WHERE order_index >= 3 
  AND path != '/companies';

-- PASO 3: Asignar permisos al super_admin
-- (Solo usando can_view ya que las otras columnas no existen)
INSERT INTO role_menu_permissions (role_id, menu_id, can_view)
SELECT 
    r.id as role_id,
    m.id as menu_id,
    true as can_view
FROM roles r
CROSS JOIN menu_items m
WHERE r.name = 'super_admin' 
  AND m.path = '/companies'
ON CONFLICT (role_id, menu_id) DO UPDATE
SET can_view = true;

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Ver el nuevo orden de los menús
SELECT id, name, path, icon, order_index, is_active
FROM menu_items 
ORDER BY order_index;

-- Ver los permisos del menú "Empresas"
SELECT 
    mi.name as menu_name,
    mi.path,
    mi.order_index,
    r.name as role_name,
    r.hierarchy_level,
    rmp.can_view
FROM menu_items mi
JOIN role_menu_permissions rmp ON mi.id = rmp.menu_id
JOIN roles r ON rmp.role_id = r.id
WHERE mi.path = '/companies'
ORDER BY r.hierarchy_level;

-- ============================================
-- RESULTADO ESPERADO:
-- ============================================
-- Orden de menús:
-- 1. Inicio
-- 2. Usuarios
-- 3. Empresas (NUEVO)
-- 4. Reportes
-- 5. Consultoría
-- 6. Indicadores
-- 7. Tutoriales
--
-- Permisos:
-- - super_admin: can_view = true
-- - Otros roles: sin acceso
-- ============================================

-- NOTA: Los usuarios deberán cerrar sesión y volver a iniciar
-- para ver el nuevo menú en el sidebar, o limpiar el sessionStorage
-- ejecutando en la consola del navegador: sessionStorage.clear()
