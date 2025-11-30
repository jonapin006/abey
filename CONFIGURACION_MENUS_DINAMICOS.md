# Configuración de Permisos de Menú Dinámico

## 📋 Objetivo

Configurar el sistema de menús dinámicos basado en roles de usuario, permitiendo que cada usuario vea solo los menús a los que tiene permiso.

---

## 🗄️ Queries SQL

### 1. Verificar que las tablas existen

```sql
-- Verificar tabla menu_items
SELECT * FROM menu_items ORDER BY order_index;

-- Verificar tabla role_menu_permissions
SELECT * FROM role_menu_permissions LIMIT 10;
```

### 2. Dar permisos de lectura a las tablas

```sql
-- Permisos para menu_items
GRANT SELECT ON menu_items TO anon, authenticated;

-- Permisos para role_menu_permissions
GRANT SELECT ON role_menu_permissions TO anon, authenticated;
```

### 3. Habilitar RLS (Row Level Security)

```sql
-- Habilitar RLS en menu_items
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS en role_menu_permissions
ALTER TABLE role_menu_permissions ENABLE ROW LEVEL SECURITY;
```

### 4. Crear políticas RLS para menu_items

```sql
-- Política para que todos puedan ver menús activos
CREATE POLICY "Anyone can view active menu items"
ON menu_items FOR SELECT
TO authenticated
USING (is_active = true);
```

### 5. Crear políticas RLS para role_menu_permissions

```sql
-- Política para que usuarios vean solo los permisos de su rol
CREATE POLICY "Users can view their role menu permissions"
ON role_menu_permissions FOR SELECT
TO authenticated
USING (
  role_id IN (
    SELECT (auth.jwt() -> 'user_metadata' ->> 'role_id')::uuid
  )
);
```

### 6. Crear vista para simplificar consultas (Opcional)

```sql
-- Vista que combina menús con permisos
CREATE OR REPLACE VIEW user_accessible_menus AS
SELECT 
  mi.id,
  mi.name,
  mi.path,
  mi.icon,
  mi.parent_id,
  mi.order_index,
  mi.is_active,
  rmp.role_id,
  rmp.can_view
FROM menu_items mi
JOIN role_menu_permissions rmp ON mi.id = rmp.menu_id
WHERE mi.is_active = true
  AND rmp.can_view = true;

-- Dar permisos a la vista
GRANT SELECT ON user_accessible_menus TO authenticated;

-- Política RLS para la vista
CREATE POLICY "Users can view their accessible menus"
ON user_accessible_menus FOR SELECT
TO authenticated
USING (
  role_id IN (
    SELECT (auth.jwt() -> 'user_metadata' ->> 'role_id')::uuid
  )
);
```

---

## 🔧 Configuración del Usuario

### Asignar rol a un usuario

Para que el sistema funcione, cada usuario debe tener un `role_id` en sus metadatos:

```sql
-- Opción 1: Actualizar metadatos de usuario existente (desde Supabase Dashboard)
-- Ve a Authentication > Users > Click en el usuario > User Metadata
-- Agrega: { "role_id": "UUID_DEL_ROL" }

-- Opción 2: Actualizar via SQL (requiere permisos de admin)
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role_id": "UUID_DEL_ROL"}'::jsonb
WHERE email = 'usuario@ejemplo.com';
```

---

## 📝 Ejemplo de Configuración Completa

### Paso 1: Crear un rol

```sql
-- Insertar en tu tabla de roles (ajusta según tu esquema)
INSERT INTO roles (id, name, description)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'Admin', 'Administrador con acceso completo'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Usuario', 'Usuario estándar');
```

### Paso 2: Asignar permisos de menú al rol

```sql
-- Admin tiene acceso a todos los menús
INSERT INTO role_menu_permissions (role_id, menu_id, can_view)
SELECT 
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  id,
  true
FROM menu_items;

-- Usuario estándar solo tiene acceso a algunos menús
INSERT INTO role_menu_permissions (role_id, menu_id, can_view)
SELECT 
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  id,
  true
FROM menu_items
WHERE name IN ('Inicio', 'Consultoría', 'Tutoriales');
```

### Paso 3: Asignar rol al usuario

```sql
-- Actualizar metadatos del usuario
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role_id": "550e8400-e29b-41d4-a716-446655440001"}'::jsonb
WHERE email = 'usuario@ejemplo.com';
```

---

## 🧪 Verificación

### Verificar permisos de un usuario

```sql
-- Ver menús accesibles para un rol específico
SELECT 
  mi.name,
  mi.path,
  mi.icon,
  mi.order_index
FROM menu_items mi
JOIN role_menu_permissions rmp ON mi.id = rmp.menu_id
WHERE rmp.role_id = 'UUID_DEL_ROL'
  AND rmp.can_view = true
  AND mi.is_active = true
ORDER BY mi.order_index;
```

### Verificar metadatos de usuario

```sql
-- Ver role_id de un usuario
SELECT 
  email,
  raw_user_meta_data->>'role_id' as role_id
FROM auth.users
WHERE email = 'usuario@ejemplo.com';
```

---

## ⚠️ Notas Importantes

1. **role_id en metadatos**: El sistema espera que el `role_id` esté en `user_metadata` del usuario de Supabase
2. **Actualizar sesión**: Después de cambiar metadatos, el usuario debe cerrar sesión y volver a iniciar
3. **Fallback**: Si un usuario no tiene rol asignado, no verá ningún menú (el sidebar estará vacío)
4. **Iconos**: Los iconos en la tabla `menu_items` deben coincidir con los del `iconMap` en el código

---

## 🎯 Resultado Esperado

Después de ejecutar estas queries:
- ✅ Usuarios solo ven menús permitidos según su rol
- ✅ Menús se cargan dinámicamente desde la base de datos
- ✅ Cambios en permisos se reflejan inmediatamente (después de recargar)
- ✅ Sistema escalable para agregar nuevos menús y roles
