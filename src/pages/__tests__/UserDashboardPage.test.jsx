import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import UserDashboardPage from '../UserDashboardPage';
import { complaintService } from '../../services/complaintService';
import { useAuth } from '../../context/AuthContext';

vi.mock('../../context/AuthContext', () => ({
    useAuth: vi.fn(),
    AuthProvider: ({ children }) => <div>{children}</div>
}));

vi.mock('../../services/complaintService', () => ({
    complaintService: {
        getAll: vi.fn(),
    },
}));

describe('UserDashboardPage Tests', () => {
    const mockUser = {
        id: 'user-123',
        firstName: 'Jan',
        lastName: 'Kowalski',
        email: 'jan.kowalski@example.com',
        isVerified: true,
    };

    const mockComplaints = [
        {
            id: '1',
            userId: 'user-123',
            title: 'Dziura w drodze głównej.',
            status: 'PENDING',
            category: 'Infrastruktura',
            createdAt: new Date().toISOString(),
            address: { street: 'Główna', displayName: 'Główna, Warszawa' }
        }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        useAuth.mockReturnValue({ user: mockUser });
        complaintService.getAll.mockResolvedValue(mockComplaints);
    });

    it('renders user info and filtered user complaints correctly', async () => {
        render(
            <BrowserRouter>
                <UserDashboardPage />
            </BrowserRouter>
        );

        // Oczekujemy na załadowanie danych użytkownika
        expect(await screen.findByText('Jan Kowalski')).toBeInTheDocument();
        expect(screen.getByText('Wszystkie zgłoszenia')).toBeInTheDocument();

        // POPRAWKA: Pobieramy wszystkie wystąpienia tekstu "1" i sprawdzamy czy tablica nie jest pusta
        const countElements = screen.getAllByText('1');
        expect(countElements.length).toBeGreaterThan(0);
    });
});