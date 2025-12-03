import React from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import Layout from '../components/Layout.jsx';
import { useUsers } from '../hooks/users/useUsers';
import { useUserForm } from '../hooks/users/useUserForm';
import { useCompanies } from '../hooks/companies/useCompanies';
import { UsersTable } from '../components/users/UsersTable';
import { UserDialog } from '../components/users/UserDialog';

function Usuarios() {
  // Custom hooks
  const { users, roles, loading, error, refetch, deleteUser } = useUsers();
  const { companies } = useCompanies();
  const {
    openDialog,
    editingUser,
    formData,
    saving,
    error: formError,
    handleOpenDialog,
    handleCloseDialog,
    handleFormChange,
    handleSave,
  } = useUserForm(refetch);

  const handleDelete = async (userId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      try {
        await deleteUser(userId);
      } catch (err) {
        alert('Error al eliminar usuario');
      }
    }
  };

  return (
    <Layout>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Typography variant="h4" component="h1" gutterBottom>
              Gestión de Usuarios
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Administra usuarios, roles y permisos
            </Typography>
          </div>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Nuevo Usuario
          </Button>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Users Table */}
        <UsersTable
          users={users}
          loading={loading}
          onEdit={handleOpenDialog}
          onDelete={handleDelete}
        />

        {/* Create/Edit Dialog */}
        <UserDialog
          open={openDialog}
          onClose={handleCloseDialog}
          isEditing={!!editingUser}
          formData={formData}
          onFormChange={handleFormChange}
          onSave={handleSave}
          saving={saving}
          error={formError}
          roles={roles}
          companies={companies}
        />
      </Container>
    </Layout>
  );
}

export default Usuarios;
