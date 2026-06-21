import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
    Container, Paper, TextField, Button, Typography,
    Box, Alert, InputAdornment, IconButton, Link,
    Divider, FormHelperText,
} from '@mui/material';
import { Visibility, VisibilityOff, PersonAddOutlined } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { formatName } from '../utils/formatters';

const RegisterPage = () => {
    const [form, setForm] = useState({ email: '', phone: '', password: '', confirmPassword: '', firstName: '', lastName: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const validate = () => {
        const e = {};
        if (!form.email) e.email = 'Email jest wymagany.';
        else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Nieprawidłowy format emaila.';
        if (!form.phone) e.phone = 'Numer telefonu jest wymagany.';
        else if (!/^\+[1-9]\d{6,14}$/.test(form.phone.replace(/[\s\-().]/g, '')))
            e.phone = 'Podaj numer z kodem kierunkowym, np. +48123456789.';
        if (!form.firstName) e.firstName = 'Imię jest wymagane.';
        else if (form.firstName.length < 2) e.firstName = 'Imię musi mieć co najmniej 2 znaki.';
        if (!form.lastName) e.lastName = 'Nazwisko jest wymagane.';
        else if (form.lastName.length < 2) e.lastName = 'Nazwisko musi mieć co najmniej 2 znaki.';
        if (!form.password) e.password = 'Hasło jest wymagane.';
        else if (form.password.length < 8) e.password = 'Hasło musi mieć co najmniej 8 znaków.';
        else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(form.password))
            e.password = 'Hasło musi zawierać litery i cyfry.';
        if (form.password !== form.confirmPassword)
            e.confirmPassword = 'Hasła nie są identyczne.';
        return e;
    };

    const handleChange = (field) => (e) => {
        let value = e.target.value;
        if (field === 'firstName' || field === 'lastName') {
            value = formatName(value);
        }
        setForm((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        setLoading(true);
        try {
            const cleanPhone = form.phone.replace(/[\s\-().]/g, '');
            await register(form.email, form.password, cleanPhone, form.firstName, form.lastName);
            toast.success('Konto zostało utworzone! Sprawdź email w celu weryfikacji.');
            navigate('/dashboard');
        } catch {
            setErrors({ general: 'Nie udało się utworzyć konta. Spróbuj ponownie.' });
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
                        <PersonAddOutlined sx={{ color: 'white' }} />
                    </Box>
                    <Typography variant="h5">Utwórz konto</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Dołącz do społeczności Aktywnego Obywatela
                    </Typography>
                </Box>

                {errors.general && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {errors.general}
                    </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit} noValidate>
                    <TextField
                        fullWidth
                        label="Adres email"
                        type="email"
                        value={form.email}
                        onChange={handleChange('email')}
                        margin="normal"
                        autoComplete="email"
                        autoFocus
                        required
                        error={Boolean(errors.email)}
                        helperText={errors.email}
                    />
                    <TextField
                        fullWidth
                        label="Numer telefonu"
                        type="tel"
                        value={form.phone}
                        onChange={handleChange('phone')}
                        margin="normal"
                        autoComplete="tel"
                        required
                        error={Boolean(errors.phone)}
                        helperText={errors.phone || 'Wymagany kod kierunkowy, np. +48 123 456 789'}
                    />
                    <TextField
                        fullWidth
                        label="Imię"
                        value={form.firstName}
                        onChange={handleChange('firstName')}
                        margin="normal"
                        required
                        error={Boolean(errors.firstName)}
                        helperText={errors.firstName}
                    />
                    <TextField
                        fullWidth
                        label="Nazwisko"
                        value={form.lastName}
                        onChange={handleChange('lastName')}
                        margin="normal"
                        required
                        error={Boolean(errors.lastName)}
                        helperText={errors.lastName}
                    />
                    <TextField
                        fullWidth
                        label="Hasło"
                        type={showPassword ? 'text' : 'password'}
                        value={form.password}
                        onChange={handleChange('password')}
                        margin="normal"
                        required
                        error={Boolean(errors.password)}
                        helperText={errors.password || 'Min. 8 znaków, litery i cyfry'}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setShowPassword((v) => !v)}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                    <TextField
                        fullWidth
                        label="Potwierdź hasło"
                        type={showPassword ? 'text' : 'password'}
                        value={form.confirmPassword}
                        onChange={handleChange('confirmPassword')}
                        margin="normal"
                        required
                        error={Boolean(errors.confirmPassword)}
                        helperText={errors.confirmPassword}
                    />

                    <FormHelperText sx={{ mt: 1 }}>
                        Rejestrując się, akceptujesz przetwarzanie Twoich danych osobowych
                        zgodnie z RODO w celu obsługi zgłoszeń.
                    </FormHelperText>

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={loading}
                        sx={{ mt: 3, mb: 2 }}
                    >
                        {loading ? 'Tworzenie konta...' : 'Zarejestruj się'}
                    </Button>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2">
                            Masz już konto?{' '}
                            <Link component={RouterLink} to="/logowanie">
                                Zaloguj się
                            </Link>
                        </Typography>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default RegisterPage;