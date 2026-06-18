import { Box, Typography, Container, Card, CardContent, Stack } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { MOCK_REPORTS } from '../config/mapConfig';
import { BACKEND_CATEGORY_TO_LABEL } from '../config/reportCategories';

const UlubionePage = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // In a real app, this would fetch from API
    // For now, using mock data
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        // Mock favorite reports
        const mockFavorites = [
          {
            id: 1,
            title: 'Dziura w jezdni',
            category: 'Drogi i chodniki',
            status: 'w realizacji',
            createdAt: '2026-04-10',
            lat: 51.1079,
            lng: 17.0385
          },
          {
            id: 3,
            title: 'Połamane drzewo',
            category: 'Zieleń miejska',
            status: 'przyjęte',
            createdAt: '2026-04-18',
            lat: 51.1021,
            lng: 17.0331
          }
        ];
        setFavorites(mockFavorites);
      } catch (error) {
        console.error('Error fetching favorites:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user]);

  const toggleFavorite = (reportId) => {
    setFavorites(prev =>
      prev.some(fav => fav.id === reportId)
        ? prev.filter(fav => fav.id !== reportId)
        : [...prev, MOCK_REPORTS.find(r => r.id === reportId)]
    );
  };

  if (!user) {
    return (
      <Container sx={{ py: 8 }}>
        <Typography variant="h5" align="center">
          Ulubione
        </Typography>
        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
          Zaloguj się, aby zobaczyć swoje ulubione zgłoszenia.
        </Typography>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container sx={{ py: 8 }}>
        <Typography variant="h5" align="center">
          Ulubione
        </Typography>
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Ulubione zgłoszenia
      </Typography>
      {favorites.length === 0 ? (
        <Typography variant="body2" textAlign="center" sx={{ py: 4 }}>
          Nie masz jeszcze ulubionych zgłoszeń.
          <br />
          <a href="/mapa" sx={{ color: 'primary.main' }}>
            Przeglądaj zgłoszenia i dodaj pierwsze do ulubionych
          </a>
        </Typography>
      ) : (
        <Box>
          {favorites.map(report => (
            <Card key={report.id} sx={{ mb: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" fontWeight={600}>
                      {report.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Kategoria: {BACKEND_CATEGORY_TO_LABEL[report.category] ?? report.category} | Status: {report.status}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Zgłoszono: {report.createdAt}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <FavoriteIcon
                      color="error"
                      sx={{ fontSize: 24, cursor: 'pointer' }}
                      onClick={() => toggleFavorite(report.id)}
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Container>
  );
};

export default UlubionePage;