import { describe, it, expect } from 'vitest';
import {
    passwordSchema,
    emailSchema,
    descriptionSchema,
    locationSchema,
    validateNewPhotos
} from '../reportSchemas'; // Upewnij się, że ścieżka do pliku ze schematami Zod jest poprawna

describe('Szybkie testy coverage - Schematy i Pomocniki', () => {

    // 1. Walidacja Password Schema
    describe('passwordSchema', () => {
        it('powinien przejsc dla poprawnego hasla', () => {
            const result = passwordSchema.safeParse('Zorza2026');
            expect(result.success).toBe(true);
        });

        it('powinien odrzucic zbyt krotkie haslo', () => {
            const result = passwordSchema.safeParse('Short1');
            expect(result.success).toBe(false);
        });

        it('powinien odrzucic haslo bez cyfry', () => {
            const result = passwordSchema.safeParse('NoDigitsHere');
            expect(result.success).toBe(false);
        });

        it('powinien odrzucic haslo bez liter', () => {
            const result = passwordSchema.safeParse('1234567890');
            expect(result.success).toBe(false);
        });
    });

    // 2. Walidacja Email Schema
    describe('emailSchema', () => {
        it('powinien zaakceptowac poprawny email', () => {
            expect(emailSchema.safeParse('jan@kowalski.pl').success).toBe(true);
        });

        it('powinien odrzucic niepoprawny format', () => {
            expect(emailSchema.safeParse('invalid-email').success).toBe(false);
        });
    });

    // 3. Walidacja Opisu
    describe('descriptionSchema', () => {
        it('powinien odrzucic zbyt krotki opis', () => {
            expect(descriptionSchema.safeParse('Zwiezly').success).toBe(false);
        });

        it('powinien obciac biale znaki i zaakceptowac poprawny opis', () => {
            expect(descriptionSchema.safeParse('   To jest poprawny i dlugi opis usterki   ').success).toBe(true);
        });
    });

    // 4. Walidacja Lokalizacji
    describe('locationSchema', () => {
        it('powinien zaakceptowac poprawne wspolrzedne', () => {
            expect(locationSchema.safeParse([51.1079, 17.0385]).success).toBe(true);
        });

        it('powinien odrzucic wartosci spoza zakresu', () => {
            expect(locationSchema.safeParse([100, 200]).success).toBe(false);
        });
    });

    // 5. Test funkcji walidacji ze zdjeciami
    describe('validateNewPhotos', () => {
        const mockFilePng = new File([''], 'test.png', { type: 'image/png' });
        const mockFileTxt = new File([''], 'test.txt', { type: 'text/plain' });

        it('powinien dodać pliki, jesli limit nie jest przekroczony', () => {
            const existing = [];
            const newFiles = [mockFilePng];

            const { accepted, errors } = validateNewPhotos(existing, newFiles);
            expect(accepted).toHaveLength(1);
            expect(errors).toHaveLength(0);
        });

        it('powinien wyrzucic blad, jesli laczna liczba zdjec przekroczy limit', () => {
            const existing = [mockFilePng, mockFilePng, mockFilePng];
            const newFiles = [mockFilePng];

            const { accepted, errors } = validateNewPhotos(existing, newFiles);
            // Naprawiony ciąg znaków (dokładnie taki, jaki zwraca funkcja)
            expect(errors[0]).toContain('Można dodać maksymalnie 3 zdjęcia.');
        });

        it('powinien odrzucic plik o nieprawidlowym formacie', () => {
            const existing = [];
            const newFiles = [mockFileTxt];

            const { accepted, errors } = validateNewPhotos(existing, newFiles);
            expect(accepted).toHaveLength(0);
            expect(errors).toHaveLength(1);
        });
    });
});