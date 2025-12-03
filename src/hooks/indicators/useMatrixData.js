import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

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

export const useMatrixData = (type, year) => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const dbType = normalizeType(type);

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

        if (dbType && year) {
            fetchIndicators();
        }
    }, [dbType, year]);

    const headerUnit =
        rows[0]?.unitLabel ||
        (dbType === 'Energía' ? 'kWh' : dbType === 'Agua' ? 'm³' : 'unidades');

    return {
        rows,
        loading,
        error,
        dbType,
        headerUnit
    };
};
