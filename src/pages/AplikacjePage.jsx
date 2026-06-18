import { useAuth } from '../context/AuthContext';
import { Box, Typography, CircularProgress, Container } from '@mui/material';
import { useEffect, useState } from 'react';
import { complaintService } from '../services/complaintService';
import { BACKEND_CATEGORY_TO_LABEL } from '../config/reportCategories';

const AplikacjePage = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Fetch user's reports from API
    const fetchReports = async () => {
      try {
        setLoading(true);
        // For now, we'll use mock data since we don't have a real API endpoint
        // In a real app, this would be: const data = await complaintService.getUserReports();
        const mockReports = [
          {
            id: 1,
            title: 'Dziura w jezdni',
            category: 'Drogi i chodniki',
            status: 'w realizacji',
            createdAt: '2026-04-10'
          },
          {
            id: 2,
            title: 'Uszkodzona latarnia',
            category: 'Oświetlenie',
            status: 'złożone',
            createdAt: '2026-04-15'
          }
        ];
        setReports(mockReports);
      } catch (error) {
        console.error('Error fetching user reports:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [user]);

  if (loading) {
    return (
      <Container sx={{ py: 8 }}>
        <Typography variant="h5" align="center">
          Aplikacje
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
        Moje aplikacje
      </Typography>
      {reports.length === 0 ? (
        <Typography variant="body2" textAlign="center" sx={{ py: 4 }}>
          Nie masz jeszcze żadnych zgłoszeń.
          <br />
          <a href="/nowe-zgloszenie" sx={{ color: 'primary.main' }}>
            Zgłoś swój pierwszy problem
          </a>
        </Typography>
      ) : (
        <Box>
          {reports.map(report => (
            <Box key={report.id} sx={{ border: '1px solid', borderRadius: 2, p: 3, mb: 2 }}>
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
          ))}
        </Box>
      )}
    </Container>
  );
};

export default AplikacjePage;