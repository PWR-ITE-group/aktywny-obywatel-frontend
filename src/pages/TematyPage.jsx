import { Box, Typography, Container, Grid, Paper } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { MOCK_REPORTS } from '../config/mapConfig';

const TematyPage = () => {
  const { user } = useAuth();
  const [categoryStats, setCategoryStats] = useState({});

  useEffect(() => {
    if (!user) return;

    // Calculate stats from mock reports (in real app, from API)
    const stats = {};
    MOCK_REPORTS.forEach(report => {
      const cat = report.category;
      stats[cat] = (stats[cat] || 0) + 1;
    });
    setCategoryStats(stats);
  }, [user]);

  if (!user) {
    return (
      <Container sx={{ py: 8 }}>
        <Typography variant="h5" align="center">
          Tematy
        </Typography>
        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
          Zaloguj się, aby zobaczyć statystyki według kategorii.
        </Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Statystyki według kategorii
      </Typography>
      <Grid container spacing={3}>
        {Object.entries(categoryStats).map(([category, count]) => (
          <Grid item xs={12} sm={6} md={4} key={category}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h5" color="primary.main">
                {count}
              </Typography>
              <Typography variant="body2">
                {category}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default TematyPage;