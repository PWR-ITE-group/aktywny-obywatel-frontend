import { useAuth } from '../context/AuthContext';
import {
  Container,
  Box,
  Typography,
  Paper,
  Stack,
  Divider,
} from '@mui/material';

const UserProfilePage = () => {
  const { user, loading } = useAuth();

  // Debug: log user object to see its shape
  console.log('User object in UserProfilePage:', user);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <Typography variant="body2">Ładowanie...</Typography>
        </Box>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <Typography variant="body2">Nie jesteś zalogowany.</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        Moje konto
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Stack spacing={3}>
          <Typography variant="h5" fontWeight={500}>
            Dane osobowe
          </Typography>
          <Divider sx={{ my: 1 }} />
          <Stack spacing={2}>
            <Box>
              <Typography variant="body2" fontWeight={500}>
                Imię:
              </Typography>
              <Typography variant="body2">
                {user.firstName || '-'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" fontWeight={500}>
                Nazwisko:
              </Typography>
              <Typography variant="body2">
                {user.lastName || '-'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" fontWeight={500}>
                Adres e-mail:
              </Typography>
              <Typography variant="body2">
                {user.email || '-'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" fontWeight={500}>
                Numer telefonu:
              </Typography>
              <Typography variant="body2">
                {user.phone || user.phoneNumber || '-'}
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  );
};

export default UserProfilePage;