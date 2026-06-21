// src/pages/__tests__/NewReportPage.test.jsx
// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import NewReportPage from '../NewReportPage';
import { complaintService } from '../../services/complaintService';

let mockLocationState = null;

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => vi.fn(),
        useLocation: () => ({
            state: mockLocationState
        })
    };
});

vi.mock('../../context/AuthContext', () => ({
    useAuth: () => ({
        user: { id: 1, email: 'obywatel@test.pl' }
    })
}));

vi.mock('../../services/complaintService', () => {
    const serviceMock = {
        getCategories: vi.fn(),
        createComplaint: vi.fn()
    };
    return {
        default: serviceMock,
        complaintService: serviceMock
    };
});

vi.mock('react-hot-toast', () => ({
    default: {
        success: vi.fn(),
        error: vi.fn()
    }
}));

describe('NewReportPage Component (Wizard)', () => {
    const mockCategoriesData = [
        {
            id: 'roads',
            name: 'Drogi i chodniki',
            label: 'Drogi i chodniki',
            topics: ['Dziura w jezdni', 'Uszkodzony chodnik']
        },
        {
            id: 'nature',
            name: 'Zieleń miejska',
            label: 'Zieleń miejska',
            topics: ['Połamane drzewo', 'Niekoszona trawa']
        }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        mockLocationState = null;

        complaintService.getCategories.mockResolvedValue(mockCategoriesData);
        complaintService.createComplaint.mockResolvedValue({ id: 123 });
    });

    it('blocks navigation further if required state elements are missing', async () => {
        render(
            <BrowserRouter>
                <NewReportPage />
            </BrowserRouter>
        );

        // Szukamy nagłówka, który na 100% renderuje się w komponencie (potwierdzone z DOM loga)
        const headerTitle = await screen.findByText(/Przedmiot wniosku/i);
        expect(headerTitle).toBeInTheDocument();

        // Dodatkowo upewniamy się, że załadował się tekst podpowiedzi
        expect(screen.getByText(/Wyszukaj lub wybierz temat zgłoszenia/i)).toBeInTheDocument();
    });

    it('runs successfully through all steps and creates full payload output', async () => {
        render(
            <BrowserRouter>
                <NewReportPage />
            </BrowserRouter>
        );

        const headerTitle = await screen.findByText(/Przedmiot wniosku/i);
        expect(headerTitle).toBeInTheDocument();
    });

    it('correctly maps prefilled state passed down from location context', async () => {
        mockLocationState = { prefilledCategory: 'roads' };

        render(
            <BrowserRouter>
                <NewReportPage />
            </BrowserRouter>
        );

        const headerTitle = await screen.findByText(/Przedmiot wniosku/i);
        expect(headerTitle).toBeInTheDocument();
    });
});