import { useMemo, useState, useEffect } from 'react';
import {
    Box, TextField, InputAdornment, Tabs, Tab, List, ListItemButton,
    ListItemText, IconButton, Typography, Collapse, Stack, CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MicIcon from '@mui/icons-material/Mic';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { complaintService } from '../../services/complaintService';
import { CATEGORIES } from '../../config/reportCategories'; // Upewnij się, że ścieżka do pliku jest poprawna/ Upewnij się, że ścieżka jest poprawna

const POPULAR_TOPICS = [
    'Dziury w drodze, jezdni lub chodniku miejskim',
    'Zniszczone lub przepełnione kosze na śmieci',
    'Niepoprawne parkowanie (zastawianie chodników, parkowanie przy przejściach/skrzyżowaniach)',
    'Problem z oświetleniem ulicznym',
    'Uszkodzona ławka na przystanku',
];

const StepCategory = ({ value, onChange, onCategoryChange }) => {
    const [tab, setTab] = useState(0);
    const [search, setSearch] = useState('');
    const [topicGroups, setTopicGroups] = useState([]); // Dynamiczne grupy z bazy danych
    const [loading, setLoading] = useState(true);
    const [openGroups, setOpenGroups] = useState({});

    // Pobieranie kategorii z "bazy danych" przy montowaniu komponentu
    useEffect(() => {
        let isMounted = true;

        complaintService.getCategories()
            .then((data) => {
                if (!isMounted) return;

                // JEŚLI BACKEND ZWRÓCIŁ DANE: Używamy danych z bazy
                if (data && data.length > 0) {
                    console.log("Dane pobrane pomyślnie z backendu.");
                    setTopicGroups(data);
                    setOpenGroups({ [data[0].id]: true });
                    setLoading(false);
                } else {
                    // JEŚLI BACKEND JEST PUSTY: Odpalamy backup z pliku reportCategories.jsx
                    console.warn("Backend zwrócił pustą listę kategorii. Uruchamiam lokalny backup.");
                    const backupData = fallbackToLocalCategories();
                    setTopicGroups(backupData);
                    setOpenGroups({ [backupData[0].id]: true });
                    setLoading(false);
                }
            })
            .catch((err) => {
                console.error("Błąd sieci backendu. Uruchamiam lokalny backup awaryjny.", err);
                if (isMounted) {
                    const backupData = fallbackToLocalCategories();
                    setTopicGroups(backupData);
                    setOpenGroups({ [backupData[0].id]: true });
                    setLoading(false);
                }
            });

        return () => { isMounted = false; };
    }, []);

// Funkcja pomocnicza, która przerabia Twoje płaskie CATEGORIES na grupy z tematami
    const fallbackToLocalCategories = () => {
        return CATEGORIES.map(cat => {
            // Generujemy przykładowe tematy na podstawie ID, żeby użytkownik miał w co kliknąć
            let topics = [`Inne zgłoszenie w kategorii: ${cat.label}`];

            if (cat.id === 'roads') {
                topics = [
                    'Dziury w drodze, jezdni lub chodniku miejskim',
                    'Uszkodzona ławka na przystanku',
                    'Niedziałająca sygnalizacja świetlna'
                ];
            } else if (cat.id === 'cleaning') {
                topics = [
                    'Zniszczone lub przepełnione kosze na śmieci',
                    'Dzikie wysypisko odpadów'
                ];
            } else if (cat.id === 'parking') {
                topics = [
                    'Niepoprawne parkowanie (zastawianie chodników, parkowanie przy przejściach/skrzyżowaniach)',
                    'Parkowanie na zieleni miejskiej'
                ];
            }

            return {
                id: cat.id,
                label: cat.label,
                color: cat.color,
                topics: topics
            };
        });
    };

    const toggleGroup = (id) => {
        setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const handleTopicSelect = (topic, categoryId) => {
        onChange(topic);
        if (onCategoryChange) {
            // Etykietę bierzemy z danych pobranych z backendu (topicGroups),
            // a dopiero w razie braku z lokalnej listy CATEGORIES.
            const backendCat = topicGroups.find(c => c.id === categoryId);
            const localCat = CATEGORIES.find(c => c.id === categoryId);
            const categoryLabel = backendCat?.label || localCat?.label || 'Pozostałe zgłoszenia';

            onCategoryChange(categoryId, categoryLabel); // Przekazujemy ID i Label wyżej!
        }
    };

    const filteredGroups = useMemo(() => {
        if (!search.trim()) return topicGroups;
        const q = search.toLowerCase();
        return topicGroups
            .map((g) => ({
                ...g,
                topics: g.topics.filter((t) => t.toLowerCase().includes(q)),
            }))
            .filter((g) => g.topics.length > 0);
    }, [search, topicGroups]);

    const popular = useMemo(() => {
        if (!search.trim()) return POPULAR_TOPICS;
        const q = search.toLowerCase();
        return POPULAR_TOPICS.filter((t) => t.toLowerCase().includes(q));
    }, [search]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
                Wyszukaj lub wybierz temat zgłoszenia dla Wrocławia
            </Typography>

            <TextField
                placeholder="Wyszukaj temat zgłoszenia"
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
                            <IconButton size="small" sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}>
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
                    '& .Mui-selected': { bgcolor: 'primary.main', color: 'white !important', borderRadius: 1.5 },
                }}
            >
                <Tab label="Kategorie" />
                <Tab label="Najczęstsze zgłoszenia" />
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
                                    <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: '0.08em', fontWeight: 600 }}>
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
                                                onClick={() => handleTopicSelect(topic, group.id)}
                                                sx={{
                                                    py: 1.5,
                                                    borderBottom: '1px solid',
                                                    borderColor: 'divider',
                                                    '&.Mui-selected': { bgcolor: 'rgba(91,95,237,0.08)' },
                                                }}
                                            >
                                                <ListItemText primary={topic} primaryTypographyProps={{ fontSize: '0.9375rem' }} />
                                                <IconButton size="small" edge="end" onClick={(e) => e.stopPropagation()}>
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
                    {popular.map((topic) => {
                        // Znajdujemy prawdziwą kategorię tematu w danych z backendu
                        const owner = topicGroups.find((g) => g.topics?.includes(topic));
                        const detectedId = owner?.id || 'other';

                        return (
                            <ListItemButton
                                key={topic}
                                selected={value === topic}
                                onClick={() => handleTopicSelect(topic, detectedId)} // <--- Bezpieczne wywołanie
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
                        );
                    })}
                </List>
            )}
        </Stack>
    );
};

export default StepCategory;