import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    Paper,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    CircularProgress,
    Alert,
    Button,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabaseClient';

const parseNumber = (value) =>
    Number(String(value ?? '0').replace(/[^\d.,]/g, '').replace(',', '.'));

const normalizeType = (t) => {
    if (!t) return '';
    const lower = t.toLowerCase();
    if (lower === 'energia' || lower === 'energía') return 'Energía';
    if (lower === 'agua') return 'Agua';
    if (lower === 'actas') return 'Actas';
    return t;
};

const mapInvoiceToRow = (inv, dbType) => {
    const d = inv.data || {};

    let consumption = 0;
    let unitLabel = '';
    let rawTotalText = '';

    switch (dbType) {
        case 'Agua':
            consumption = parseNumber(d.consumo_m3);
            unitLabel = 'm³';
            rawTotalText = d.costo_total_agua ?? '';
            break;

        case 'Energía':
            consumption = parseNumber(d.consumo_kwh);
            unitLabel = 'kWh';
            rawTotalText = d.costo_total_energia ?? '';
            break;

        case 'Actas':
        default:
            unitLabel = 'unidades';
            rawTotalText = d.costo_total ?? '';
            break;
    }

    return {
        id: inv.id,
        fechaCarga: new Date(inv.created_at).toLocaleDateString(),
        nombreCliente: d.nombre_cliente || 'N/D',
        numeroCliente: d.numero_cliente || 'N/D',
        periodo: d.periodo_facturado || 'N/D',
        consumption,
        unitLabel,
        rawTotalText
    };
};

function IndicadoresMatriz() {
    const { type, year } = useParams();
    const navigate = useNavigate();
    const dbType = normalizeType(type);

    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getTitleByType = () => `Matriz de Indicadores de ${dbType || ''}`;

    useEffect(() => {
        const fetchIndicators = async () => {
            try {
                setLoading(true);
                setError(null);

                const { data: { session } } = await supabase.auth.getSession();
                const token = session?.access_token;
                const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

                const res = await fetch(
                    `${API_URL}/invoices?select=id,created_at,data,type,year` +
                    `&type=eq.${encodeURIComponent(dbType)}` +
                    `&year=eq.${encodeURIComponent(year)}` +
                    `&order=created_at.desc`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: 'application/json',
                        },
                    }
                );

                if (!res.ok) {
                    throw new Error(`Error cargando indicadores: ${res.status}`);
                }

                const invoices = await res.json();
                const mapped = invoices.map((inv) => mapInvoiceToRow(inv, dbType));

                setRows(mapped);
            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchIndicators();
    }, [dbType, year]);

    const headerUnit =
        rows[0]?.unitLabel ||
        (dbType === 'Energía' ? 'kWh' : dbType === 'Agua' ? 'm³' : 'unidades');

    return (
        <Layout>
            <Container maxWidth="lg">
                <Box sx={{ mt: 4, mb: 3 }}>
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate('/indicadores')}
                        sx={{ mb: 2 }}
                    >
                        Volver
                    </Button>
                    <Typography variant="h4" component="h1" gutterBottom>
                        {getTitleByType()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Resumen de consumo y costos por factura. Año {year}.
                    </Typography>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Paper>
                    {loading ? (
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Fecha carga</TableCell>
                                    <TableCell>Cliente</TableCell>
                                    <TableCell>N° cliente</TableCell>
                                    <TableCell>Período</TableCell>
                                    <TableCell align="right">Consumo ({headerUnit})</TableCell>
                                    <TableCell align="right">Costo total</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                            No hay indicadores disponibles.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    rows.map((row) => (
                                        <TableRow key={row.id}>
                                            <TableCell>{row.fechaCarga}</TableCell>
                                            <TableCell>{row.nombreCliente}</TableCell>
                                            <TableCell>{row.numeroCliente}</TableCell>
                                            <TableCell>{row.periodo}</TableCell>
                                            <TableCell align="right">
                                                {row.consumption.toLocaleString()}
                                            </TableCell>
                                            <TableCell align="right">
                                                {row.rawTotalText || '$ 0'}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </Paper>
            </Container>
        </Layout>
    );
}

export default IndicadoresMatriz;
