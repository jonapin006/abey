# Resumen: Sistema de Generación y Visualización de Planes de Acción

## 🎯 Funcionalidad Implementada

El botón de plan de acción ahora tiene **dos comportamientos**:

### 1. **"Generar plan de acción"** (Primera vez)
- Se muestra cuando NO existe un plan generado
- Al hacer clic:
  1. Llama al webhook de N8N con `question_id`
  2. N8N retorna el plan de acción (JSON)
  3. Se guarda en la base de datos (`action_plans.generated_plan`)
  4. Se muestra en el modal
  5. El botón cambia a "Ver plan de acción"

### 2. **"Ver plan de acción"** (Ya generado)
- Se muestra cuando YA existe un plan generado
- Al hacer clic:
  1. Muestra directamente el plan desde la base de datos
  2. NO llama a N8N (más rápido)
  3. Muestra el plan en el modal

---

## 📊 Cambios en Base de Datos

### Ejecutar en Supabase SQL Editor:

```sql
-- 1. Agregar columnas para almacenar el plan generado
ALTER TABLE action_plans 
ADD COLUMN generated_plan JSONB,
ADD COLUMN generated_at TIMESTAMP WITH TIME ZONE;

-- 2. Agregar índice
CREATE INDEX idx_action_plans_generated_at 
ON action_plans(generated_at) 
WHERE generated_plan IS NOT NULL;

-- 3. Actualizar la vista
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

## 💻 Cambios en el Código

### 1. **Detección automática**
```javascript
// Si ya tiene plan generado
if (item.generated_plan) {
  // Mostrar desde BD
  setActionPlanData(item.generated_plan);
} else {
  // Generar llamando a N8N
  fetchActionPlanFromN8N(item);
}
```

### 2. **Guardar en BD después de generar**
```javascript
// Después de obtener respuesta de N8N
const data = await response.json();
await saveActionPlanToDatabase(item.id, item.action_plan_id, data);
```

### 3. **Botón dinámico**
```javascript
{item.generated_plan ? 'Ver plan de acción' : 'Generar plan de acción'}
```

---

## 🔄 Flujo Completo

### Primera vez (Generar):
```
Usuario → Clic "Generar plan de acción"
       → Frontend llama a N8N con question_id
       → N8N procesa y retorna JSON
       → Frontend guarda en action_plans.generated_plan
       → Muestra en modal
       → Botón cambia a "Ver plan de acción"
```

### Veces siguientes (Ver):
```
Usuario → Clic "Ver plan de acción"
       → Frontend lee action_plans.generated_plan
       → Muestra en modal (instantáneo, sin llamar a N8N)
```

---

## ✅ Ventajas

1. **Performance**: No llama a N8N cada vez
2. **Consistencia**: El plan no cambia una vez generado
3. **Offline**: Funciona aunque N8N esté caído
4. **Historial**: Se mantiene registro de cuándo se generó
5. **UX**: Usuario sabe si ya generó el plan o no

---

## 🧪 Para Probar

1. **Primera vez**: 
   - Haz clic en "Generar plan de acción"
   - Verifica que llama a N8N
   - Verifica que se guarda en BD
   - Verifica que el botón cambia a "Ver"

2. **Segunda vez**:
   - Haz clic en "Ver plan de acción"
   - Verifica que NO llama a N8N
   - Verifica que muestra el mismo plan

3. **En BD**:
   ```sql
   SELECT 
     id,
     diagnostic_response_id,
     generated_plan,
     generated_at
   FROM action_plans
   WHERE generated_plan IS NOT NULL;
   ```

---

## 📝 Próximos Pasos

1. ✅ Ejecutar SQL en Supabase
2. ✅ Código frontend ya está listo
3. ⏳ Hacer `npm run build`
4. ⏳ Probar la funcionalidad
5. ⏳ (Opcional) Agregar botón "Regenerar" si quieres volver a llamar a N8N
