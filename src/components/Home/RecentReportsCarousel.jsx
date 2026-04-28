import { useNavigate } from 'react-router-dom';
import {
    Box, Card, CardContent, Typography, Chip, Stack, Tabs, Tab,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useMemo, useState } from 'react';
import { STATUS_COLORS, STATUS_LABELS, MOCK_REPORTS } from '../../config/mapConfig';

// Na razie bazujemy na MOCK_REPORTS z mapConfig — docelowo fetchuj z API.
// "Popularne" sortujemy po liczbie głosów/podobnych zgłoszeń (tu: po id jako mock).
// "Najnowsze" — po createdAt malejąco.

const buildRecent = (reports) =>
    [...reports].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 8);

const buildPopular = (reports) =>
    [...reports]
        .map((r) => ({ ...r, supportCount: (r.id * 7) % 43 + 3 })) // mock licznika
        .sort((a, b) => b.supportCount - a.supportCount)
        .slice(0, 8);

const RecentReportsCarousel = ({ reports = MOCK_REPORTS }) => {
    const navigate = useNavigate();
    const [tab, setTab] = useState('recent'); // 'recent' | 'popular'

    const items = useMemo(
        () => (tab === 'recent' ? buildRecent(reports) : buildPopular(reports)),
        [tab, reports]
    );

    const openOnMap = (report) => {
        navigate(`/zgloszenie/${report.id}`);
    };

    return (
        <Box sx={{ pb: 1 }}>
            {/* Przełącznik Najnowsze / Popularne */}
            <Box sx={{ px: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ color: 'white', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
                    Zgłoszenia w okolicy
                </Typography>
                <Tabs
                    value={tab}
                    onChange={(_, v) => setTab(v)}
                    sx={{
                        minHeight: 32,
                        bgcolor: 'rgba(255,255,255,0.9)',
                        borderRadius: 999,
                        p: 0.25,
                        '& .MuiTabs-indicator': { display: 'none' },
                        '& .MuiTab-root': {
                            minHeight: 28,
                            minWidth: 0,
                            py: 0.25, px: 1.5,
                            fontSize: '0.75rem',
                            textTransform: 'none',
                            fontWeight: 600,
                            borderRadius: 999,
                        },
                        '& .Mui-selected': {
                            bgcolor: 'primary.main',
                            color: 'white !important',
                        },
                    }}
                >
                    <Tab
                        value="recent"
                        label="Najnowsze"
                        icon={<AccessTimeIcon sx={{ fontSize: 14 }} />}
                        iconPosition="start"
                    />
                    <Tab
                        value="popular"
                        label="Popularne"
                        icon={<TrendingUpIcon sx={{ fontSize: 14 }} />}
                        iconPosition="start"
                    />
                </Tabs>
            </Box>

            {/* Karuzela kart */}
            <Box
                sx={{
                    display: 'flex',
                    gap: 1.5,
                    overflowX: 'auto',
                    scrollSnapType: 'x mandatory',
                    px: 2,
                    pb: 1,
                    '&::-webkit-scrollbar': { display: 'none' },
                    scrollbarWidth: 'none',
                }}
            >
                {items.map((r) => (
                    <Card
                        key={r.id}
                        onClick={() => openOnMap(r)}
                        sx={{
                            minWidth: 260,
                            maxWidth: 280,
                            scrollSnapAlign: 'start',
                            cursor: 'pointer',
                            border: 'none',
                        }}
                    >
                        <CardContent sx={{ p: 1.75, '&:last-child': { pb: 1.75 } }}>
                            <Stack direction="row" spacing={1.25} alignItems="flex-start">
                                {/* Kolorowa kropka statusu po lewej */}
                                <Box
                                    sx={{
                                        width: 10, height: 10,
                                        borderRadius: '50%',
                                        bgcolor: STATUS_COLORS[r.status] ?? 'grey.400',
                                        mt: 0.75,
                                        flexShrink: 0,
                                    }}
                                />
                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                    <Typography variant="caption" color="text.secondary" noWrap>
                                        {r.category}
                                    </Typography>
                                    <Typography variant="subtitle2" fontWeight={700} noWrap>
                                        {r.title}
                                    </Typography>
                                    <Stack direction="row" alignItems="center" spacing={0.25} sx={{ mt: 0.25, color: 'text.secondary' }}>
                                        <LocationOnIcon sx={{ fontSize: 12 }} />
                                        <Typography variant="caption" noWrap>
                                            {r.lat.toFixed(3)}, {r.lng.toFixed(3)}
                                        </Typography>
                                    </Stack>
                                </Box>
                            </Stack>

                            {/* Stopka karty: status + metadane */}
                            <Stack
                                direction="row"
                                alignItems="center"
                                justifyContent="space-between"
                                sx={{ mt: 1.25 }}
                            >
                                <Chip
                                    label={STATUS_LABELS[r.status] ?? r.status}
                                    size="small"
                                    sx={{
                                        bgcolor: `${STATUS_COLORS[r.status]}1A`, // ~10% alpha
                                        color: STATUS_COLORS[r.status],
                                        fontWeight: 600,
                                        height: 22,
                                    }}
                                />
                                <Typography variant="caption" color="text.secondary">
                                    {tab === 'popular'
                                        ? `${r.supportCount} popiera`
                                        : r.createdAt}
                                </Typography>
                            </Stack>
                        </CardContent>
                    </Card>
                ))}
            </Box>
        </Box>
    );
};

export default RecentReportsCarousel;
