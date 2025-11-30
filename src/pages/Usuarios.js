import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabaseClient';

function Usuarios() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    role_id: '',
    company_id: '',
  });

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchCompanies();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

      console.log('🔍 Fetching users from user_profiles_with_email');

      // Fetch user profiles
      const response = await fetch(`${API_URL}/user_profiles_with_email`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('📡 Response status:', response.status);

      if (response.ok) {
        const profiles = await response.json();
        console.log('✅ User profiles:', profiles);

        // Fetch roles to get role names
        const rolesResponse = await fetch(`${API_URL}/roles`, {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        const rolesData = rolesResponse.ok ? await rolesResponse.json() : [];

        // Fetch companies to get company names
        const companiesResponse = await fetch(`${API_URL}/companies`, {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        const companiesData = companiesResponse.ok ? await companiesResponse.json() : [];
        console.log('✅ Companies data:', companiesData);

        // Enrich profiles with role and company names
        const enrichedUsers = profiles.map(profile => {
          const role = rolesData.find(r => r.id === profile.role_id);
          const company = companiesData.find(c => c.id === profile.company_id);

          console.log(`👤 User ${profile.user_email}:`, {
            company_id: profile.company_id,
            found_company: company,
          });

          return {
            user_id: profile.user_id,
            email: profile.user_email,
            full_name: profile.full_name || '',
            role_id: profile.role_id,
            role_name: role?.name || 'Sin rol',
            hierarchy_level: role?.hierarchy_level || 0,
            company_id: profile.company_id,
            company_name: company?.name || 'Sin empresa',
            phone: profile.phone,
            position: profile.position,
            is_active: profile.is_active,
          };
        });

        console.log('✅ Enriched users:', enrichedUsers);
        setUsers(enrichedUsers);
      } else {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`Error fetching users: ${response.status} - ${errorText}`);
      }
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

      const response = await fetch(`${API_URL}/roles?order=hierarchy_level.asc`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Roles:', data);
        setRoles(data);
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
    }
  };

  const fetchCompanies = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

      const response = await fetch(`${API_URL}/companies?order=name.asc`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Companies:', data);
        setCompanies(data);
      }
    } catch (err) {
      console.error('Error fetching companies:', err);
    }
  };

  const handleOpenDialog = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        email: user.email || '',
        full_name: user.full_name || '',
        role_id: user.role_id || '',
        company_id: user.company_id || '',
      });
    } else {
      setEditingUser(null);
      setFormData({
        email: '',
        full_name: '',
        role_id: '',
        company_id: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
    setFormData({
      email: '',
      full_name: '',
      role_id: '',
      company_id: '',
    });
  };

  const handleSave = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

      if (editingUser) {
        // Update existing user profile
        const response = await fetch(`${API_URL}/user_profiles?user_id=eq.${editingUser.user_id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Prefer': 'return=representation',
          },
          body: JSON.stringify({
            role_id: formData.role_id,
            full_name: formData.full_name,
            company_id: formData.company_id,
          }),
        });

        if (!response.ok) {
          throw new Error('Error updating user');
        }
      } else {
        // Create new user (this would require Supabase Auth API)
        // For now, we'll just show an alert
        alert('Para crear nuevos usuarios, usa el sistema de registro de Supabase Auth');
        return;
      }

      handleCloseDialog();
      fetchUsers();
    } catch (err) {
      console.error('Error saving user:', err);
      setError(err.message);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

      // Delete user profile
      const response = await fetch(`${API_URL}/user_profiles?user_id=eq.${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error deleting user');
      }

      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err.message);
    }
  };

  const getRoleColor = (hierarchyLevel) => {
    if (hierarchyLevel === 1) return 'error';
    if (hierarchyLevel === 2) return 'warning';
    if (hierarchyLevel === 3) return 'info';
    return 'default';
  };

  return (
    <Layout>
      <Container maxWidth="xl">
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

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Email</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Rol</TableCell>
                  <TableCell>Nivel Jerárquico</TableCell>
                  <TableCell>Empresa</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.user_id} hover>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.full_name || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.role_name}
                        color={getRoleColor(user.hierarchy_level)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{user.hierarchy_level}</TableCell>
                    <TableCell>{user.company_name || '-'}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenDialog(user)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(user.user_id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Dialog for Create/Edit */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                fullWidth
                disabled={!!editingUser}
              />
              <TextField
                label="Nombre Completo"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>Rol</InputLabel>
                <Select
                  value={formData.role_id}
                  onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                  label="Rol"
                >
                  {roles.map((role) => (
                    <MenuItem key={role.id} value={role.id}>
                      {role.name} (Nivel {role.hierarchy_level})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Empresa</InputLabel>
                <Select
                  value={formData.company_id}
                  onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                  label="Empresa"
                >
                  {companies.map((company) => (
                    <MenuItem key={company.id} value={company.id}>
                      {company.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button onClick={handleSave} variant="contained">
              Guardar
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
}

export default Usuarios;
