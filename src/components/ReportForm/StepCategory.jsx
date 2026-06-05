import { useMemo, useState } from 'react';
import {
    Box, TextField, InputAdornment, Tabs, Tab, List, ListItemButton,
    ListItemText, IconButton, Typography, Collapse, Stack,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MicIcon from '@mui/icons-material/Mic';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// Grupowanie tematów w sekcje, jak "CZYSZCZENIE" na screenie 3.
// Każdy item to konkretny problem, który użytkownik może zgłosić.
const TOPIC_GROUPS = [
    {
        id: 'czyszczenie',
        label: 'Czyszczenie',
        topics: [
            'Śnieg i lód na podwórku',
            'Nadmierne/nierównomierne rozprowadzanie odczynników na podwórku',
            'Zaśmiecanie terenu',
            'Nieuprzątnięty teren podwórka',
            'Brak koszy na śmieci w wyznaczonych miejscach na podwórku',
            'Reklama środków odurzających',
        ],
    },
    {
        id: 'drogi',
        label: 'Drogi i chodniki',
        topics: [
            'Dziura w jezdni',
            'Uszkodzony chodnik',
            'Brak oznakowania poziomego',
            'Nieczytelne znaki drogowe',
        ],
    },
    {
        id: 'oswietlenie',
        label: 'Oświetlenie',
        topics: [
            'Nieświecąca latarnia',
            'Uszkodzony słup oświetleniowy',
            'Brak oświetlenia w miejscu publicznym',
        ],
    },
    {
        id: 'zielen',
        label: 'Zieleń miejska',
        topics: [
            'Połamane drzewo',
            'Nieprzycięte drzewa lub krzewy',
            'Zniszczony trawnik',
        ],
    },
    {
        id: 'bezpieczenstwo',
        label: 'Bezpieczeństwo',
        topics: [
            'Sople na dachu',
            'Uszkodzony właz/studzienka',
            'Niebezpieczna konstrukcja',
        ],
    },
];

const POPULAR_TOPICS = [
    'Śnieg i lód na podwórku',
    'Dziura w jezdni',
    'Nieświecąca latarnia',
    'Zaśmiecanie terenu',
    'Sople na dachu',
];

const StepCategory = ({ value, onChange }) => {
    const [tab, setTab] = useState(0); // 0 = Odpowiednie, 1 = Popularne
    const [search, setSearch] = useState('');
    const [openGroups, setOpenGroups] = useState({ czyszczenie: true });

    const toggleGroup = (id) => {
        setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    // Filtrowanie po wyszukiwarce — przeszukujemy wszystkie tematy we wszystkich grupach
    const filteredGroups = useMemo(() => {
        if (!search.trim()) return TOPIC_GROUPS;
        const q = search.toLowerCase();
        return TOPIC_GROUPS
            .map((g) => ({
                ...g,
                topics: g.topics.filter((t) => t.toLowerCase().includes(q)),
            }))
            .filter((g) => g.topics.length > 0);
    }, [search]);

    const popular = useMemo(() => {
        if (!search.trim()) return POPULAR_TOPICS;
        const q = search.toLowerCase();
        return POPULAR_TOPICS.filter((t) => t.toLowerCase().includes(q));
    }, [search]);

    return (
        <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
                Wyszukaj lub wybierz temat
            </Typography>

            <TextField
                placeholder="Wyszukaj temat"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                fullWidth
                size="medium"
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon color="action" />
                        </InputAdornment>
                    ),
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                                size="small"
                                sx={{
                                    bgcolor: 'primary.main',
                                    color: 'white',
                                    '&:hover': { bgcolor: 'primary.dark' },
                                }}
                            >
                                <MicIcon fontSize="small" />
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
            />

            <Tabs
                value={tab}
                onChange={(_, v) => setTab(v)}
                variant="fullWidth"
                sx={{
                    '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, minHeight: 44 },
                    '& .MuiTabs-indicator': { display: 'none' },
                    bgcolor: 'background.default',
                    borderRadius: 2,
                    p: 0.5,
                    '& .Mui-selected': {
                        bgcolor: 'primary.main',
                        color: 'white !important',
                        borderRadius: 1.5,
                    },
                }}
            >
                <Tab label="Odpowiednie tematy" />
                <Tab label="Popularne tematy" />
            </Tabs>

            {tab === 0 && (
                <Box>
                    {filteredGroups.map((group) => {
                        const isOpen = !!openGroups[group.id];
                        return (
                            <Box key={group.id} sx={{ mb: 1 }}>
                                <Box
                                    onClick={() => toggleGroup(group.id)}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        py: 1.25,
                                        cursor: 'pointer',
                                        borderBottom: '1px solid',
                                        borderColor: 'divider',
                                    }}
                                >
                                    <Typography
                                        variant="overline"
                                        color="text.secondary"
                                        sx={{ letterSpacing: '0.08em', fontWeight: 600 }}
                                    >
                                        {group.label.toUpperCase()}
                                    </Typography>
                                    {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                </Box>
                                <Collapse in={isOpen}>
                                    <List disablePadding>
                                        {group.topics.map((topic) => (
                                            <ListItemButton
                                                key={topic}
                                                selected={value === topic}
                                                onClick={() => onChange(topic)}
                                                sx={{
                                                    py: 1.5,
                                                    borderBottom: '1px solid',
                                                    borderColor: 'divider',
                                                    '&.Mui-selected': {
                                                        bgcolor: 'rgba(91,95,237,0.08)',
                                                    },
                                                }}
                                            >
                                                <ListItemText
                                                    primary={topic}
                                                    primaryTypographyProps={{ fontSize: '0.9375rem' }}
                                                />
                                                <IconButton
                                                    size="small"
                                                    edge="end"
                                                    onClick={(e) => e.stopPropagation()}
                                                    aria-label="Informacja"
                                                >
                                                    <InfoOutlinedIcon fontSize="small" color="action" />
                                                </IconButton>
                                            </ListItemButton>
                                        ))}
                                    </List>
                                </Collapse>
                            </Box>
                        );
                    })}
                    {filteredGroups.length === 0 && (
                        <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                            Brak tematów pasujących do wyszukiwania.
                        </Typography>
                    )}
                </Box>
            )}

            {tab === 1 && (
                <List disablePadding>
                    {popular.map((topic) => (
                        <ListItemButton
                            key={topic}
                            selected={value === topic}
                            onClick={() => onChange(topic)}
                            sx={{
                                py: 1.5,
                                borderBottom: '1px solid',
                                borderColor: 'divider',
                                '&.Mui-selected': { bgcolor: 'rgba(91,95,237,0.08)' },
                            }}
                        >
                            <ListItemText primary={topic} />
                            <IconButton size="small" edge="end" onClick={(e) => e.stopPropagation()}>
                                <InfoOutlinedIcon fontSize="small" color="action" />
                            </IconButton>
                        </ListItemButton>
                    ))}
                </List>
            )}
        </Stack>
    );
};

export default StepCategory;
