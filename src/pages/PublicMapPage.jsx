import { Container, Typography, Box, Paper, Alert } from '@mui/material';
import MapIcon from '@mui/icons-material/Map';

const PublicMapPage = () => {
    return (
        <Container maxWidth="xl" sx={{ py: 3 }}>
            <Typography variant="h5" gutterBottom fontWeight={600}>
                Mapa zgłoszeń — Wrocław
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
                Mapa jest dostępna bez logowania. Kliknij marker, żeby zobaczyć szczegóły zgłoszenia.
            </Alert>
            <Paper
                variant="outlined"
                sx={{
                    height: '70vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'grey.50',
                }}
            >
                <MapIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                    Mapa Google Maps — wkrótce
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Integracja zostanie dodana w następnym kroku
                </Typography>
            </Paper>
        </Container>
    );
};

export default PublicMapPage;