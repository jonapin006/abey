# Resumen de Cambios - Plan de Acción

## ✅ Cambios Completados

### 1. Código React Actualizado
**Archivo**: `src/components/DiagnosticResponsesTable.js`

**Cambios realizados**:
- ✅ Agregadas dos nuevas columnas a la tabla:
  - **Estado del Plan de Acción**: Dropdown con 3 opciones (Por hacer, En progreso, Completado)
  - **Plan de Acción**: Link "Ver plan de acción"
  
- ✅ Lógica de actualización:
  - Si existe un `action_plan_id`, actualiza el registro en la tabla `action_plans`
  - Si NO existe, crea un nuevo registro en `action_plans`
  - Muestra "Actualizando..." mientras se guarda
  
- ✅ Lógica del link:
  - Si existe `action_plan_url`, abre el link en nueva pestaña
  - Si NO existe, muestra alerta

---

## 📋 Pasos a Seguir en Supabase

### Paso 1: Crear la tabla `action_plans`

```sql
-- Crear tabla de planes de acción
CREATE TABLE action_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    diagnostic_response_id UUID NOT NULL REFERENCES diagnostic_responses(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'Por hacer',
    plan_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    CONSTRAINT action_plan_status_check 
    CHECK (status IN ('Por hacer', 'En progreso', 'Completado')),
    
    CONSTRAINT unique_diagnostic_response 
    UNIQUE (diagnostic_response_id)
);

CREATE INDEX idx_action_plans_diagnostic_response_id 
ON action_plans(diagnostic_response_id);

CREATE INDEX idx_action_plans_status 
ON action_plans(status);

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

### Paso 2: (Opcional) Poblar con datos iniciales

```sql
INSERT INTO action_plans (diagnostic_response_id, status)
SELECT id, 'Por hacer'
FROM diagnostic_responses
ON CONFLICT (diagnostic_response_id) DO NOTHING;
```

### Paso 3: Actualizar la vista

```sql
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
    ap.id AS action_plan_id
FROM diagnostic_responses dr
JOIN diagnostic_questions dq ON dr.question_id = dq.id
JOIN diagnostic_parts dp ON dq.part_id = dp.id
LEFT JOIN action_plans ap ON dr.id = ap.diagnostic_response_id;
```

### Paso 4: Configurar RLS (Row Level Security)

```sql
ALTER TABLE action_plans ENABLE ROW LEVEL SECURITY;

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
```

---

## 🎯 Cómo Funciona

1. **Usuario cambia el estado** en el dropdown
2. **Frontend verifica** si existe `action_plan_id`:
   - ✅ Si existe → Hace PATCH a `/action_plans?id=eq.{action_plan_id}`
   - ❌ Si NO existe → Hace POST a `/action_plans` para crear uno nuevo
3. **Base de datos** guarda el cambio
4. **Frontend** actualiza la UI

---

## 📊 Estructura de Datos

```
diagnostic_responses (solo respuestas del usuario)
├── id
├── diagnostic_id
├── question_id
├── user_response
└── created_at

action_plans (planes de acción separados)
├── id
├── diagnostic_response_id → FK a diagnostic_responses
├── status (Por hacer | En progreso | Completado)
├── plan_url
├── created_at
└── updated_at
```

---

## ✨ Ventajas del Diseño

✅ **Normalización**: Datos separados por responsabilidad  
✅ **Flexibilidad**: Fácil agregar más campos a `action_plans`  
✅ **Auditoría**: Timestamps automáticos  
✅ **Integridad**: CASCADE elimina planes huérfanos  
✅ **Escalabilidad**: Puede crecer sin afectar `diagnostic_responses`

---

## 📝 Próximos Pasos

1. Ejecutar los 4 pasos SQL en Supabase
2. Verificar que la vista funcione correctamente
3. Probar la funcionalidad en la página de Consultoría
4. (Opcional) Agregar más campos a `action_plans` según necesites
