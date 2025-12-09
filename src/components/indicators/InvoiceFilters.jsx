import React from 'react';
import {
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';

const INVOICE_TYPES = ['Energía', 'Agua', 'Actas'];

export const InvoiceFilters = ({
    filters,
    onFilterChange,
    companies,
    headquarters,
    years,
    compact = false,
}) => {
    return (
        <Grid container spacing={compact ? 1.5 : 2} sx={{ mb: compact ? 0 : 2 }}>
            {/* Year Filter */}
            <Grid item xs={6} sm={3}>
                <FormControl fullWidth sx={{ minWidth: '150px' }}>
                    <InputLabel>Año</InputLabel>
                    <Select
                        value={filters.year}
                        label="Año"
                        onChange={(e) => onFilterChange('year', e.target.value)}
                    >
                        {years.map((year) => (
                            <MenuItem key={year} value={year}>
                                {year}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>

            {/* Company Filter */}
            <Grid item xs={6} sm={3}>
                <FormControl fullWidth sx={{ minWidth: '150px' }}>
                    <InputLabel>Empresa</InputLabel>
                    <Select
                        value={filters.company_id}
                        label="Empresa"
                        onChange={(e) => onFilterChange('company_id', e.target.value)}
                    >
                        <MenuItem value="">Todas</MenuItem>
                        {companies.map((company) => (
                            <MenuItem key={company.id} value={company.id}>
                                {company.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>

            {/* Type Filter */}
            <Grid item xs={6} sm={3}>
                <FormControl fullWidth sx={{ minWidth: '150px' }}>
                    <InputLabel>Tipo</InputLabel>
                    <Select
                        value={filters.type}
                        label="Tipo"
                        onChange={(e) => onFilterChange('type', e.target.value)}
                    >
                        <MenuItem value="">Todos</MenuItem>
                        {INVOICE_TYPES.map((type) => (
                            <MenuItem key={type} value={type}>
                                {type}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>

            {/* Headquarters Filter */}
            <Grid item xs={6} sm={3}>
                <FormControl
                    fullWidth
                    disabled={!filters.company_id}
                    sx={{ minWidth: '150px' }}
                >
                    <InputLabel>Sede</InputLabel>
                    <Select
                        value={filters.headquarters_id}
                        label="Sede"
                        onChange={(e) => onFilterChange('headquarters_id', e.target.value)}
                    >
                        <MenuItem value="">Todas</MenuItem>
                        {headquarters.map((hq) => (
                            <MenuItem key={hq.id} value={hq.id}>
                                {hq.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
        </Grid>
    );
};
