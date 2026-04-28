import { useState } from 'react';
import {
    Drawer, Box, Typography, IconButton, Chip, Stack, Button, Divider,
    TextField, InputAdornment,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import { STATUS_COLORS, STATUS_LABELS, CATEGORIES } from '../../config/mapConfig';

// WF-02 filtrowanie po statusie, WF-03 po lokalizacji (adresie).
// Bottom sheet wysuwany z prawego górnego przycisku filtrów na mapie.

const MapFilterSheet = ({ open, onClose, filters, onApply, totalCount, filteredCount }) => {
    const [draft, setDraft] = useState(filters);

    // Synchronizacja przy otwarciu
    const handleEnter = () => setDraft(filters);

    const toggleStatus = (value) => {
        setDraft((d) => ({
            ...d,
            statuses: d.statuses.includes(value)
                ? d.statuses.filter((s) => s !== value)
                : [...d.statuses, value],
        }));
    };

    const toggleCategory = (value) => {
        setDraft((d) => ({
            ...d,
            categories: d.categories.includes(value)
                ? d.categories.filter((c) => c !== value)
                : [...d.categories, value],
        }));
    };

    const clearAll = () => setDraft({ statuses: [], categories: [], address: '' });

    const apply = () => {
        onApply(draft);
        onClose();
    };

    return (
        <Drawer
            anchor="bottom"
            open={open}
            onClose={onClose}
            SlideProps={{ onEnter: handleEnter }}
            PaperProps={{
                sx: {
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                    maxHeight: '80vh',
                    pb: 'env(safe-area-inset-bottom)',
                },
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1, pb: 1 }}>
                <Box sx={{ width: 36, height: 4, borderRadius: 2, bgcolor: 'grey.300' }} />
            </Box>

            <Box sx={{ px: 2, pb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight={700}>
                    Filtry
                </Typography>
                <IconButton size="small" onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            </Box>
            <Divider />

            <Box sx={{ p: 2, overflowY: 'auto' }}>
                {/* Wyszukiwanie adresu (WF-03) */}
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Lokalizacja
                </Typography>
                <TextField
                    size="small"
                    fullWidth
                    placeholder="Adres, ulica, dzielnica"
                    value={draft.address}
                    onChange={(e) => setDraft({ ...draft, address: e.target.value })}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon fontSize="small" color="action" />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ mb: 3 }}
                />

                {/* Status (WF-02) */}
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Status
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 3 }}>
                    {Object.entries(STATUS_LABELS).map(([value, label]) => {
                        const active = draft.statuses.includes(value);
                        return (
                            <Chip
                                key={value}
                                label={label}
                                onClick={() => toggleStatus(value)}
                                sx={{
                                    bgcolor: active ? STATUS_COLORS[value] : 'background.paper',
                                    color: active ? 'white' : 'text.primary',
                                    borderColor: STATUS_COLORS[value],
                                    border: '1.5px solid',
                                    fontWeight: 500,
                                    '&:hover': { bgcolor: STATUS_COLORS[value], color: 'white' },
                                }}
                            />
                        );
                    })}
                </Stack>

                {/* Kategoria */}
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Kategoria
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                    {CATEGORIES.map((cat) => {
                        const active = draft.categories.includes(cat);
                        return (
                            <Chip
                                key={cat}
                                label={cat}
                                variant={active ? 'filled' : 'outlined'}
                                color={active ? 'primary' : 'default'}
                                onClick={() => toggleCategory(cat)}
                            />
                        );
                    })}
                </Stack>
            </Box>

            <Divider />
            <Box sx={{ p: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
                <Button onClick={clearAll} sx={{ flex: 0 }}>
                    Wyczyść
                </Button>
                <Typography variant="caption" color="text.secondary" sx={{ flex: 1, textAlign: 'center' }}>
                    {filteredCount} / {totalCount} zgłoszeń
                </Typography>
                <Button variant="contained" onClick={apply} sx={{ flex: 1 }}>
                    Pokaż wyniki
                </Button>
            </Box>
        </Drawer>
    );
};

export default MapFilterSheet;
