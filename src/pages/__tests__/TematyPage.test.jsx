import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import TematyPage from '../TematyPage';
import { useAuth } from '../../context/AuthContext';

// Mockujemy hook useAuth
vi.mock('../../context/AuthContext', () => ({
    useAuth: vi.fn()
}));

// Mockujemy stałe z raportami, żeby mieć pełną kontrolę nad danymi testowymi
vi.mock('../../config/mapConfig', () => ({
    MOCK_REPORTS: [
        { id: 1, category: 'roads' },
        { id: 2, category: 'roads' },
        { id: 3, category: 'greenery' }
    ]
}));

describe('TematyPage Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // 1. Test dla niezalogowanego użytkownika (pokrywa pierwszy return i warunek guard clause)
    it('powinien wyswietlic komunikat o koniecznosci zalogowania, gdy uzytkownik jest gosciem', () => {
        useAuth.mockReturnValue({ user: null });

        render(<TematyPage />);

        expect(screen.getByText('Tematy')).toBeInTheDocument();
        expect(screen.getByText(/Zaloguj się, aby zobaczyć statystyki/i)).toBeInTheDocument();
    });

    // 2. Test dla zalogowanego użytkownika (pokrywa useEffect, pętlę forEach i renderowanie listy kart)
    it('powinien poprawnie obliczyc i wyswietlic statystyki kategorii dla zalogowanego uzytkownika', () => {
        useAuth.mockReturnValue({ user: { email: 'user@example.com' } });

        render(<TematyPage />);

        // Sprawdzamy nagłówek główny strony
        expect(screen.getByText('Statystyki według kategorii')).toBeInTheDocument();

        // Sprawdzamy wartości z zaserwowanego mocka (2 dla roads, 1 dla greenery)
        expect(screen.getByText('roads')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();

        expect(screen.getByText('greenery')).toBeInTheDocument();
        expect(screen.getByText('1')).toBeInTheDocument();
    });
});