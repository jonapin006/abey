# Agregar Campo de Título a Diagnósticos

## 📋 Objetivo

Agregar un campo `title` (título/nombre) a la tabla `environmental_diagnostics` para identificar cada diagnóstico de forma más clara.

---

## 🗄️ Queries SQL

### 1. Agregar columna `title` a la tabla

```sql
-- Agregar columna title (nullable por ahora para no romper datos existentes)
ALTER TABLE environmental_diagnostics
ADD COLUMN title TEXT;
```

### 2. (Opcional) Actualizar diagnósticos existentes con un título por defecto

```sql
-- Opción A: Título basado en la fecha de creación
UPDATE environmental_diagnostics
SET title = 'Diagnóstico ' || TO_CHAR(created_at, 'DD/MM/YYYY')
WHERE title IS NULL;

-- Opción B: Título genérico con número secuencial
UPDATE environmental_diagnostics
SET title = 'Diagnóstico #' || ROW_NUMBER() OVER (ORDER BY created_at)
WHERE title IS NULL;

-- Opción C: Título con fecha y hora
UPDATE environmental_diagnostics
SET title = 'Diagnóstico ' || TO_CHAR(created_at, 'DD/MM/YYYY HH24:MI')
WHERE title IS NULL;
```

### 3. (Opcional) Hacer el campo obligatorio después de actualizar datos existentes

```sql
-- Hacer el campo NOT NULL (solo después de actualizar registros existentes)
ALTER TABLE environmental_diagnostics
ALTER COLUMN title SET NOT NULL;

-- Agregar un valor por defecto para nuevos registros
ALTER TABLE environmental_diagnostics
ALTER COLUMN title SET DEFAULT 'Diagnóstico sin título';
```

### 4. Verificar los cambios

```sql
-- Ver la estructura actualizada de la tabla
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'environmental_diagnostics'
ORDER BY ordinal_position;

-- Ver los títulos de los diagnósticos
SELECT id, title, created_at, user_id
FROM environmental_diagnostics
ORDER BY created_at DESC
LIMIT 10;
```

---

## 🔐 Permisos RLS

Si tienes Row Level Security habilitado, asegúrate de que las políticas permitan leer y escribir el campo `title`:

```sql
-- Las políticas existentes deberían funcionar automáticamente,
-- pero si tienes problemas, verifica:
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename = 'environmental_diagnostics';
```

---

## 📝 Orden de Ejecución Recomendado

1. **Agregar columna** (Query #1)
2. **Actualizar registros existentes** (Query #2 - elige una opción)
3. **Verificar** (Query #4)
4. **(Opcional) Hacer campo obligatorio** (Query #3)

---

## ⚠️ Notas Importantes

- **No ejecutes Query #3** hasta que hayas actualizado todos los registros existentes
- Si tienes muchos diagnósticos, considera usar la **Opción A** de Query #2 (más descriptiva)
- El frontend ya está preparado para mostrar el campo `title` una vez que lo agregues

---

## 🎯 Resultado Esperado

Después de ejecutar estas queries:
- ✅ Tabla `environmental_diagnostics` tendrá columna `title`
- ✅ Diagnósticos existentes tendrán un título automático
- ✅ Nuevos diagnósticos podrán tener un título personalizado
- ✅ El frontend mostrará el título en las cards
