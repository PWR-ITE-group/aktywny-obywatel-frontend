import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProfileSettingsPage from '../ProfileSettingsPage';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { authService } from '../../services/authService';

// Mockujemy hook auth i serwisy api
vi.mock('../../context/AuthContext', () => ({
    useAuth: vi.fn()
}));

vi.mock('../../services/userService', () => ({
    userService: {
        updateProfile: vi.fn().mockResolvedValue({}),
        updateNotificationPreferences: vi.fn().mockResolvedValue({}),
        requestAccountDeletion: vi.fn().mockResolvedValue({})
    }
}));

vi.mock('../../services/authService', () => ({
    authService: {
        changePassword: vi.fn().mockResolvedValue({})
    }
}));

// Wyłączenie toastów w konsoli podczas testów
vi.mock('react-hot-toast', () => ({
    default: {
        success: vi.fn(),
        error: vi.fn()
    }
}));

describe('ProfileSettingsPage Component', () => {
    const mockUser = {
        email: 'test@example.com',
        firstName: 'Jan',
        lastName: 'Kowalski',
        phone: '123456789'
    };

    beforeEach(() => {
        vi.clearAllMocks();
        useAuth.mockReturnValue({ user: mockUser });
    });

    // 1. Test renderowania i przełączania zakładek (Tabs)
    it('powinien poprawnie przelaczac zakladki', () => {
        render(<ProfileSettingsPage />);

        // Domyślnie pokazuje się pierwsza zakładka
        expect(screen.getByText('Dane osobowe')).toBeInTheDocument();

        // Przełączamy na "Powiadomienia"
        fireEvent.click(screen.getByText('Powiadomienia'));
        expect(screen.getByText('Kanały powiadomień')).toBeInTheDocument();

        // Przełączamy na "Prywatność"
        fireEvent.click(screen.getByText('Prywatność'));
        expect(screen.getByText('Twoje dane (RODO)')).toBeInTheDocument();
    });

    // 2. Test Tab 1: Walidacja i zapis profilu
    it('powinien wywolac userService.updateProfile po kliknieciu zapisz zmiany', async () => {
        render(<ProfileSettingsPage />);

        const saveButton = screen.getByText('Zapisz zmiany');
        fireEvent.click(saveButton);

        expect(userService.updateProfile).toHaveBeenCalledWith({
            email: 'test@example.com',
            firstName: 'Jan',
            lastName: 'Kowalski',
            phone: '123456789'
        });
    });

    // 3. Test Tab 1: Zmiana hasła
    it('powinien wywolac authService.changePassword przy poprawnych danych', async () => {
        render(<ProfileSettingsPage />);

        // Wypełniamy formularz zmiany hasła
        fireEvent.change(screen.getByLabelText('Aktualne hasło'), { target: { value: 'Stare123' } });
        fireEvent.change(screen.getByLabelText('Nowe hasło'), { target: { value: 'NoweHaslo1' } });
        fireEvent.change(screen.getByLabelText('Powtórz nowe hasło'), { target: { value: 'NoweHaslo1' } });

        const changePwdButton = screen.getByText('Zmień hasło');
        fireEvent.click(changePwdButton);

        expect(authService.changePassword).toHaveBeenCalledWith('Stare123', 'NoweHaslo1');
    });

    // 4. Test Tab 2: Powiadomienia
    it('powinien zapisac preferencje powiadomien', async () => {
        render(<ProfileSettingsPage />);

        // Przechodzimy do zakładki powiadomień
        fireEvent.click(screen.getByText('Powiadomienia'));

        const savePreferencesButton = screen.getByText('Zapis preferencje');
        fireEvent.click(savePreferencesButton);

        expect(userService.updateNotificationPreferences).toHaveBeenCalled();
    });

    // 5. Test Tab 3: Usunięcie konta i modal potwierdzający
    it('powinien otworzyc dialog i wywolac requestAccountDeletion po wpisaniu USUN', async () => {
        render(<ProfileSettingsPage />);

        // Przechodzimy do prywatności
        fireEvent.click(screen.getByText('Prywatność'));

        // Klikamy przycisk otwierający Dialog
        fireEvent.click(screen.getByText('Usuń moje konto'));
        expect(screen.getByText('Potwierdź usunięcie konta')).toBeInTheDocument();

        // Wpisujemy wymagany tekst potwierdzający do inputu
        const input = screen.getByPlaceholderText('USUŃ');
        fireEvent.change(input, { target: { value: 'USUŃ' } });

        // Klikamy zatwierdzenie w modalu
        const confirmButton = screen.getByText('Potwierdź usunięcie');
        fireEvent.click(confirmButton);

        expect(userService.requestAccountDeletion).toHaveBeenCalled();
    });
});