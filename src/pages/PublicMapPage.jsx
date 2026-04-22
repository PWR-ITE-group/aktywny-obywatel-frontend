import { useState, useMemo } from 'react';
import { Box, Typography, Alert, Paper } from '@mui/material';
import ReportMap from '../components/Map/ReportMap';
import MapFilters from '../components/Map/MapFilters';
import { MOCK_REPORTS } from '../config/mapConfig';

const PublicMapPage = () => {
    const [filters, setFilters] = useState({ status: '', category: '' });

    const filteredReports = useMemo(() => {
        return MOCK_REPORTS.filter((r) => {
            if (filters.status && r.status !== filters.status) return false;
            if (filters.category && r.category !== filters.category) return false;
            return true;
        });
    }, [filters]);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
            <Box sx={{ px: 2, pt: 2, pb: 1 }}>
                <Typography variant="h6" fontWeight={600}>
                    Mapa zgłoszeń — Wrocław
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Publiczny podgląd aktywnych zgłoszeń. Kliknij marker, żeby zobaczyć szczegóły.
                </Typography>
            </Box>

            <Alert severity="info" sx={{ mx: 2, mb: 1 }} icon={false}>
                Dane zgłoszeń są przykładowe — docelowo pobierane z API backendu.
            </Alert>

            <Paper
                elevation={0}
                variant="outlined"
                sx={{ mx: 2, mb: 2, flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
            >
                <MapFilters
                    filters={filters}
                    onChange={setFilters}
                    totalCount={MOCK_REPORTS.length}
                    filteredCount={filteredReports.length}
                />
                <Box sx={{ flexGrow: 1 }}>
                    <ReportMap reports={filteredReports} height="100%" />
                </Box>
            </Paper>
        </Box>
    );
};

export default PublicMapPage;