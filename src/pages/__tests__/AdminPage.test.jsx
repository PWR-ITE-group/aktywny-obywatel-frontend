// @vitest-environment jsdom
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminPage from '../AdminPage';
import { ThemeProvider, createTheme } from '@mui/material';

// Sparametryzowany mock dla react-hot-toast
vi.mock('react-hot-toast', () => ({
    default: {
        success: vi.fn(),
        error: vi.fn()
    }
}));

// Mockowanie modułu adminService
vi.mock('../../services/adminService', () => ({
    adminService: {
        getAllReports: vi.fn(),
        exportReportsCSV: vi.fn(),
        updateReportStatus: vi.fn(),
        getRoutingRules: vi.fn(),
        updateRoutingRules: vi.fn(),
        getDepartments: vi.fn(),
        createDepartment: vi.fn(),
        updateDepartment: vi.fn(),
        deleteDepartment: vi.fn(),
        getStats: vi.fn(),
        getUsers: vi.fn(),
        deleteUser: vi.fn(),
    }
}));

import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';

const renderWithTheme = (ui) => {
    const theme = createTheme();
    return render(
        <ThemeProvider theme={theme}>
            {ui}
        </ThemeProvider>
    );
};

const mockReportsData = [
    { id: 1, title: 'Dziura w jezdni', category: 'Drogi', status: 'złożone', statusLabel: 'Złożone', statusColor: '#ff0000', createdAt: '2026-06-21' },
    { id: 2, title: 'Niedziałająca latarnia', category: 'Oświetlenie', status: 'w_realizacji', statusLabel: 'W realizacji', statusColor: '#00ff00', createdAt: '2026-06-20' }
];

const mockRoutingData = [
    { category: 'Drogi', department: 'ZDiUM', channel: 'api' }
];

const mockDepartmentsData = [
    { id: 101, name: 'ZDiUM', email: 'zdium@miasto.pl', apiUrl: 'https://api.zdium.pl' }
];

const mockStatsData = {
    total: 2,
    byStatus: [
        { status: 'w realizacji', count: 1 },
        { status: 'zakończone', count: 1 },
        { status: 'odrzucone', count: 0 }
    ],
    byCategory: [
        { category: 'Drogi', count: 2 }
    ]
};

const mockUsersData = [
    { id: 1, email: 'jan@kowalski.pl', createdAt: '2026-01-01', reports: 3 }
];

describe('AdminPage Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Zabezpieczenie asynchronicznych strzałów na start komponentu
        adminService.getAllReports.mockResolvedValue(mockReportsData);
        adminService.getRoutingRules.mockResolvedValue(mockRoutingData);
        adminService.getDepartments.mockResolvedValue(mockDepartmentsData);
        adminService.getStats.mockResolvedValue(mockStatsData);
        adminService.getUsers.mockResolvedValue(mockUsersData);

        global.URL.createObjectURL = vi.fn(() => 'mock-url');
        global.URL.revokeObjectURL = vi.fn();
    });

    it('renders side navigation tabs and main layout titles', async () => {
        renderWithTheme(<AdminPage />);

        // Czekamy na zniknięcie loaderów i ustabilizowanie stanu Reacta
        await waitFor(() => {
            expect(screen.getByText('Dziura w jezdni')).toBeInTheDocument();
        });

        expect(screen.getByRole('heading', { name: /Panel administratora/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /Zgłoszenia/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /Routing/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /Wydziały/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /Statystyki/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /Użytkownicy/i })).toBeInTheDocument();
    });

    describe('Reports Tab (Zgłoszenia)', () => {
        it('renders reports list from API correctly', async () => {
            renderWithTheme(<AdminPage />);

            await waitFor(() => {
                expect(screen.getByText('Dziura w jezdni')).toBeInTheDocument();
                expect(screen.getByText('Niedziałająca latarnia')).toBeInTheDocument();
            });
        });

        it('allows updating report status through dialog window', async () => {
            const user = userEvent.setup();
            adminService.updateReportStatus.mockResolvedValueOnce({ success: true });
            renderWithTheme(<AdminPage />);

            const editButtons = await screen.findAllByRole('button', { name: /Edytuj/i });
            await user.click(editButtons[0]);

            expect(screen.getByText(/Zmień status zgłoszenia #1/i)).toBeInTheDocument();

            const submitBtn = screen.getByRole('button', { name: /Zapisz/i });
            await user.click(submitBtn);

            await waitFor(() => {
                expect(adminService.updateReportStatus).toHaveBeenCalledWith(1, 'złożone');
                expect(toast.success).toHaveBeenCalledWith('Zmieniono status zgłoszenia.');
            });
        });

        it('triggers CSV download workflow successfully', async () => {
            const user = userEvent.setup();
            adminService.exportReportsCSV.mockResolvedValueOnce({ csvContent: 'id,title\n1,Dziura' });
            renderWithTheme(<AdminPage />);

            const csvBtn = await screen.findByRole('button', { name: /CSV/i });
            await user.click(csvBtn);

            await waitFor(() => {
                expect(adminService.exportReportsCSV).toHaveBeenCalled();
                expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('Wyeksportowano'));
            });
        });
    });

    describe('Routing Tab', () => {
        it('loads routing configurations and updates successfully', async () => {
            const user = userEvent.setup();
            adminService.updateRoutingRules.mockResolvedValueOnce({ success: true });

            renderWithTheme(<AdminPage />);

            const routingTab = screen.getByRole('tab', { name: /Routing/i });
            await user.click(routingTab);

            const saveBtn = await screen.findByRole('button', { name: /Zapisz wszystko/i });
            await user.click(saveBtn);

            await waitFor(() => {
                expect(adminService.updateRoutingRules).toHaveBeenCalled();
                expect(toast.success).toHaveBeenCalledWith('Zapisano konfigurację routingu.');
            });
        });
    });

    describe('Departments Tab (Wydziały)', () => {
        it('allows adding a new department via Dialog input form', async () => {
            const user = userEvent.setup();
            adminService.createDepartment.mockResolvedValueOnce({ id: 102, name: 'MOPS', email: 'mops@miasto.pl' });

            renderWithTheme(<AdminPage />);
            await user.click(screen.getByRole('tab', { name: /Wydziały/i }));

            const addBtn = await screen.findByRole('button', { name: /Dodaj wydział/i });
            await user.click(addBtn);

            await user.type(screen.getByLabelText(/^Nazwa/i), 'MOPS');
            await user.type(screen.getByLabelText(/^Email/i), 'mops@miasto.pl');

            await user.click(screen.getByRole('button', { name: /Zapisz/i }));

            await waitFor(() => {
                expect(adminService.createDepartment).toHaveBeenCalledWith({
                    name: 'MOPS',
                    email: 'mops@miasto.pl',
                    apiUrl: ''
                });
                expect(toast.success).toHaveBeenCalledWith('Dodano wydział.');
            });
        });
    });

    describe('Statistics Tab (Statystyki)', () => {
        it('renders charts items counts without throwing structural failures', async () => {
            const user = userEvent.setup();
            renderWithTheme(<AdminPage />);

            await user.click(screen.getByRole('tab', { name: /Statystyki/i }));

            await waitFor(() => {
                expect(screen.getByText('Wszystkie zgłoszenia')).toBeInTheDocument();
                expect(screen.getByText('Podział wg statusu')).toBeInTheDocument();
                expect(screen.getByText('Podział wg kategorii')).toBeInTheDocument();
            });
        });
    });

    describe('Users Tab (Użytkownicy)', () => {
        it('handles user profile termination sequences correctly', async () => {
            const user = userEvent.setup();
            adminService.deleteUser.mockResolvedValueOnce({ success: true });

            renderWithTheme(<AdminPage />);
            await user.click(screen.getByRole('tab', { name: /Użytkownicy/i }));

            await waitFor(() => {
                expect(screen.getByText('jan@kowalski.pl')).toBeInTheDocument();
            });

            const deleteButtons = screen.getAllByRole('button');
            await user.click(deleteButtons[deleteButtons.length - 1]);

            await waitFor(() => {
                expect(adminService.deleteUser).toHaveBeenCalledWith(1);
                expect(toast.success).toHaveBeenCalledWith('Konto użytkownika usunięte.');
            });
        });
    });
});