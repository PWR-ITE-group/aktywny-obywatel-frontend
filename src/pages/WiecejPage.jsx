import { Box, Typography, Container, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import InfoIcon from '@mui/icons-material/Info';
import HelpIcon from '@mui/icons-material/Help';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';

const WiecejPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return (
      <Container sx={{ py: 8 }}>
        <Typography variant="h5" align="center">
          Więcej
        </Typography>
        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
          Zaloguj się, aby zobaczyć więcej opcji.
        </Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Więcej opcji
      </Typography>
      <List>
        <ListItem button onClick={() => navigate('/ustawienia')}>
          <ListItemIcon><SettingsIcon /></ListItemIcon>
          <ListItemText primary="Ustawienia konta" />
        </ListItem>
        <ListItem button onClick={() => navigate('/dashboard')}>
          <ListItemIcon><PersonIcon /></ListItemIcon>
          <ListItemText primary="Moje zgłoszenia" />
        </ListItem>
        <ListItem button onClick={() => navigate('/mapa')}>
          <ListItemIcon><InfoIcon /></ListItemIcon>
          <ListItemText primary="Informacje o aplikacji" />
        </ListItem>
        <ListItem button onClick={() => navigate('/logowanie')}>
          <ListItemIcon><HelpIcon /></ListItemIcon>
          <ListItemText primary="Pomoc i wsparcie" />
        </ListItem>
        <Divider />
        <ListItem button onClick={handleLogout}>
          <ListItemIcon><LogoutIcon /></ListItemIcon>
          <ListItemText primary="Wyloguj się" />
        </ListItem>
      </List>
    </Container>
  );
};

export default WiecejPage;