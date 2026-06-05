import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
    Container, Box, Paper, Stack, Typography, TextField, Button, Alert,
    Link, CircularProgress,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import LockResetIcon from '@mui/icons-material/LockReset';
import { emailSchema, passwordSchema } from '../utils/reportSchemas';
import toast from 'react-hot-toast';

// WF-07: reset hasła w dwóch krokach.
// Ekran 1: użytkownik podaje email → wysyłamy link resetujący.
// Ekran 2 (gdy w URL jest ?token=...): formularz nowego hasła.
// Po backendzie odpalamy authService.requestPasswordReset / authService.confirmPasswordReset.

const PasswordResetPage = () => {
    const navigate = useNavigate();
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    // --- Ekran potwierdzenia resetu (z tokenem z maila) ---
    if (token) {
        return <ConfirmResetForm token={token} onDone={() => navigate('/logowanie')} />;
    }

    // --- Ekran zgłoszenia prośby o reset ---
    return <RequestResetForm />;
};

// Krok 1: prośba o link resetujący
const RequestResetForm = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        const result = emailSchema.safeParse(email);
        if (!result.success) {
            setError(result.error.issues[0].message);
            return;
        }
        setError('');
        setLoading(true);

        // TODO: authService.requestPasswordReset(email)
        // WNF-14: zawsze zwracamy sukces, niezależnie czy email jest w bazie
        // (żeby nie ujawniać, które konta istnieją).
        await new Promise((r) => setTimeout(r, 600));

        setLoading(false);
        setSent(true);
    };

    if (sent) {
        return (
            <CenteredContainer>
                <Paper sx={{ p: 4, textAlign: 'center', maxWidth: 440, mx: 'auto' }}>
                    <MarkEmailReadIcon sx={{ fontSize: 56, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                        Sprawdź swoją skrzynkę
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Jeśli konto o adresie <strong>{email}</strong> istnieje,
                        wysłaliśmy na nie link do zresetowania hasła.
                        Link wygasa po 24 godzinach.
                    </Typography>
                    <Button fullWidth variant="contained" component={RouterLink} to="/logowanie">
                        Wróć do logowania
                    </Button>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                        Nie dostałeś maila? Sprawdź folder SPAM albo{' '}
                        <Link component="button" type="button" onClick={() => setSent(false)}>
                            spróbuj ponownie
                        </Link>
                        .
                    </Typography>
                </Paper>
            </CenteredContainer>
        );
    }

    return (
        <CenteredContainer>
            <Paper sx={{ p: 4, maxWidth: 440, mx: 'auto' }}>
                <Stack spacing={2} sx={{ mb: 2 }} alignItems="center">
                    <LockResetIcon sx={{ fontSize: 48, color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight={700}>
                        Zresetuj hasło
                    </Typography>
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                        Podaj adres email powiązany z kontem.
                        Wyślemy link do ustawienia nowego hasła.
                    </Typography>
                </Stack>

                <Box component="form" onSubmit={submit}>
                    <TextField
                        fullWidth
                        label="Adres email"
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError(''); }}
                        error={Boolean(error)}
                        helperText={error}
                        autoComplete="email"
                        autoFocus
                        InputProps={{
                            startAdornment: <EmailIcon fontSize="small" color="action" sx={{ mr: 1 }} />,
                        }}
                        sx={{ mb: 2 }}
                    />
                    <Button
                        fullWidth
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
                    >
                        {loading ? 'Wysyłam…' : 'Wyślij link resetujący'}
                    </Button>
                </Box>

                <Typography variant="caption" color="text.secondary" sx={{ mt: 3, display: 'block', textAlign: 'center' }}>
                    Pamiętasz hasło?{' '}
                    <Link component={RouterLink} to="/logowanie">
                        Wróć do logowania
                    </Link>
                </Typography>
            </Paper>
        </CenteredContainer>
    );
};

// Krok 2: ustawienie nowego hasła (po kliknięciu w link z maila)
const ConfirmResetForm = ({ token, onDone }) => {
    const [pwd, setPwd] = useState({ next: '', confirm: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        const errs = {};
        const r = passwordSchema.safeParse(pwd.next);
        if (!r.success) errs.next = r.error.issues[0].message;
        if (pwd.next !== pwd.confirm) errs.confirm = 'Hasła muszą być takie same.';
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }
        setErrors({});
        setLoading(true);

        // TODO: authService.confirmPasswordReset(token, pwd.next)
        await new Promise((r) => setTimeout(r, 600));

        setLoading(false);
        toast.success('Hasło zostało zmienione. Możesz się zalogować.');
        onDone();
    };

    return (
        <CenteredContainer>
            <Paper sx={{ p: 4, maxWidth: 440, mx: 'auto' }}>
                <Stack spacing={2} sx={{ mb: 2 }} alignItems="center">
                    <LockResetIcon sx={{ fontSize: 48, color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight={700}>
                        Ustaw nowe hasło
                    </Typography>
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                        Wprowadź i potwierdź nowe hasło do swojego konta.
                    </Typography>
                </Stack>

                {!token && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        Brak tokenu resetującego. Kliknij ponownie w link z maila.
                    </Alert>
                )}

                <Box component="form" onSubmit={submit}>
                    <Stack spacing={2}>
                        <TextField
                            fullWidth
                            label="Nowe hasło"
                            type="password"
                            value={pwd.next}
                            onChange={(e) => { setPwd({ ...pwd, next: e.target.value }); setErrors({ ...errors, next: '' }); }}
                            error={Boolean(errors.next)}
                            helperText={errors.next || 'Minimum 8 znaków, musi zawierać literę i cyfrę.'}
                            autoComplete="new-password"
                        />
                        <TextField
                            fullWidth
                            label="Powtórz nowe hasło"
                            type="password"
                            value={pwd.confirm}
                            onChange={(e) => { setPwd({ ...pwd, confirm: e.target.value }); setErrors({ ...errors, confirm: '' }); }}
                            error={Boolean(errors.confirm)}
                            helperText={errors.confirm}
                            autoComplete="new-password"
                        />
                        <Button
                            fullWidth
                            type="submit"
                            variant="contained"
                            disabled={loading || !token}
                            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
                        >
                            {loading ? 'Zapisuję…' : 'Zapisz nowe hasło'}
                        </Button>
                    </Stack>
                </Box>
            </Paper>
        </CenteredContainer>
    );
};

const CenteredContainer = ({ children }) => (
    <Container maxWidth="sm" sx={{ py: { xs: 4, sm: 8 }, minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
        <Box sx={{ width: '100%' }}>{children}</Box>
    </Container>
);

export default PasswordResetPage;
