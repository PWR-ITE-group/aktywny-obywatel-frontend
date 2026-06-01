import { useState } from 'react';
import {
    Container, Box, Tabs, Tab, Paper, Stack, Typography, TextField, Button,
    Switch, FormControlLabel, Dialog, DialogTitle, DialogContent, DialogActions,
    DialogContentText, Alert, Divider,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { emailSchema, passwordSchema } from '../utils/reportSchemas';
import { userService } from '../services/userService';
import { authService } from '../services/authService';

// WF-13: wybór kanałów powiadomień. WF-14: edycja danych konta.
// WF-17: żądanie usunięcia konta (dane usuwane po zamknięciu zgłoszeń).

const ProfileSettingsPage = () => {
    const { user } = useAuth();
    const [tab, setTab] = useState(0);

    return (
        <Container maxWidth="md" sx={{ py: 3 }}>
            <Typography variant="h5" fontWeight={700} gutterBottom>
                Ustawienia konta
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Zarządzaj swoim kontem, powiadomieniami i prywatnością.
            </Typography>

            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2, '& .MuiTab-root': { textTransform: 'none' } }}>
                <Tab label="Dane konta" />
                <Tab label="Powiadomienia" />
                <Tab label="Prywatność" />
            </Tabs>

            {tab === 0 && <AccountDataTab user={user} />}
            {tab === 1 && <NotificationsTab />}
            {tab === 2 && <PrivacyTab />}
        </Container>
    );
};

// --- Tab 1: Dane konta (WF-14) ---
const AccountDataTab = ({ user }) => {
    const [form, setForm] = useState({
        email: user?.email ?? '',
        firstName: user?.firstName ?? '',
        lastName: user?.lastName ?? '',
        phone: user?.phone ?? '',
    });
    const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' });
    const [errors, setErrors] = useState({});
    const [profileLoading, setProfileLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);

    const saveProfile = async () => {
        const emailResult = emailSchema.safeParse(form.email);
        if (!emailResult.success) {
            setErrors({ email: emailResult.error.issues[0].message });
            return;
        }
        setErrors({});
        setProfileLoading(true);
        try {
            await userService.updateProfile(form);
            toast.success('Zapisano dane konta.');
        } catch (err) {
            toast.error('Nie udało się zapisać danych konta.');
            console.error(err);
        } finally {
            setProfileLoading(false);
        }
    };

    const changePassword = async () => {
        const errs = {};
        const nextResult = passwordSchema.safeParse(pwd.next);
        if (!nextResult.success) errs.next = nextResult.error.issues[0].message;
        if (pwd.next !== pwd.confirm) errs.confirm = 'Hasła muszą być takie same.';
        if (!pwd.current) errs.current = 'Wpisz aktualne hasło.';
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }
        setErrors({});
        setPasswordLoading(true);
        try {
            await authService.changePassword(pwd.current, pwd.next);
            toast.success('Hasło zmienione.');
            setPwd({ current: '', next: '', confirm: '' });
        } catch (err) {
            toast.error('Nie udało się zmienić hasła.');
            console.error(err);
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <Stack spacing={2.5}>
            <Paper sx={{ p: 2.5 }}>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                    Dane osobowe
                </Typography>
                <Stack spacing={2}>
                    <TextField
                        label="Adres email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        error={Boolean(errors.email)}
                        helperText={errors.email}
                        fullWidth
                    />
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <TextField
                            label="Imię"
                            value={form.firstName}
                            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="Nazwisko"
                            value={form.lastName}
                            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                            fullWidth
                        />
                    </Stack>
                    <TextField
                        label="Telefon (opcjonalnie)"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        fullWidth
                    />
                    <Box>
                        <Button variant="contained" onClick={saveProfile} disabled={profileLoading}>
                            {profileLoading ? 'Zapisywanie...' : 'Zapisz zmiany'}
                        </Button>
                    </Box>
                </Stack>
            </Paper>

            <Paper sx={{ p: 2.5 }}>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                    Zmiana hasła
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                    Minimum 8 znaków, musi zawierać literę i cyfrę.
                </Typography>
                <Stack spacing={2}>
                    <TextField
                        label="Aktualne hasło"
                        type="password"
                        value={pwd.current}
                        onChange={(e) => setPwd({ ...pwd, current: e.target.value })}
                        error={Boolean(errors.current)}
                        helperText={errors.current}
                        fullWidth
                    />
                    <TextField
                        label="Nowe hasło"
                        type="password"
                        value={pwd.next}
                        onChange={(e) => setPwd({ ...pwd, next: e.target.value })}
                        error={Boolean(errors.next)}
                        helperText={errors.next}
                        fullWidth
                    />
                    <TextField
                        label="Powtórz nowe hasło"
                        type="password"
                        value={pwd.confirm}
                        onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })}
                        error={Boolean(errors.confirm)}
                        helperText={errors.confirm}
                        fullWidth
                    />
                    <Box>
                        <Button variant="outlined" onClick={changePassword} disabled={passwordLoading}>
                            {passwordLoading ? 'Zmienianie...' : 'Zmień hasło'}
                        </Button>
                    </Box>
                </Stack>
            </Paper>
        </Stack>
    );
};

// --- Tab 2: Powiadomienia (WF-13) ---
const NotificationsTab = () => {
    const [channels, setChannels] = useState({
        email: true,
        push: true,
        inApp: true,
    });
    const [events, setEvents] = useState({
        statusChange: true,   // WF-12
        authorityReply: true,
        weeklyDigest: false,
    });
    const [saving, setSaving] = useState(false);

    const save = async () => {
        setSaving(true);
        try {
            await userService.updateNotificationPreferences({ channels, events });
            toast.success('Zapisano ustawienia powiadomień.');
        } catch (err) {
            toast.error('Nie udało się zapisać ustawień powiadomień.');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Paper sx={{ p: 2.5 }}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                Kanały powiadomień
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                Wybierz przez jakie kanały chcesz otrzymywać powiadomienia.
                Email jest domyślny i nie można go wyłączyć dla ważnych zdarzeń (fallback WNF-10).
            </Typography>
            <Stack>
                <FormControlLabel
                    control={<Switch checked={channels.email} disabled />}
                    label="Email"
                />
                <FormControlLabel
                    control={
                        <Switch
                            checked={channels.push}
                            onChange={(e) => setChannels({ ...channels, push: e.target.checked })}
                        />
                    }
                    label="Powiadomienia push (przeglądarka)"
                />
                <FormControlLabel
                    control={
                        <Switch
                            checked={channels.inApp}
                            onChange={(e) => setChannels({ ...channels, inApp: e.target.checked })}
                        />
                    }
                    label="Powiadomienia w aplikacji"
                />
            </Stack>

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                Zdarzenia
            </Typography>
            <Stack>
                <FormControlLabel
                    control={
                        <Switch
                            checked={events.statusChange}
                            onChange={(e) => setEvents({ ...events, statusChange: e.target.checked })}
                        />
                    }
                    label="Zmiana statusu mojego zgłoszenia"
                />
                <FormControlLabel
                    control={
                        <Switch
                            checked={events.authorityReply}
                            onChange={(e) => setEvents({ ...events, authorityReply: e.target.checked })}
                        />
                    }
                    label="Odpowiedź z urzędu"
                />
                <FormControlLabel
                    control={
                        <Switch
                            checked={events.weeklyDigest}
                            onChange={(e) => setEvents({ ...events, weeklyDigest: e.target.checked })}
                        />
                    }
                    label="Cotygodniowe podsumowanie mojej aktywności"
                />
            </Stack>

            <Box sx={{ mt: 3 }}>
                <Button variant="contained" onClick={save} disabled={saving}>
                    {saving ? 'Zapisywanie...' : 'Zapis preferencje'}
                </Button>
            </Box>
        </Paper>
    );
};

// --- Tab 3: Prywatność i usunięcie konta (WF-17) ---
const PrivacyTab = () => {
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const [deletionLoading, setDeletionLoading] = useState(false);

    const requestDeletion = async () => {
        setDeletionLoading(true);
        try {
            await userService.requestAccountDeletion();
            toast.success('Prośba o usunięcie konta została zarejestrowana.');
            setConfirmOpen(false);
            setConfirmText('');
        } catch (err) {
            toast.error('Nie udało się wysłać prośby o usunięcie konta.');
            console.error(err);
        } finally {
            setDeletionLoading(false);
        }
    };

    return (
        <>
            <Stack spacing={2.5}>
                <Paper sx={{ p: 2.5 }}>
                    <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                        Twoje dane (RODO)
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Przetwarzamy Twoje dane wyłącznie w celu obsługi zgłoszeń. Szczegóły
                        w polityce prywatności. Masz prawo do wglądu, sprostowania i usunięcia
                        swoich danych.
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                        <Button variant="outlined" disabled>
                            Pobierz moje dane (przygotowujemy)
                        </Button>
                    </Box>
                </Paper>

                <Paper sx={{ p: 2.5, borderLeft: '3px solid', borderColor: 'error.main' }}>
                    <Typography variant="subtitle1" fontWeight={700} color="error.main" gutterBottom>
                        Usunięcie konta
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Po zgłoszeniu prośby Twoje konto zostanie usunięte po zamknięciu
                        wszystkich aktywnych zgłoszeń. Ta operacja jest nieodwracalna.
                    </Typography>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={() => setConfirmOpen(true)}
                    >
                        {deletionLoading ? 'Wysyłanie...' : 'Usuń moje konto'}
                    </Button>
                </Paper>
            </Stack>

            <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Potwierdź usunięcie konta</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        Operacja jest nieodwracalna. Aby potwierdzić wpisz słowo <strong>USUŃ</strong>.
                    </DialogContentText>
                    <TextField
                        fullWidth
                        autoFocus
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder="USUŃ"
                    />
                    <Alert severity="warning" sx={{ mt: 2 }}>
                        Dane zostaną usunięte dopiero po zamknięciu aktywnych zgłoszeń,
                        zgodnie z WF-17.
                    </Alert>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmOpen(false)}>Anuluj</Button>
                    <Button
                        color="error"
                        variant="contained"
                        disabled={confirmText !== 'USUŃ'}
                        onClick={requestDeletion}
                    >
                        Potwierdź usunięcie
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ProfileSettingsPage;
