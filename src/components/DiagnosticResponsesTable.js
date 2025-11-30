import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  Box,
  Typography,
  FormControl,
} from '@mui/material';
import { supabase } from '../lib/supabaseClient';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

async function fetchDiagnosticResponses(diagnosticId) {
  if (!diagnosticId || typeof diagnosticId !== 'string') {
    throw new Error('Diagnostic ID inválido');
  }

  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  // Construir URL correctamente sin codificar toda la query string
  const url = `${API_URL}/diagnostic_responses_with_questions?diagnostic_id=eq.${diagnosticId}&order=question_id.asc`;

  console.log('🔍 Fetching diagnostic responses for ID:', diagnosticId);
  console.log('📡 URL:', url);

  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  const text = await response.text();

  if (!response.ok) {
    console.error('Error en API:', text);
    throw new Error(`Error HTTP ${response.status}: ${response.statusText} - ${text}`);
  }

  try {
    console.log('Respuesta raw:', text);
    return JSON.parse(text);
  } catch (err) {
    console.error('Respuesta no es JSON válido:', text);
    throw new Error('Error al parsear JSON desde la API');
  }
}

function DiagnosticResponsesTable({ diagnosticId }) {
  const navigate = useNavigate();
  const [responses, setResponses] = useState([]);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState({});

  useEffect(() => {
    if (!diagnosticId) {
      setError('Diagnostic ID no proporcionado');
      setResponses([]);
      return;
    }

    fetchDiagnosticResponses(diagnosticId)
      .then(data => {
        // Ordenar por part_id y luego por question_id
        const sortedData = data.sort((a, b) => {
          if (a.part_id !== b.part_id) {
            return a.part_id - b.part_id;
          }
          return a.question_id - b.question_id;
        });

        setResponses(sortedData);
      })
      .catch(err => setError(err.message));
  }, [diagnosticId]);

  const updateActionPlanStatus = async (itemId, actionPlanId, newStatus) => {
    setUpdating(prev => ({ ...prev, [itemId]: true }));

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (actionPlanId) {
        const response = await fetch(`${API_URL}/action_plans?id=eq.${actionPlanId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            status: newStatus
          })
        });

        if (!response.ok) {
          throw new Error(`Error al actualizar: ${response.statusText}`);
        }
      } else {
        const response = await fetch(`${API_URL}/action_plans`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            diagnostic_response_id: itemId,
            status: newStatus
          })
        });

        if (!response.ok) {
          throw new Error(`Error al crear plan de acción: ${response.statusText}`);
        }

        const newActionPlan = await response.json();

        setResponses(prev => prev.map(item =>
          item.id === itemId
            ? { ...item, action_plan_status: newStatus, action_plan_id: newActionPlan[0].id }
            : item
        ));
        return;
      }

      setResponses(prev => prev.map(item =>
        item.id === itemId
          ? { ...item, action_plan_status: newStatus }
          : item
      ));
    } catch (err) {
      console.error('Error actualizando estado:', err);
      setError(err.message);
    } finally {
      setUpdating(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const handleStatusChange = (itemId, actionPlanId, newStatus) => {
    updateActionPlanStatus(itemId, actionPlanId, newStatus);
  };

  const handleViewActionPlan = (item) => {
    navigate(`/action-plan/${diagnosticId}/${item.id}`);
  };

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Error: {error}
      </Alert>
    );
  }

  if (responses.length === 0) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        No hay respuestas para mostrar.
      </Alert>
    );
  }

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Parte</TableCell>
              <TableCell>Pregunta</TableCell>
              <TableCell>Respuesta</TableCell>
              <TableCell>Estado del Plan de Acción</TableCell>
              <TableCell>Plan de Acción</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {responses.map((item, i) => (
              <TableRow key={item.id} hover>
                <TableCell>{i + 1}</TableCell>
                <TableCell>{item.part_description}</TableCell>
                <TableCell>{item.question_text}</TableCell>
                <TableCell>{item.user_response}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                      <Select
                        value={item.action_plan_status || 'Por hacer'}
                        onChange={(e) => handleStatusChange(item.id, item.action_plan_id, e.target.value)}
                        disabled={updating[item.id]}
                      >
                        <MenuItem value="Por hacer">Por hacer</MenuItem>
                        <MenuItem value="En progreso">En progreso</MenuItem>
                        <MenuItem value="Completado">Completado</MenuItem>
                      </Select>
                    </FormControl>
                    {updating[item.id] && <CircularProgress size={20} />}
                  </Box>
                </TableCell>
                <TableCell>
                  <Button
                    variant={item.generated_plan ? "outlined" : "contained"}
                    size="small"
                    onClick={() => handleViewActionPlan(item)}
                  >
                    {item.generated_plan ? 'Ver plan de acción' : 'Generar plan de acción'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

export default DiagnosticResponsesTable;
