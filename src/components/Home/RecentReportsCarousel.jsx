import { useNavigate } from 'react-router-dom';
import {
    Box, Card, CardContent, Typography, Chip, Stack
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useMemo, useState, useEffect } from 'react';
import { STATUS_COLORS, STATUS_LABELS } from '../../config/mapConfig';
import { complaintService } from '../../services/complaintService';

const buildRecent = (reports) =>
    [...reports].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')).slice(0, 8);

const buildPopular = (reports) =>
    [...reports].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0)).slice(0, 8);

const RecentReportsCarousel = () => {
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState(() => sessionStorage.getItem('homeTab') || 'recent');

    useEffect(() => {
        sessionStorage.setItem('homeTab', tab);
    }, [tab]);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const data = await complaintService.getAll();
                setReports(data);
            } catch (error) {
                console.error('Failed to load recent reports:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, []);

    const items = useMemo(() => tab === 'recent' ? buildRecent(reports) : buildPopular(reports), [reports, tab]);

    const openOnMap = (report) => {
        navigate(`/zgloszenie/${report.id}`);
    };

    return (
        <Box sx={{ pb: 1 }}>
            <Box sx={{ px: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ color: 'white', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
                    Zgłoszenia w okolicy
                </Typography>
                <Box sx={{ 
                    display: 'flex',
                    position: 'relative',
                    bgcolor: 'rgba(240, 240, 245, 0.95)', 
                    borderRadius: 999, 
                    p: 0.5,
                    backdropFilter: 'blur(8px)',
                    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)',
                    border: '1px solid rgba(0, 0, 0, 0.12)'
                }}>
                    {/* Sliding Background */}
                    <Box 
                        sx={{
                            position: 'absolute',
                            top: 4, bottom: 4, left: 4,
                            width: 'calc(50% - 4px)',
                            bgcolor: 'white',
                            borderRadius: 999,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)',
                            transition: 'transform 0.25s cubic-bezier(0.4, 0.0, 0.2, 1)',
                            transform: tab === 'recent' ? 'translateX(0)' : 'translateX(100%)',
                            zIndex: 1
                        }}
                    />

                    <Typography 
                        variant="caption" 
                        fontWeight={tab === 'recent' ? 700 : 500}
                        sx={{ 
                            flex: 1, textAlign: 'center', minWidth: 90,
                            px: 1.5, py: 0.5, cursor: 'pointer',
                            color: tab === 'recent' ? 'primary.main' : 'text.secondary',
                            zIndex: 2,
                            transition: 'color 0.25s ease-in-out'
                        }}
                        onClick={() => setTab('recent')}
                    >
                        Najnowsze
                    </Typography>
                    
                    <Typography 
                        variant="caption" 
                        fontWeight={tab === 'popular' ? 700 : 500}
                        sx={{ 
                            flex: 1, textAlign: 'center', minWidth: 90,
                            px: 1.5, py: 0.5, cursor: 'pointer',
                            color: tab === 'popular' ? 'primary.main' : 'text.secondary',
                            zIndex: 2,
                            transition: 'color 0.25s ease-in-out'
                        }}
                        onClick={() => setTab('popular')}
                    >
                        Popularne
                    </Typography>
                </Box>
            </Box>

            <Box
                sx={{
                    display: 'flex',
                    overflowX: 'auto',
                    gap: 2,
                    px: 2,
                    pb: 2,
                    scrollSnapType: 'x mandatory',
                    '&::-webkit-scrollbar': { display: 'none' },
                    scrollbarWidth: 'none',
                }}
            >
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <Card
                            key={i}
                            sx={{
                                minWidth: 260,
                                maxWidth: 280,
                                scrollSnapAlign: 'start',
                                opacity: 0.7,
                                borderRadius: 3,
                            }}
                        >
                            <CardContent sx={{ p: 1.75 }}>
                                <Box sx={{ width: 60, height: 24, bgcolor: 'grey.300', borderRadius: 1, mb: 1.5 }} />
                                <Box sx={{ width: '80%', height: 20, bgcolor: 'grey.300', mb: 1 }} />
                            </CardContent>
                        </Card>
                    ))
                ) : items.length === 0 ? (
                    <Typography variant="body2" color="white" sx={{ pl: 2, opacity: 0.8 }}>
                        Brak zgłoszeń w okolicy.
                    </Typography>
                ) : (
                    items.map((r) => (
                        <Card
                            key={r.id}
                            onClick={() => openOnMap(r)}
                            sx={{
                                minWidth: 260,
                                maxWidth: 280,
                                scrollSnapAlign: 'start',
                                cursor: 'pointer',
                                border: 'none',
                                borderRadius: 3,
                                bgcolor: 'rgba(255, 255, 255, 0.95)',
                                backdropFilter: 'blur(10px)',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                                },
                            }}
                        >
                            <CardContent sx={{ p: 1.75, '&:last-child': { pb: 1.75 } }}>
                                <Stack direction="column" spacing={0.5}>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <Box
                                            sx={{
                                                width: 10, height: 10,
                                                borderRadius: '50%',
                                                bgcolor: STATUS_COLORS[r.status] ?? 'grey.400',
                                                flexShrink: 0,
                                            }}
                                        />
                                        <Typography variant="caption" color="text.secondary" noWrap>
                                            {r.category}
                                        </Typography>
                                    </Stack>
                                    <Box sx={{ minWidth: 0, flex: 1 }}>
                                        <Typography variant="subtitle2" fontWeight={700} noWrap>
                                            {r.title}
                                        </Typography>
                                        <Stack direction="row" alignItems="center" spacing={0.25} sx={{ mt: 0.25, color: 'text.secondary' }}>
                                            <LocationOnIcon sx={{ fontSize: 12 }} />
                                            <Typography variant="caption" noWrap>
                                                {r.address?.street ? `${r.address.street} ${r.address.houseNumber || ''}`.trim() : (r.address?.displayName || 'Brak adresu')}
                                            </Typography>
                                        </Stack>
                                    </Box>
                                </Stack>

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
                                            bgcolor: `${STATUS_COLORS[r.status] || '#757575'}1A`,
                                            color: STATUS_COLORS[r.status] || '#757575',
                                            fontWeight: 600,
                                            height: 22,
                                        }}
                                    />
                                    {tab === 'popular' ? (
                                        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: 'text.secondary' }}>
                                            <VisibilityIcon sx={{ fontSize: 14 }} />
                                            <Typography variant="caption" fontWeight={600}>
                                                {r.viewCount || 0}
                                            </Typography>
                                        </Stack>
                                    ) : (
                                        <Typography variant="caption" color="text.secondary">
                                            {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Brak daty'}
                                        </Typography>
                                    )}
                                </Stack>
                            </CardContent>
                        </Card>
                    ))
                )}
            </Box>
        </Box>
    );
};

export default RecentReportsCarousel;
