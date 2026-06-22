// src/pages/__tests__/AplikacjePage.test.jsx
// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AplikacjePage from '../AplikacjePage';
import { useAuth } from '../../context/AuthContext';
import { complaintService } from '../../services/complaintService';

vi.mock('../../context/AuthContext', () => ({
    useAuth: vi.fn()
}));

vi.mock('react-router-dom', () => ({
    Link: ({ children, to }) => <a href={to}>{children}</a>
}));

vi.mock('../../services/complaintService', () => {
    const serviceMock = {
        getUserComplaints: vi.fn()
    };
    return {
        default: serviceMock,
        complaintService: serviceMock
    };
});

describe('AplikacjePage Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders page layout and header when user is logged in', () => {
        useAuth.mockReturnValue({ user: { id: 1, email: 'test@user.pl' } });
        complaintService.getUserComplaints.mockResolvedValue([]);

        render(<AplikacjePage />);

        // Sprawdzamy czy główny nagłówek strony renderuje się prawidłowo
        expect(screen.getByText(/Moje aplikacje/i)).toBeInTheDocument();
    });

    it('renders list of user reports successfully after loading', async () => {
        useAuth.mockReturnValue({ user: { id: 1, email: 'test@user.pl' } });

        // Zwracamy listę zgłoszeń pasującą do struktury widocznej w Twoim logu HTML
        complaintService.getUserComplaints.mockResolvedValue([
            { id: 1, title: 'Dziura w jezdni', status: 'w realizacji', category: 'Drogi i chodniki' },
            { id: 2, title: 'Uszkodzona latarnia', status: 'złożone', category: 'Oświetlenie' }
        ]);

        render(<AplikacjePage />);

        // Czekamy na wyrenderowanie elementów asynchronicznych
        await waitFor(() => {
            expect(screen.getByText('Dziura w jezdni')).toBeInTheDocument();
        });

        expect(screen.getByText('Uszkodzona latarnia')).toBeInTheDocument();
    });
});