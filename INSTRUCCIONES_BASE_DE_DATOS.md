# Instrucciones para Actualizar la Base de Datos

## Resumen
Este documento contiene las instrucciones SQL necesarias para crear una tabla separada de **Planes de Acción** que se relaciona con las respuestas del diagnóstico.

---

## Paso 1: Crear la Tabla `action_plans`

Ejecuta el siguiente SQL en **Supabase SQL Editor**:

```sql
-- Crear tabla de planes de acción
CREATE TABLE action_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    diagnostic_response_id UUID NOT NULL REFERENCES diagnostic_responses(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'Por hacer',
    plan_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Constraint para validar solo los 3 valores permitidos
    CONSTRAINT action_plan_status_check 
    CHECK (status IN ('Por hacer', 'En progreso', 'Completado')),
    
    -- Asegurar que solo haya un plan de acción por respuesta
    CONSTRAINT unique_diagnostic_response 
    UNIQUE (diagnostic_response_id)
);

-- Índices para mejorar performance
CREATE INDEX idx_action_plans_diagnostic_response_id 
ON action_plans(diagnostic_response_id);

CREATE INDEX idx_action_plans_status 
ON action_plans(status);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_action_plans_updated_at 
    BEFORE UPDATE ON action_plans 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

### Explicación:
- **`action_plans`**: Nueva tabla separada para gestionar los planes de acción
- **`diagnostic_response_id`**: Relación con la respuesta del diagnóstico (FK con CASCADE)
- **`status`**: Estado del plan de acción (Por hacer, En progreso, Completado)
- **`plan_url`**: URL o referencia al plan de acción
- **`UNIQUE constraint`**: Asegura que cada respuesta tenga máximo un plan de acción
- **Trigger**: Actualiza automáticamente `updated_at` cuando se modifica un registro

---

## Paso 2: Poblar la Tabla con Datos Iniciales (Opcional)

Si quieres crear planes de acción para todas las respuestas existentes:

```sql
-- Crear un plan de acción "Por hacer" para cada respuesta existente
INSERT INTO action_plans (diagnostic_response_id, status)
SELECT id, 'Por hacer'
FROM diagnostic_responses
ON CONFLICT (diagnostic_response_id) DO NOTHING;
```

---

## Paso 3: Actualizar la Vista `diagnostic_responses_with_questions`

```sql
-- Eliminar la vista existente
DROP VIEW IF EXISTS diagnostic_responses_with_questions;

-- Recrear la vista con LEFT JOIN a action_plans
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
    ap.id AS action_plan_id
FROM diagnostic_responses dr
JOIN diagnostic_questions dq ON dr.question_id = dq.id
JOIN diagnostic_parts dp ON dq.part_id = dp.id
LEFT JOIN action_plans ap ON dr.id = ap.diagnostic_response_id;
```

### Explicación:
- **LEFT JOIN**: Permite que las respuestas sin plan de acción también aparezcan
- **action_plan_id**: Incluimos el ID del plan de acción para futuras actualizaciones
- Si no existe plan de acción, los campos serán NULL

---

## Paso 4: Verificar los Cambios

Ejecuta esta consulta para verificar que todo funcione correctamente:

```sql
SELECT 
    id,
    question_text,
    user_response,
    action_plan_status,
    action_plan_url,
    action_plan_id
FROM diagnostic_responses_with_questions
LIMIT 5;
```

---

## Paso 5: Configurar Permisos (RLS - Row Level Security)

Si tienes Row Level Security habilitado, configura las políticas para `action_plans`:

```sql
-- Habilitar RLS en la tabla
ALTER TABLE action_plans ENABLE ROW LEVEL SECURITY;

-- Política de lectura (ajusta según tus necesidades)
CREATE POLICY "Users can view action plans for their company's diagnostics"
ON action_plans FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM diagnostic_responses dr
        JOIN environmental_diagnostics ed ON dr.diagnostic_id = ed.id
        WHERE dr.id = action_plans.diagnostic_response_id
        AND ed.user_id = auth.uid()
    )
);

-- Política de inserción
CREATE POLICY "Users can create action plans for their diagnostics"
ON action_plans FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM diagnostic_responses dr
        JOIN environmental_diagnostics ed ON dr.diagnostic_id = ed.id
        WHERE dr.id = diagnostic_response_id
        AND ed.user_id = auth.uid()
    )
);

-- Política de actualización
CREATE POLICY "Users can update action plans for their diagnostics"
ON action_plans FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM diagnostic_responses dr
        JOIN environmental_diagnostics ed ON dr.diagnostic_id = ed.id
        WHERE dr.id = action_plans.diagnostic_response_id
        AND ed.user_id = auth.uid()
    )
);

-- Política de eliminación
CREATE POLICY "Users can delete action plans for their diagnostics"
ON action_plans FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM diagnostic_responses dr
        JOIN environmental_diagnostics ed ON dr.diagnostic_id = ed.id
        WHERE dr.id = action_plans.diagnostic_response_id
        AND ed.user_id = auth.uid()
    )
);
```

---

## Ventajas de este Diseño

✅ **Separación de responsabilidades**: `diagnostic_responses` solo contiene respuestas del usuario  
✅ **Normalización**: Los planes de acción están en su propia tabla  
✅ **Flexibilidad**: Puedes agregar más campos al plan de acción sin afectar las respuestas  
✅ **Auditoría**: Tienes `created_at` y `updated_at` para rastrear cambios  
✅ **Integridad**: El CASCADE asegura que si se elimina una respuesta, se elimina su plan  

---

## Estructura Final de Tablas

```
diagnostic_responses
├── id (PK)
├── diagnostic_id
├── question_id
├── user_response
└── created_at

action_plans
├── id (PK)
├── diagnostic_response_id (FK → diagnostic_responses.id)
├── status
├── plan_url
├── created_at
└── updated_at
```

---

## Notas Importantes

1. **Backup**: Antes de ejecutar estos comandos, considera hacer un backup de tu base de datos
2. **Orden de ejecución**: Ejecuta los pasos en orden (1 → 2 → 3 → 4 → 5)
3. **Permisos API**: Asegúrate de que tu API de Supabase tenga permisos para hacer operaciones en `action_plans`
4. **Código Frontend**: Necesitarás actualizar el código React para usar la nueva tabla (siguiente paso)
