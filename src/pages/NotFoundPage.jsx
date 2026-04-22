// NotFoundPage.jsx
import { Container, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
const NotFoundPage = () => (
    <Container maxWidth="sm" sx={{ py: 10, textAlign: 'center' }}>
        <Typography variant="h1" color="primary" fontWeight={700}>404</Typography>
        <Typography variant="h5" gutterBottom>Strona nie istnieje</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
            Sprawdź adres URL lub wróć na stronę główną.
        </Typography>
        <Button variant="contained" component={RouterLink} to="/">
            Strona główna
        </Button>
    </Container>
);
export default NotFoundPage;