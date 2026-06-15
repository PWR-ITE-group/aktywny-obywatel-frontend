import { useState } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
    Container, Paper, TextField, Button, Typography,
    Box, Alert, InputAdornment, IconButton, Link, Divider,
} from '@mui/material';
import { Visibility, VisibilityOff, LockOutlined } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Po zalogowaniu wróć tam skąd przyszedł użytkownik, albo na dashboard
    // Jeśli przeniesiono kategorię prewypełnioną, przekaż ją dalej
    const from = location.state?.from?.pathname || '/dashboard';
    const prefilledCategory = location.state?.prefilledCategory || null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Wypełnij wszystkie pola.');
            return;
        }
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            toast.success('Zalogowano pomyślnie!');
            // Jeśli istnieje prefilledCategory z logowania przez chip, przekaż ją do formularza zgłoszenia
            if (prefilledCategory) {
                navigate('/nowe-zgloszenie', {
                    state: { prefilledCategory },
                    replace: true
                });
            } else {
                navigate(from, { replace: true });
            }
        } catch (err) {
            console.log(err);
            const msg = err.response?.data?.message || err.message || 'Błąd logowania';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ py: 8 }}>
            <Paper elevation={0} variant="outlined" sx={{ p: { xs: 3, sm: 5 } }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                    <Box
                        sx={{
                            bgcolor: 'primary.main',
                            borderRadius: '50%',
                            p: 1.5,
                            mb: 2,
                            display: 'flex',
                        }}
                    >
                        <LockOutlined sx={{ color: 'white' }} />
                    </Box>
                    <Typography variant="h5">Zaloguj się</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Platforma zgłoszeń Aktywny Obywatel
                    </Typography>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit} noValidate>
                    <TextField
                        fullWidth
                        label="Adres email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        margin="normal"
                        autoComplete="email"
                        autoFocus
                        required
                    />
                    <TextField
                        fullWidth
                        label="Hasło"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        margin="normal"
                        autoComplete="current-password"
                        required
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setShowPassword((v) => !v)}
                                        edge="end"
                                        aria-label="pokaż hasło"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5 }}>
                        <Link component={RouterLink} to="/reset-hasla" variant="body2">
                            Zapomniałeś hasła?
                        </Link>
                    </Box>

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={loading}
                        sx={{ mt: 3, mb: 2 }}
                    >
                        {loading ? 'Logowanie...' : 'Zaloguj się'}
                    </Button>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2">
                            Nie masz konta?{' '}
                            <Link component={RouterLink} to="/rejestracja">
                                Zarejestruj się
                            </Link>
                        </Typography>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default LoginPage;