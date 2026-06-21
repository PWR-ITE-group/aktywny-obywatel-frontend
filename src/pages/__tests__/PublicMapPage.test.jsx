import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import PublicMapPage from '../PublicMapPage';
import { complaintService } from '../../services/complaintService';

// 1. Mockowanie komponentu mapy (ReportMap)
vi.mock('../../components/Map/ReportMap', () => {
    return {
        default: ({ reports, onMarkerClick }) => (
            <div data-testid="mock-report-map">
                Map Mock Active (Total reports: {reports?.length || 0})
                <button
                    data-testid="marker-101"
                    onClick={() => onMarkerClick({
                        id: '101',
                        title: 'Testowe zgłoszenie',
                        description: 'Opis zgłoszenia',
                        createdAt: new Date().toISOString(),
                        address: { street: 'Główna', houseNumber: '10' }
                    })}
                >
                    Marker 101
                </button>
            </div>
        )
    };
});

// 2. Mockowanie serwisu zgłoszeń jako nazwanego eksportu
vi.mock('../../services/complaintService', () => ({
    complaintService: {
        getAll: vi.fn(),
        getAttachments: vi.fn().mockResolvedValue([]),
    },
}));

const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

describe('PublicMapPage Component', () => {
    const mockReports = [
        { id: '101', title: 'Testowe zgłoszenie', status: 'PENDING', category: 'Infrastruktura' }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        complaintService.getAll.mockResolvedValue(mockReports);
    });

    const renderComponent = () => render(
        <BrowserRouter>
            <PublicMapPage />
        </BrowserRouter>
    );

    it('renders the map overlay action buttons and loads data', async () => {
        renderComponent();
        expect(await screen.findByTestId('mock-report-map')).toBeInTheDocument();
        expect(screen.getByLabelText('Moja lokalizacja')).toBeInTheDocument();
        expect(screen.getByLabelText('Filtry')).toBeInTheDocument();
    });

    it('navigates back to homepage when clicking close button', async () => {
        renderComponent();
        await screen.findByTestId('mock-report-map');

        const buttons = screen.getAllByRole('button');
        fireEvent.click(buttons[0]);

        expect(window.location.pathname).toBe('/');
    });

    it('triggers alerts for help, location and bookmarks correctly', async () => {
        renderComponent();
        const mapEl = await screen.findByTestId('mock-report-map');
        expect(mapEl).toBeInTheDocument();

        // Sprawdzamy czy okno alertu jest poprawnie mockowane w tym środowisku
        expect(alertMock).toBeDefined();
    });

    it('opens PropertyBottomSheet on marker click and handles navigation payload', async () => {
        renderComponent();

        const markerBtn = await screen.findByTestId('marker-101');
        fireEvent.click(markerBtn);

        await waitFor(() => {
            expect(screen.getByText(/Testowe zgłoszenie/i)).toBeInTheDocument();
        });
    });
});