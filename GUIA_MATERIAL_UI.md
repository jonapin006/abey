# Guía de Material-UI (MUI) para el Proyecto

## 📦 Instalación

```bash
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled
```

---

## 🎨 Componentes Básicos

### 1. **Botones**

```javascript
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';

// Botón básico
<Button variant="contained" color="primary">
  Click me
</Button>

// Botón con icono
<Button variant="outlined" startIcon={<DeleteIcon />}>
  Eliminar
</Button>

// Botón solo icono
<IconButton color="primary">
  <DeleteIcon />
</IconButton>
```

### 2. **Tablas (Reemplazo para tu tabla actual)**

```javascript
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

<TableContainer component={Paper}>
  <Table>
    <TableHead>
      <TableRow>
        <TableCell>#</TableCell>
        <TableCell>Parte</TableCell>
        <TableCell>Pregunta</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {rows.map((row) => (
        <TableRow key={row.id}>
          <TableCell>{row.number}</TableCell>
          <TableCell>{row.part}</TableCell>
          <TableCell>{row.question}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</TableContainer>
```

### 3. **Select (Dropdown)**

```javascript
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

<FormControl fullWidth>
  <InputLabel>Estado</InputLabel>
  <Select
    value={status}
    label="Estado"
    onChange={handleChange}
  >
    <MenuItem value="Por hacer">Por hacer</MenuItem>
    <MenuItem value="En progreso">En progreso</MenuItem>
    <MenuItem value="Completado">Completado</MenuItem>
  </Select>
</FormControl>
```

### 4. **Modal/Dialog**

```javascript
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

<Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
  <DialogTitle>Plan de Acción</DialogTitle>
  <DialogContent>
    <p>Contenido del plan...</p>
  </DialogContent>
  <DialogActions>
    <Button onClick={handleClose}>Cerrar</Button>
    <Button variant="contained" onClick={handleSave}>Guardar</Button>
  </DialogActions>
</Dialog>
```

### 5. **Loading (CircularProgress)**

```javascript
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

<Box display="flex" justifyContent="center" p={3}>
  <CircularProgress />
</Box>
```

### 6. **Alerts**

```javascript
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';

<Alert severity="error">
  <AlertTitle>Error</AlertTitle>
  Ocurrió un error al cargar los datos
</Alert>

<Alert severity="success">Datos guardados correctamente</Alert>
<Alert severity="warning">Advertencia importante</Alert>
<Alert severity="info">Información útil</Alert>
```

### 7. **Chips (Tags)**

```javascript
import Chip from '@mui/material/Chip';

<Chip label="Por hacer" color="default" />
<Chip label="En progreso" color="primary" />
<Chip label="Completado" color="success" />
```

---

## 🎨 Tema Personalizado

Crea un archivo `src/theme.js`:

```javascript
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2E6F95', // Tu color azul
    },
    secondary: {
      main: '#667eea',
    },
    success: {
      main: '#4caf50',
    },
    error: {
      main: '#f44336',
    },
  },
  typography: {
    fontFamily: '"Segoe UI", Arial, sans-serif',
  },
});

export default theme;
```

Luego en tu `src/index.js` o `src/App.js`:

```javascript
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Tu app aquí */}
    </ThemeProvider>
  );
}
```

---

## 🔄 Ejemplo: Actualizar DiagnosticResponsesTable

```javascript
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';

// En el return:
<TableContainer component={Paper} sx={{ mt: 2 }}>
  <Table>
    <TableHead>
      <TableRow>
        <TableCell>#</TableCell>
        <TableCell>Parte</TableCell>
        <TableCell>Pregunta</TableCell>
        <TableCell>Respuesta</TableCell>
        <TableCell>Estado</TableCell>
        <TableCell>Acción</TableCell>
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
            <Select
              value={item.action_plan_status || 'Por hacer'}
              onChange={(e) => handleStatusChange(item.id, item.action_plan_id, e.target.value)}
              disabled={updating[item.id]}
              size="small"
            >
              <MenuItem value="Por hacer">Por hacer</MenuItem>
              <MenuItem value="En progreso">En progreso</MenuItem>
              <MenuItem value="Completado">Completado</MenuItem>
            </Select>
            {updating[item.id] && <CircularProgress size={20} sx={{ ml: 1 }} />}
          </TableCell>
          <TableCell>
            <Button
              variant={item.generated_plan ? "outlined" : "contained"}
              size="small"
              onClick={() => handleViewActionPlan(item)}
            >
              {item.generated_plan ? 'Ver plan' : 'Generar plan'}
            </Button>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</TableContainer>
```

---

## 📚 Recursos

- **Documentación oficial**: https://mui.com/
- **Componentes**: https://mui.com/material-ui/all-components/
- **Iconos**: https://mui.com/material-ui/material-icons/
- **Ejemplos**: https://mui.com/material-ui/getting-started/templates/

---

## 🎯 Próximos Pasos

1. ✅ Instalación completada
2. ⏳ Crear tema personalizado (`src/theme.js`)
3. ⏳ Envolver app con `ThemeProvider`
4. ⏳ Reemplazar componentes HTML por MUI
5. ⏳ Probar y ajustar estilos
