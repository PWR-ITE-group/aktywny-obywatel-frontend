import { Container, Typography, Box, Card, CardContent, Grid, Chip, Button } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useAuth } from '../context/AuthContext';

const UserDashboardPage = () => {
    const { user } = useAuth();

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h5" fontWeight={600}>
                        Moje zgłoszenia
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Witaj, {user?.email}
                    </Typography>
                </Box>
                <Button variant="contained" startIcon={<AddCircleOutlineIcon />}>
                    Nowe zgłoszenie
                </Button>
            </Box>

            {/* Placeholder — lista zgłoszeń */}
            <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center', py: 6 }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        Nie masz jeszcze żadnych zgłoszeń
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Kliknij "Nowe zgłoszenie" żeby zgłosić problem w Twoim mieście
                    </Typography>
                    <Button variant="contained" startIcon={<AddCircleOutlineIcon />}>
                        Złóż pierwsze zgłoszenie
                    </Button>
                </CardContent>
            </Card>
        </Container>
    );
};

export default UserDashboardPage;