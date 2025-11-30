# Actualización Base de Datos - Almacenar Plan de Acción

## 📋 Resumen

Agregar campo a la tabla `action_plans` para almacenar el plan de acción generado por N8N.

---

## 🗄️ Cambios en la Base de Datos

### Paso 1: Agregar columna para almacenar el plan generado

Ejecuta este SQL en **Supabase SQL Editor**:

```sql
-- Agregar columna para almacenar el plan de acción generado por N8N
ALTER TABLE action_plans 
ADD COLUMN generated_plan JSONB;

-- Agregar columna para saber cuándo fue generado
ALTER TABLE action_plans 
ADD COLUMN generated_at TIMESTAMP WITH TIME ZONE;

-- Agregar índice para búsquedas más rápidas
CREATE INDEX idx_action_plans_generated_at 
ON action_plans(generated_at) 
WHERE generated_plan IS NOT NULL;
```

### Explicación:
- **`generated_plan`**: Almacena el JSON completo que retorna N8N
- **`generated_at`**: Timestamp de cuándo se generó el plan
- **Índice**: Mejora performance al buscar planes generados

---

## 📊 Estructura Final de `action_plans`

```
action_plans
├── id (UUID, PK)
├── diagnostic_response_id (UUID, FK)
├── status (TEXT) - Por hacer | En progreso | Completado
├── plan_url (TEXT)
├── generated_plan (JSONB) ← NUEVO
├── generated_at (TIMESTAMP) ← NUEVO
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

---

## 🔄 Actualizar la Vista

```sql
-- Actualizar la vista para incluir las nuevas columnas
DROP VIEW IF EXISTS diagnostic_responses_with_questions;

CREATE VIEW diagnostic_responses_with_questions AS
SELECT 
    dr.id,
    dr.diagnostic_id,
    dr.question_id,
    dq.question_text,
    dq.part_id,
    dp.description AS part_description,
    dr.user_response,
    dr.created_at,
    ap.status AS action_plan_status,
    ap.plan_url AS action_plan_url,
    ap.id AS action_plan_id,
    ap.generated_plan,
    ap.generated_at
FROM diagnostic_responses dr
JOIN diagnostic_questions dq ON dr.question_id = dq.id
JOIN diagnostic_parts dp ON dq.part_id = dp.id
LEFT JOIN action_plans ap ON dr.id = ap.diagnostic_response_id;
```

---

## ✅ Verificar los Cambios

```sql
-- Verificar que las columnas se agregaron correctamente
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'action_plans' 
AND column_name IN ('generated_plan', 'generated_at');

-- Probar la vista actualizada
SELECT 
    id,
    question_text,
    action_plan_status,
    generated_plan,
    generated_at
FROM diagnostic_responses_with_questions
LIMIT 5;
```

---

## 🔐 Permisos (RLS)

Las políticas existentes de `action_plans` ya cubrirán estas nuevas columnas automáticamente.

---

## 📝 Notas

1. **JSONB vs JSON**: Usamos JSONB porque es más eficiente para consultas
2. **NULL permitido**: `generated_plan` puede ser NULL si aún no se ha generado
3. **Timestamp**: `generated_at` se actualiza cuando N8N retorna el plan
