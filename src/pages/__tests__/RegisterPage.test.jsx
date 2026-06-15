import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RegisterPage from '../RegisterPage';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

// Mock useAuth
vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn()
}));

import { useAuth } from '../../context/AuthContext';

const renderWithProviders = (ui, { providerProps, ...renderOptions } = {}) => {
  useAuth.mockReturnValue(providerProps);
  const theme = createTheme();
  return render(
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        {ui}
      </ThemeProvider>
    </BrowserRouter>,
    renderOptions
  );
};

describe('RegisterPage Component', () => {
  const mockRegister = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the registration form correctly', () => {
    renderWithProviders(<RegisterPage />, { providerProps: { register: mockRegister } });

    expect(screen.getByRole('heading', { name: /Utwórz konto/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Imię/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nazwisko/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Adres email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Numer telefonu/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Hasło/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Potwierdź hasło/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Zarejestruj się/i })).toBeInTheDocument();
  });

  it('shows error when passwords do not match', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegisterPage />, { providerProps: { register: mockRegister } });

    await user.type(screen.getByLabelText(/Imię/i), 'Anna');
    await user.type(screen.getByLabelText(/Nazwisko/i), 'Kowalska');
    await user.type(screen.getByLabelText(/Adres email/i), 'anna@test.pl');
    await user.type(screen.getByLabelText(/Numer telefonu/i), '+48123456789');
    await user.type(screen.getByLabelText(/^Hasło/i), 'TestPassword123!');
    await user.type(screen.getByLabelText(/Potwierdź hasło/i), 'TestPassword321!');

    const submitBtn = screen.getByRole('button', { name: /Zarejestruj się/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Hasła nie są identyczne/i)).toBeInTheDocument();
    });
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('calls register function when all fields are valid', async () => {
    mockRegister.mockResolvedValueOnce();
    const user = userEvent.setup();
    renderWithProviders(<RegisterPage />, { providerProps: { register: mockRegister } });

    await user.type(screen.getByLabelText(/Imię/i), 'Anna');
    await user.type(screen.getByLabelText(/Nazwisko/i), 'Kowalska');
    await user.type(screen.getByLabelText(/Adres email/i), 'anna@test.pl');
    await user.type(screen.getByLabelText(/Numer telefonu/i), '+48123456789');
    await user.type(screen.getByLabelText(/^Hasło/i), 'TestPassword123!');
    await user.type(screen.getByLabelText(/Potwierdź hasło/i), 'TestPassword123!');

    const submitBtn = screen.getByRole('button', { name: /Zarejestruj się/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(
        'anna@test.pl',
        'TestPassword123!',
        '+48123456789',
        'Anna',
        'Kowalska'
      );
    });
  });
});
