import React from 'react';
import Layout from '../components/Layout';
import DiagnosticResponsesTable from '../components/DiagnosticResponsesTable';

function Consultoria() {
  const diagnosticId = '5e5a9f5c-1f05-4183-84db-b007a20e237b';

  return (
    <Layout>
      <h1>Página de Consultoría</h1>
      <DiagnosticResponsesTable diagnosticId={diagnosticId} />
    </Layout>
  );
}

export default Consultoria;
