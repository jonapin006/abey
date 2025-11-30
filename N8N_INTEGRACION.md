# Integración N8N - Plan de Acción

## 📋 Resumen

El modal de "Ver plan de acción" ahora hace una petición GET al webhook de N8N pasando todos los datos de la pregunta y respuesta como parámetros en la URL.

---

## 🔗 URL del Webhook

```
https://n8n.runzippy.com/webhook-test/6bd9eda3-8a6d-4916-bfec-a66fd5276cec
```

---

## 📤 Parámetros que se envían

Cuando el usuario hace clic en "Ver plan de acción", el frontend hace una petición GET con estos parámetros:

| Parámetro | Descripción | Ejemplo |
|-----------|-------------|---------|
| `diagnostic_response_id` | ID de la respuesta del diagnóstico | `5e5a9f5c-1f05-4183-84db-b007a20e237b` |
| `question_id` | ID de la pregunta | `123` |
| `question_text` | Texto de la pregunta | `¿Cuál es tu política ambiental?` |
| `user_response` | Respuesta del usuario | `No tenemos política formal` |
| `diagnostic_id` | ID del diagnóstico completo | `5e5a9f5c-1f05-4183-84db-b007a20e237b` |
| `part_id` | ID de la parte del diagnóstico | `1` |
| `part_description` | Descripción de la parte | `Gestión Ambiental` |

### Ejemplo de URL completa:

```
https://n8n.runzippy.com/webhook-test/6bd9eda3-8a6d-4916-bfec-a66fd5276cec?diagnostic_response_id=abc123&question_id=1&question_text=¿Cuál%20es%20tu%20política%20ambiental?&user_response=No%20tenemos&diagnostic_id=xyz789&part_id=1&part_description=Gestión%20Ambiental
```

---

## ⚙️ Configuración en N8N

### 1. Nodo Webhook (Ya configurado)

Tu webhook ya está configurado como GET. Ahora necesitas acceder a los parámetros.

### 2. Acceder a los parámetros en N8N

En N8N, los parámetros GET se acceden así:

```javascript
// En un nodo de código o función
const questionText = $input.params.query.question_text;
const userResponse = $input.params.query.user_response;
const diagnosticResponseId = $input.params.query.diagnostic_response_id;
```

O usando expresiones en N8N:
```
{{ $json.query.question_text }}
{{ $json.query.user_response }}
{{ $json.query.diagnostic_response_id }}
```

### 3. Ejemplo de Flow N8N

```
┌─────────────┐
│   Webhook   │ (GET)
│   Recibe    │ 
│  parámetros │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Function   │ Procesa los parámetros
│   Node      │ y genera el plan de acción
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Respond    │ Retorna JSON con el plan
│  to Webhook │
└─────────────┘
```

### 4. Ejemplo de Nodo Function en N8N

```javascript
// Obtener parámetros del webhook
const questionText = $input.params.query.question_text;
const userResponse = $input.params.query.user_response;
const partDescription = $input.params.query.part_description;

// Generar plan de acción (ejemplo simple)
const actionPlan = {
  title: `Plan de acción para: ${partDescription}`,
  question: questionText,
  current_situation: userResponse,
  recommendations: [
    "Implementar política ambiental formal",
    "Capacitar al personal",
    "Establecer métricas de seguimiento"
  ],
  priority: "Alta",
  estimated_time: "3 meses",
  resources_needed: [
    "Consultor ambiental",
    "Presupuesto para capacitación"
  ]
};

// Retornar el plan
return {
  json: actionPlan
};
```

### 5. Configurar Respuesta del Webhook

En el nodo "Respond to Webhook":
- **Response Mode**: "Using 'Respond to Webhook' Node"
- **Response Code**: 200
- **Response Headers**: 
  - `Content-Type`: `application/json`
- **Response Body**: El JSON generado por el nodo anterior

---

## 📊 Formato de Respuesta Esperado

El webhook debe retornar un JSON. Puede tener cualquier estructura, por ejemplo:

### Opción 1: Plan de acción estructurado
```json
{
  "title": "Plan de Acción - Gestión Ambiental",
  "current_situation": "No tenemos política formal",
  "recommendations": [
    "Implementar política ambiental formal",
    "Capacitar al personal",
    "Establecer métricas de seguimiento"
  ],
  "priority": "Alta",
  "estimated_time": "3 meses",
  "resources_needed": [
    "Consultor ambiental",
    "Presupuesto para capacitación"
  ]
}
```

### Opción 2: Texto simple
```json
{
  "plan": "Basado en tu respuesta, recomendamos implementar una política ambiental formal..."
}
```

### Opción 3: Con IA (ChatGPT/Claude)
```json
{
  "ai_generated_plan": "Análisis detallado generado por IA...",
  "steps": [
    { "step": 1, "action": "Definir objetivos", "deadline": "1 mes" },
    { "step": 2, "action": "Implementar", "deadline": "2 meses" }
  ]
}
```

---

## 🎯 Flujo Completo

1. **Usuario hace clic** en "Ver plan de acción"
2. **Frontend abre modal** y muestra "Cargando plan de acción..."
3. **Frontend hace GET** al webhook con todos los parámetros
4. **N8N recibe** la petición y procesa los parámetros
5. **N8N genera** el plan de acción (puede usar IA, reglas, etc.)
6. **N8N retorna** JSON con el plan
7. **Frontend muestra** el plan en el modal

---

## 🔧 Próximos Pasos

1. ✅ Código frontend ya está listo
2. ⏳ Configurar el flow en N8N para procesar los parámetros
3. ⏳ Definir la lógica para generar el plan de acción
4. ⏳ Probar la integración

---

## 🧪 Testing

Para probar el webhook manualmente, puedes usar:

### cURL
```bash
curl "https://n8n.runzippy.com/webhook-test/6bd9eda3-8a6d-4916-bfec-a66fd5276cec?question_text=Test&user_response=Respuesta%20de%20prueba"
```

### Navegador
Simplemente pega la URL en el navegador:
```
https://n8n.runzippy.com/webhook-test/6bd9eda3-8a6d-4916-bfec-a66fd5276cec?question_text=Test&user_response=Prueba
```

---

## 📝 Notas Importantes

- Los parámetros en la URL están **URL-encoded** automáticamente
- El webhook debe retornar **JSON válido**
- Si hay error, el modal mostrará el mensaje de error
- El modal muestra el JSON completo que retorna N8N (puedes personalizarlo después)
