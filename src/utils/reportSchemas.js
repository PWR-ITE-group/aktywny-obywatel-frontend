import { z } from 'zod';

// Limity zgodne z E2 (WF-09, WF-10)
export const PHOTO_LIMITS = {
    MAX_COUNT: 3,
    MAX_SIZE_BYTES: 10 * 1024 * 1024, // 10 MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    ALLOWED_LABEL: 'JPG, PNG lub WEBP',
};

export const DESCRIPTION_MAX = 1000;

// Schemat pojedynczego zdjęcia — walidacja pliku po stronie klienta
export const photoFileSchema = z
    .instanceof(File, { message: 'Nieprawidłowy plik.' })
    .refine((f) => PHOTO_LIMITS.ALLOWED_TYPES.includes(f.type), {
        message: `Dozwolone formaty: ${PHOTO_LIMITS.ALLOWED_LABEL}.`,
    })
    .refine((f) => f.size <= PHOTO_LIMITS.MAX_SIZE_BYTES, {
        message: 'Plik nie może przekraczać 10 MB.',
    });

export const photosArraySchema = z
    .array(photoFileSchema)
    .max(PHOTO_LIMITS.MAX_COUNT, { message: 'Maksymalnie 3 zdjęcia.' });

export const descriptionSchema = z
    .string()
    .trim()
    .min(10, { message: 'Opis musi mieć co najmniej 10 znaków.' })
    .max(DESCRIPTION_MAX, { message: `Opis nie może być dłuższy niż ${DESCRIPTION_MAX} znaków.` });

export const locationSchema = z
    .tuple([
        z.number().min(-90).max(90),
        z.number().min(-180).max(180),
    ], { message: 'Wskaż lokalizację na mapie.' });

// Schemat hasła (WNF-12: min 8 znaków, litery i cyfry)
export const passwordSchema = z
    .string()
    .min(8, { message: 'Hasło musi mieć co najmniej 8 znaków.' })
    .regex(/[A-Za-z]/, { message: 'Hasło musi zawierać literę.' })
    .regex(/\d/, { message: 'Hasło musi zawierać cyfrę.' });

export const emailSchema = z
    .string()
    .trim()
    .min(1, { message: 'Email jest wymagany.' })
    .email({ message: 'Nieprawidłowy adres email.' });

// Helper do walidacji uploadu nowych plików — zwraca listę błędów dla UI
export function validateNewPhotos(existingPhotos, newFiles) {
    const errors = [];
    const accepted = [];
    const totalAfter = existingPhotos.length + newFiles.length;

    if (totalAfter > PHOTO_LIMITS.MAX_COUNT) {
        errors.push(`Można dodać maksymalnie ${PHOTO_LIMITS.MAX_COUNT} zdjęcia.`);
    }

    for (const file of newFiles) {
        const result = photoFileSchema.safeParse(file);
        if (!result.success) {
            errors.push(`${file.name}: ${result.error.issues[0].message}`);
        } else if (existingPhotos.length + accepted.length < PHOTO_LIMITS.MAX_COUNT) {
            accepted.push(file);
        }
    }

    return { accepted, errors };
}
