import { useRef, useState, useEffect } from 'react';
import {
    Box, Stack, Typography, TextField, Button, IconButton, Alert,
    LinearProgress, Grid, FormControlLabel, Checkbox,
} from '@mui/material';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import { DESCRIPTION_MAX, PHOTO_LIMITS, validateNewPhotos, descriptionSchema } from '../../utils/reportSchemas';

const StepDetails = ({ title, description, photos, urgent, onChange }) => {
    const inputRef = useRef(null);
    const [uploadErrors, setUploadErrors] = useState([]);
    const [descError, setDescError] = useState(null);
    const [previews, setPreviews] = useState([]);

    useEffect(() => {
        const urls = photos.map((p) => ({
            url: p instanceof File ? URL.createObjectURL(p) : p.url,
            name: p instanceof File ? p.name : p.name ?? 'zdjecie',
            size: p instanceof File ? p.size : p.size ?? 0,
        }));
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPreviews(urls);
        return () => {
            urls.forEach((u) => {
                if (u.url?.startsWith('blob:')) URL.revokeObjectURL(u.url);
            });
        };
    }, [photos]);

    const handleFiles = (e) => {
        const files = Array.from(e.target.files ?? []);
        if (files.length === 0) return;
        const { accepted, errors } = validateNewPhotos(photos, files);
        setUploadErrors(errors);
        if (accepted.length > 0) {
            onChange({ photos: [...photos, ...accepted] });
        }
        e.target.value = '';
    };

    const removePhoto = (idx) => {
        const next = photos.filter((_, i) => i !== idx);
        onChange({ photos: next });
        setUploadErrors([]);
    };

    const onDescChange = (e) => {
        const value = e.target.value.slice(0, DESCRIPTION_MAX);
        onChange({ description: value });
        if (value.trim().length === 0) {
            setDescError(null);
        } else {
            const result = descriptionSchema.safeParse(value);
            setDescError(result.success ? null : result.error.issues[0].message);
        }
    };

    const remaining = DESCRIPTION_MAX - description.length;


    const isForcedUrgent = /pilne/i.test(description || '') || /pilne/i.test(title || '');
    const effectiveUrgent = urgent || isForcedUrgent;

    return (
        <Stack spacing={3}>
            <Box>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Opis problemu
                </Typography>
                <TextField
                    multiline
                    minRows={4}
                    maxRows={10}
                    fullWidth
                    value={description}
                    onChange={onDescChange}
                    placeholder="Opisz problem: co się dzieje, od kiedy, jakie są ewentualne zagrożenia…"
                    error={Boolean(descError)}
                    helperText={
                        descError ??
                        `${description.length}/${DESCRIPTION_MAX} znaków`
                    }
                    inputProps={{ maxLength: DESCRIPTION_MAX }}
                />
                <LinearProgress
                    variant="determinate"
                    value={(description.length / DESCRIPTION_MAX) * 100}
                    sx={{
                        mt: 0.5,
                        height: 3,
                        borderRadius: 2,
                        '& .MuiLinearProgress-bar': {
                            bgcolor: remaining < 100 ? 'warning.main' : 'primary.main',
                        },
                    }}
                />
                <Button
                    variant={effectiveUrgent ? "contained" : "outlined"}
                    color="error"
                    onClick={() => {
                        if (!isForcedUrgent) {
                            onChange({ urgent: !effectiveUrgent });
                        }
                    }}
                    startIcon={<PriorityHighIcon />}
                    sx={{ mt: 2, borderRadius: 2, py: 1.5, fontWeight: 'bold' }}
                    fullWidth
                    disableElevation
                >
                    {effectiveUrgent ? 'Zgłoszenie oznaczone jako Pilne' : 'Oznacz jako Pilne Zgłoszenie'}
                </Button>
                {effectiveUrgent && (
                    <Alert severity="error" sx={{ mt: 1.5, borderRadius: 2, '& .MuiAlert-message': { width: '100%' } }}>
                        <strong>Uwaga!</strong> Aplikacja nie służy do zgłaszania nagłych wypadków. 
                        W przypadku bezpośredniego zagrożenia życia lub zdrowia natychmiast zadzwoń pod numer alarmowy{' '}
                        <a href="tel:112" style={{ fontWeight: 'bold', color: 'inherit', textDecoration: 'underline' }}>112</a>.
                    </Alert>
                )}
            </Box>

            <Box>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Zdjęcia (opcjonalnie)
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                    Maksymalnie {PHOTO_LIMITS.MAX_COUNT} zdjęcia, do 10 MB każde. Formaty: {PHOTO_LIMITS.ALLOWED_LABEL}.
                </Typography>

                <input
                    ref={inputRef}
                    type="file"
                    accept={PHOTO_LIMITS.ALLOWED_TYPES.join(',')}
                    multiple
                    hidden
                    onChange={handleFiles}
                />

                <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
                    {[0, 1, 2].map((idx) => {
                        const p = previews[idx];
                        if (p) {
                            return (
                                <Box
                                    key={idx}
                                    sx={{
                                        flex: 1,
                                        aspectRatio: '1 / 1',
                                        position: 'relative',
                                        borderRadius: 2,
                                        overflow: 'hidden',
                                        backgroundImage: `url(${p.url})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        bgcolor: 'grey.100',
                                    }}
                                >
                                    <IconButton
                                        size="small"
                                        onClick={() => removePhoto(idx)}
                                        sx={{
                                            position: 'absolute',
                                            top: 8, right: 8,
                                            bgcolor: 'rgba(255,255,255,0.9)',
                                            '&:hover': { bgcolor: 'white' },
                                            boxShadow: 1,
                                        }}
                                        aria-label={`Usuń zdjęcie ${idx + 1}`}
                                    >
                                        <DeleteOutlineIcon fontSize="small" />
                                    </IconButton>
                                    <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, bgcolor: 'rgba(0,0,0,0.6)', p: 0.5 }}>
                                        <Typography variant="caption" color="white" noWrap display="block" sx={{ textAlign: 'center' }}>
                                            {p.name}
                                        </Typography>
                                    </Box>
                                </Box>
                            );
                        } else {
                            return (
                                <Button
                                    key={idx}
                                    onClick={() => inputRef.current?.click()}
                                    variant="outlined"
                                    sx={{
                                        flex: 1,
                                        aspectRatio: '1 / 1',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        borderStyle: 'dashed',
                                        borderWidth: 2,
                                        borderRadius: 2,
                                        color: 'text.secondary',
                                        borderColor: 'divider',
                                        '&:hover': {
                                            borderColor: 'primary.main',
                                            color: 'primary.main',
                                            bgcolor: 'primary.50'
                                        }
                                    }}
                                >
                                    <AddPhotoAlternateOutlinedIcon sx={{ fontSize: 32, mb: 1 }} />
                                    <Typography variant="body2" sx={{ textAlign: 'center', fontWeight: 600 }}>
                                        Dodaj<br/>zdjęcie
                                    </Typography>
                                </Button>
                            );
                        }
                    })}
                </Box>

                {uploadErrors.length > 0 && (
                    <Alert severity="warning" sx={{ mt: 1.5 }} onClose={() => setUploadErrors([])}>
                        <Stack spacing={0.25}>
                            {uploadErrors.map((err, i) => (
                                <Typography variant="body2" key={i}>{err}</Typography>
                            ))}
                        </Stack>
                    </Alert>
                )}
            </Box>

        </Stack>
    );
};

export default StepDetails;