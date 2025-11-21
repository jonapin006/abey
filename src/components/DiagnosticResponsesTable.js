import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

async function fetchDiagnosticResponses(diagnosticId) {
  if (!diagnosticId || typeof diagnosticId !== 'string') {
    throw new Error('Diagnostic ID inválido');
  }

  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const url = `${API_URL}/diagnostic_responses_with_questions?${encodeURIComponent(`diagnostic_id=eq.${diagnosticId}`)}&${encodeURIComponent('order=question_id.asc')}`;

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
  const [responses, setResponses] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!diagnosticId) {
      setError('Diagnostic ID no proporcionado');
      setResponses([]);
      return;
    }

    fetchDiagnosticResponses(diagnosticId)
      .then(setResponses)
      .catch(err => setError(err.message));
  }, [diagnosticId]);

  if (error) return <div>Error: {error}</div>;

  if (responses.length === 0) return <div>No hay respuestas para mostrar.</div>;

  return (
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Parte</th>
          <th>Pregunta</th>
          <th>Respuesta</th>
        </tr>
      </thead>
      <tbody>
        {responses.map((item, i) => (
          <tr key={item.id}>
            <td>{i + 1}</td>
            <td>{item.part_description}</td>
            <td>{item.question_text}</td>
            <td>{item.user_response}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default DiagnosticResponsesTable;
