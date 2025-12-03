import React from 'react';
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
  FormControl,
} from '@mui/material';

function DiagnosticResponsesTable({ responses, loading, error, updating, onStatusChange, diagnosticId }) {
  const navigate = useNavigate();

  const handleViewActionPlan = (item) => {
    navigate(`/action-plan/${diagnosticId}/${item.id}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

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
                      onChange={(e) => onStatusChange(item.id, item.action_plan_id, e.target.value)}
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
  );
}

export default DiagnosticResponsesTable;
