import { useMemo, useState, useEffect } from 'react';
import Fuse from 'fuse.js';
import {
    Box, TextField, InputAdornment, Tabs, Tab, List, ListItemButton,
    ListItemText, IconButton, Typography, Collapse, Stack, CircularProgress, Chip, Tooltip
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

const highlightText = (text, query) => {
    if (!query || !query.trim()) return text;
    // Ucieczka znaków specjalnych RegExp
    const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${safeQuery})`, 'gi'));
    return parts.map((part, index) => 
        part.toLowerCase() === query.toLowerCase() ? <strong key={index}>{part}</strong> : part
    );
};

const renderTopic = (topicString, search = '') => {
    const isUrgent = topicString.toUpperCase().includes('PILNE');
    const match = topicString.match(/^(.*?)\s*\((.*?)\)$/);

    if (isUrgent) {
        if (match) {
            const title = match[1];
            const content = match[2];
            const phoneMatch = content.match(/(\d{3,})/);
            const phoneNumber = phoneMatch ? phoneMatch[1] : '112';

            return (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, p: 1, bgcolor: 'error.50', borderRadius: 1, borderLeft: '4px solid', borderColor: 'error.main' }}>
                    <Typography sx={{ fontSize: '0.9375rem', fontWeight: 700, color: 'error.main' }}>
                        {highlightText(title, search)}
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        <a href={`tel:${phoneNumber}`} onClick={(e) => e.stopPropagation()} style={{ color: '#d32f2f', textDecoration: 'underline' }}>
                            {highlightText(content, search)}
                        </a>
                    </Typography>
                </Box>
            );
        } else {
            return (
                <Typography sx={{ fontSize: '0.9375rem', fontWeight: 700, color: 'error.main', p: 1, bgcolor: 'error.50', borderRadius: 1, borderLeft: '4px solid', borderColor: 'error.main' }}>
                    {highlightText(topicString, search)}
                </Typography>
            );
        }
    }

    if (match) {
        const title = match[1];
        const content = match[2];
        const isDepartment = /^[A-ZŚĆŹŻ][A-Za-z0-9ąćęłńóśźżĄĆĘŁŃÓŚŹŻ /]*$/.test(content);
        
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                <Typography sx={{ fontSize: '0.9375rem' }}>
                    {highlightText(title, search)}
                </Typography>
                <Box>
                    {isDepartment ? (
                        <Chip 
                            label={highlightText(content, search)} 
                            size="small" 
                            variant="outlined" 
                            color="primary" 
                            sx={{ fontSize: '0.7rem', height: 20 }} 
                        />
                    ) : (
                        <Typography variant="caption" color="text.secondary">
                            ({highlightText(content, search)})
                        </Typography>
                    )}
                </Box>
            </Box>
        );
    }
    return highlightText(topicString, search);
};

const StepCategory = ({ value, onChange, onCategoryChange }) => {
    const [tab, setTab] = useState(0);
    const [search, setSearch] = useState('');
    const [topicGroups, setTopicGroups] = useState([]); // Dynamiczne grupy z bazy danych
    const [loading, setLoading] = useState(true);
    const [openGroups, setOpenGroups] = useState({});
    const [popular, setPopular] = useState(POPULAR_TOPICS);

    // Pobieranie kategorii z "bazy danych" przy montowaniu komponentu
    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                const [data, popularData] = await Promise.all([
                    complaintService.getCategories(),
                    complaintService.getPopularTopics(5).catch(() => POPULAR_TOPICS)
                ]);

                if (!isMounted) return;

                if (popularData && popularData.length > 0) {
                    setPopular(popularData);
                }

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
            } catch (err) {
                console.error("Błąd sieci backendu. Uruchamiam lokalny backup awaryjny.", err);
                if (isMounted) {
                    const backupData = fallbackToLocalCategories();
                    setTopicGroups(backupData);
                    setOpenGroups({ [backupData[0].id]: true });
                    setLoading(false);
                }
            }
        };

        fetchData();

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

    const searchResults = useMemo(() => {
        if (!search.trim()) {
            return { exactGroups: topicGroups, suggestions: [] };
        }
        
        const q = search.toLowerCase();
        
        // Exact / substring matching
        const exactGroups = topicGroups
            .map((g) => ({
                ...g,
                topics: g.topics.filter((t) => t.toLowerCase().includes(q)),
            }))
            .filter((g) => g.topics.length > 0);
            
        if (exactGroups.length > 0) {
            return { exactGroups, suggestions: [] };
        }
        
        // Fuzzy search with Fuse.js
        const allTopics = topicGroups.flatMap(g => 
            g.topics.map(t => ({ topic: t, categoryId: g.id }))
        );
        
        const fuse = new Fuse(allTopics, {
            keys: ['topic'],
            threshold: 0.4,
            distance: 100,
        });
        
        const fuzzyResults = fuse.search(search);
        const suggestions = fuzzyResults.slice(0, 5).map(r => r.item);
        
        return { exactGroups: [], suggestions };
    }, [search, topicGroups]);

    const filteredPopular = useMemo(() => {
        if (!search.trim()) return popular;
        const q = search.toLowerCase();
        return popular.filter((t) => t.toLowerCase().includes(q));
    }, [search, popular]);

    const validatedPopular = useMemo(() => {
        const allTopics = topicGroups.flatMap(g => g.topics);
        return filteredPopular.filter(p => allTopics.includes(p));
    }, [filteredPopular, topicGroups]);

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
                    {searchResults.exactGroups.length > 0 ? (
                        searchResults.exactGroups.map((group) => {
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
                                                    <ListItemText 
                                                        primary={renderTopic(topic, search)} 
                                                        disableTypography
                                                        primaryTypographyProps={{ fontSize: '0.9375rem' }} 
                                                    />
                                                    {group.disclaimer && (
                                                        <Tooltip title={group.disclaimer} placement="top" arrow>
                                                            <IconButton size="small" edge="end" onClick={(e) => { e.stopPropagation(); alert(group.disclaimer); }}>
                                                                <InfoOutlinedIcon fontSize="small" color="action" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                </ListItemButton>
                                            ))}
                                        </List>
                                    </Collapse>
                                </Box>
                            );
                        })
                    ) : searchResults.suggestions?.length > 0 ? (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, px: 2, fontWeight: 500, color: 'primary.main' }}>
                                Brak dokładnych wyników. Być może szukałeś:
                            </Typography>
                            <List disablePadding>
                                {searchResults.suggestions.map((item) => {
                                    const owner = topicGroups.find(g => g.id === item.categoryId);
                                    return (
                                        <ListItemButton
                                            key={item.topic}
                                            selected={value === item.topic}
                                            onClick={() => handleTopicSelect(item.topic, item.categoryId)}
                                            sx={{ py: 1.5, borderBottom: '1px solid', borderColor: 'divider', '&.Mui-selected': { bgcolor: 'rgba(91,95,237,0.08)' } }}
                                        >
                                            <ListItemText 
                                                primary={renderTopic(item.topic, search)} 
                                                disableTypography
                                                primaryTypographyProps={{ fontSize: '0.9375rem' }} 
                                            />
                                            {owner?.disclaimer && (
                                                <Tooltip title={owner.disclaimer} placement="top" arrow>
                                                    <IconButton size="small" edge="end" onClick={(e) => { e.stopPropagation(); alert(owner.disclaimer); }}>
                                                        <InfoOutlinedIcon fontSize="small" color="action" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </ListItemButton>
                                    );
                                })}
                            </List>
                        </Box>
                    ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                            Brak tematów pasujących do wyszukiwania.
                        </Typography>
                    )}
                </Box>
            )}

            {tab === 1 && (
                <List disablePadding>
                    {validatedPopular.map((topic) => {
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
                                <ListItemText 
                                    primary={renderTopic(topic, search)} 
                                    disableTypography
                                    primaryTypographyProps={{ fontSize: '0.9375rem' }} 
                                />
                                {owner?.disclaimer && (
                                    <Tooltip title={owner.disclaimer} placement="top" arrow>
                                        <IconButton size="small" edge="end" onClick={(e) => { e.stopPropagation(); alert(owner.disclaimer); }}>
                                            <InfoOutlinedIcon fontSize="small" color="action" />
                                        </IconButton>
                                    </Tooltip>
                                )}
                            </ListItemButton>
                        );
                    })}
                </List>
            )}
        </Stack>
    );
};

export default StepCategory;