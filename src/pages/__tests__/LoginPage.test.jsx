// src/pages/__tests__/LoginPage.test.jsx
// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../LoginPage';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

// Mockowanie modułów zewnętrznych i kontekstu
vi.mock('../../context/AuthContext', () => ({
    useAuth: vi.fn()
}));

vi.mock('react-hot-toast', () => ({
    default: {
        success: vi.fn(),
        error: vi.fn()
    }
}));

const mockNavigate = vi.fn();
const mockLocation = { state: null };

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useLocation: () => mockLocation,
        Link: ({ children, to }) => <a href={to}>{children}</a>
    };
});

describe('LoginPage Component', () => {
    const mockLogin = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        mockLocation.state = null; // Reset stanu lokalizacji przed każdym testem
        useAuth.mockReturnValue({ login: mockLogin });
    });

    it('renders login form items properly', () => {
        render(
            <BrowserRouter>
                <LoginPage />
            </BrowserRouter>
        );

        // Precyzyjne selektory ról zapobiegają konfliktowi tekstów "Zaloguj się"
        expect(screen.getByRole('heading', { name: 'Zaloguj się', level: 5 })).toBeInTheDocument();
        expect(screen.getByLabelText(/Adres email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Hasło \*/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Zaloguj się' })).toBeInTheDocument();
    });

    it('shows validation error when fields are empty', async () => {
        render(
            <BrowserRouter>
                <LoginPage />
            </BrowserRouter>
        );

        fireEvent.click(screen.getByRole('button', { name: 'Zaloguj się' }));

        expect(screen.getByText('Wypełnij wszystkie pola.')).toBeInTheDocument();
        expect(mockLogin).not.toHaveBeenCalled();
    });

    it('toggles password visibility when clicking the icon eye', () => {
        render(
            <BrowserRouter>
                <LoginPage />
            </BrowserRouter>
        );

        const passwordInput = screen.getByLabelText(/Hasło \*/i);
        expect(passwordInput.type).toBe('password');

        const toggleBtn = screen.getByRole('button', { name: 'pokaż hasło' });
        fireEvent.click(toggleBtn);
        expect(passwordInput.type).toBe('text');

        fireEvent.click(toggleBtn);
        expect(passwordInput.type).toBe('password');
    });

    it('logs in successfully and navigates to default dashboard for standard user', async () => {
        mockLogin.mockResolvedValue({ role: 'user' });

        render(
            <BrowserRouter>
                <LoginPage />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByLabelText(/Adres email/i), { target: { value: 'user@test.pl' } });
        fireEvent.change(screen.getByLabelText(/Hasło \*/i), { target: { value: 'password123' } });
        fireEvent.click(screen.getByRole('button', { name: 'Zaloguj się' }));

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith('user@test.pl', 'password123');
            expect(toast.success).toHaveBeenCalledWith('Zalogowano pomyślnie!');
            expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
        });
    });

    it('redirects to admin panel if the logged-in account has admin flag', async () => {
        mockLogin.mockResolvedValue({ isAdmin: true });

        render(
            <BrowserRouter>
                <LoginPage />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByLabelText(/Adres email/i), { target: { value: 'admin@test.pl' } });
        fireEvent.change(screen.getByLabelText(/Hasło \*/i), { target: { value: 'adminpass' } });
        fireEvent.click(screen.getByRole('button', { name: 'Zaloguj się' }));

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/admin', { replace: true });
        });
    });

    it('routes to prefilledCategory form configuration if passed from previous layout state', async () => {
        mockLocation.state = { prefilledCategory: 'roads' };
        mockLogin.mockResolvedValue({ role: 'user' });

        render(
            <BrowserRouter>
                <LoginPage />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByLabelText(/Adres email/i), { target: { value: 'user@test.pl' } });
        fireEvent.change(screen.getByLabelText(/Hasło \*/i), { target: { value: 'password123' } });
        fireEvent.click(screen.getByRole('button', { name: 'Zaloguj się' }));

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/nowe-zgloszenie', {
                state: { prefilledCategory: 'roads' },
                replace: true
            });
        });
    });

    it('displays API error feedback message on rejection', async () => {
        const apiError = {
            response: { data: { message: 'Nieprawidłowe dane logowania' } }
        };
        mockLogin.mockRejectedValue(apiError);

        render(
            <BrowserRouter>
                <LoginPage />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByLabelText(/Adres email/i), { target: { value: 'error@test.pl' } });
        fireEvent.change(screen.getByLabelText(/Hasło \*/i), { target: { value: 'wrong' } });
        fireEvent.click(screen.getByRole('button', { name: 'Zaloguj się' }));

        await waitFor(() => {
            expect(screen.getByText('Nieprawidłowe dane logowania')).toBeInTheDocument();
        });
    });
});