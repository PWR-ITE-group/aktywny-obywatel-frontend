import {
    Box, FormControl, InputLabel, Select, MenuItem,
    Chip, Stack, Typography, IconButton, Tooltip,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import { STATUS_LABELS, STATUS_COLORS, CATEGORIES } from '../../config/mapConfig';

const MapFilters = ({ filters, onChange, totalCount, filteredCount }) => {
    const hasActiveFilters = filters.status !== '' || filters.category !== '';

    const clearFilters = () => {
        onChange({ status: '', category: '' });
    };

    return (
        <Box
            sx={{
                p: 2,
                bgcolor: 'background.paper',
                borderBottom: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                gap: 2,
                alignItems: 'center',
                flexWrap: 'wrap',
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <FilterListIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                    Filtry:
                </Typography>
            </Box>

            <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Status</InputLabel>
                <Select
                    value={filters.status}
                    label="Status"
                    onChange={(e) => onChange({ ...filters, status: e.target.value })}
                >
                    <MenuItem value="">Wszystkie</MenuItem>
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                        <MenuItem key={value} value={value}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box
                                    sx={{
                                        width: 10,
                                        height: 10,
                                        borderRadius: '50%',
                                        bgcolor: STATUS_COLORS[value],
                                        flexShrink: 0,
                                    }}
                                />
                                {label}
                            </Box>
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel>Kategoria</InputLabel>
                <Select
                    value={filters.category}
                    label="Kategoria"
                    onChange={(e) => onChange({ ...filters, category: e.target.value })}
                >
                    <MenuItem value="">Wszystkie</MenuItem>
                    {CATEGORIES.map((cat) => (
                        <MenuItem key={cat} value={cat}>
                            {cat}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {hasActiveFilters && (
                <Tooltip title="Wyczyść filtry">
                    <IconButton size="small" onClick={clearFilters}>
                        <ClearIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            )}

            {/* Legenda statusów */}
            <Box sx={{ ml: 'auto', display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <Chip
                        key={value}
                        label={label}
                        size="small"
                        sx={{
                            bgcolor: STATUS_COLORS[value],
                            color: 'white',
                            fontSize: '0.7rem',
                            height: 22,
                        }}
                        onClick={() => onChange({ ...filters, status: value })}
                    />
                ))}
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ ml: 1, whiteSpace: 'nowrap' }}>
                {filteredCount} / {totalCount} zgłoszeń
            </Typography>
        </Box>
    );
};

export default MapFilters;