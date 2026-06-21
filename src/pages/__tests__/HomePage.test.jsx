// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import HomePage from '../HomePage';
import { useNavigate } from 'react-router-dom';

// Mockowanie react-router-dom
vi.mock('react-router-dom', () => ({
    useNavigate: vi.fn()
}));

// Mockowanie komponentów dzieci, aby uprościć test jednostkowy HomePage
vi.mock('../../components/Home/RecentReportsCarousel', () => ({
    default: () => <div data-testid="mock-carousel">Karuzela zgłoszeń</div>
}));

vi.mock('../../components/Home/HomeCategoryChips', () => ({
    default: () => <div data-testid="mock-categories">Kategorie</div>
}));

describe('HomePage Component', () => {
    const mockNavigate = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        useNavigate.mockReturnValue(mockNavigate);
        // Wywłaszczamy globalny alert, aby nie blokował środowiska testowego
        global.alert = vi.fn();
    });

    it('renders all structural parts including background layouts and child modules', () => {
        render(<HomePage />);

        expect(screen.getByText('Zgłoś problem')).toBeInTheDocument();
        expect(screen.getByTestId('mock-carousel')).toBeInTheDocument();
        expect(screen.getByTestId('mock-categories')).toBeInTheDocument();
    });

    it('triggers navigation hook when big floating action button is pressed', async () => {
        const user = userEvent.setup();
        render(<HomePage />);

        const reportBtn = screen.getByRole('button', { name: /Zgłoś problem/i });
        await user.click(reportBtn);

        expect(mockNavigate).toHaveBeenCalledWith('/nowe-zgloszenie');
    });

    it('triggers browser system alerts on top panel icon action clicks', async () => {
        const user = userEvent.setup();
        render(<HomePage />);

        // Zamiast wyszukiwać po klasach ikon, używamy bezpiecznego getAllByRole
        const topButtons = screen.getAllByRole('button');

        // Klikamy w pierwszy przycisk (Tarcza bezpieczeństwa)
        await user.click(topButtons[0]);
        expect(global.alert).toHaveBeenCalledWith(expect.stringContaining('Tarcza bezpieczeństwa'));

        // Klikamy w drugi przycisk (Powiadomienia)
        await user.click(topButtons[1]);
        expect(global.alert).toHaveBeenCalledWith(expect.stringContaining('Powiadomienia'));
    });
});