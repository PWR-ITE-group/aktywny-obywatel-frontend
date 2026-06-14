import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { Container, Paper, Box, Typography, CircularProgress, Button, Alert } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import api from '../config/api';

const VerificationPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [status, setStatus] = useState('loading'); // loading | success | error
    const [message, setMessage] = useState('');
    const lastAttemptedTokenRef = useRef(null);

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Brak tokenu weryfikacyjnego w adresie URL.');
            return;
        }

        // Prevent multiple verification attempts with the same token
        if (lastAttemptedTokenRef.current === token) {
            return;
        }

        lastAttemptedTokenRef.current = token;

        api.post(`/api/auth/verify?token=${token}`)
            .then(() => {
                setStatus('success');
                // Przekieruj do logowania po 3 sekundach
                setTimeout(() => navigate('/logowanie'), 3000);
            })
            .catch((error) => {
                setStatus('error');
                const msg = error.response?.data?.message;
                if (msg?.toLowerCase().includes('expir') || msg?.toLowerCase().includes('wygasł')) {
                    setMessage('Link weryfikacyjny wygasł. Zarejestruj się ponownie.');
                } else {
                    setMessage(msg || 'Link weryfikacyjny jest nieprawidłowy lub wygasł.');
                }
            });
    }, [token, navigate]);

    return (
        <Container maxWidth="sm" sx={{ py: 8 }}>
            <Paper elevation={0} variant="outlined" sx={{ p: { xs: 3, sm: 5 }, textAlign: 'center' }}>
                {status === 'loading' && (
                    <Box>
                        <CircularProgress sx={{ mb: 3 }} />
                        <Typography variant="h6">Weryfikacja konta…</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Trwa potwierdzanie adresu email.
                        </Typography>
                    </Box>
                )}

                {status === 'success' && (
                    <Box>
                        <CheckCircleOutlineIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                        <Typography variant="h6" gutterBottom>
                            Konto zostało zweryfikowane!
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Za chwilę zostaniesz przekierowany do strony logowania…
                        </Typography>
                        <Button variant="contained" component={RouterLink} to="/logowanie">
                            Zaloguj się teraz
                        </Button>
                    </Box>
                )}

                {status === 'error' && (
                    <Box>
                        <ErrorOutlineIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
                        <Typography variant="h6" gutterBottom>
                            Weryfikacja nie powiodła się
                        </Typography>
                        <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
                            {message}
                        </Alert>
                        <Button variant="contained" component={RouterLink} to="/register">
                            Zarejestruj się ponownie
                        </Button>
                    </Box>
                )}
            </Paper>
        </Container>
    );
};

export default VerificationPage;