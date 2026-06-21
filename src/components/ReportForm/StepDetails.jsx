import { useRef, useState, useEffect } from 'react';
import {
    Box, Stack, Typography, TextField, Button, IconButton, Alert,
    LinearProgress, Grid, FormControlLabel, Checkbox,
} from '@mui/material';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import { DESCRIPTION_MAX, PHOTO_LIMITS, validateNewPhotos, descriptionSchema } from '../../utils/reportSchemas';

const StepDetails = ({ description, photos, priority, onChange }) => {
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
    const canAddMore = photos.length < PHOTO_LIMITS.MAX_COUNT;

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

                <Grid container spacing={1.5}>
                    {previews.map((p, idx) => (
                        <Grid item xs={6} sm={4} key={idx}>
                            <Box
                                sx={{
                                    position: 'relative',
                                    pt: '75%',
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
                                        top: 4, right: 4,
                                        bgcolor: 'rgba(255,255,255,0.9)',
                                        '&:hover': { bgcolor: 'white' },
                                    }}
                                    aria-label={`Usuń zdjęcie ${idx + 1}`}
                                >
                                    <DeleteOutlineIcon fontSize="small" />
                                </IconButton>
                            </Box>
                            <Typography variant="caption" color="text.secondary" noWrap display="block">
                                {p.name}
                            </Typography>
                        </Grid>
                    ))}
                    {canAddMore && (
                        <Grid item xs={6} sm={4}>
                            <Button
                                onClick={() => inputRef.current?.click()}
                                variant="outlined"
                                sx={{
                                    width: '100%',
                                    pt: '37%', pb: '37%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    borderStyle: 'dashed',
                                    borderWidth: 2,
                                }}
                            >
                                <AddPhotoAlternateOutlinedIcon />
                                <Typography variant="caption" sx={{ mt: 0.5 }}>
                                    Dodaj zdjęcie
                                </Typography>
                            </Button>
                        </Grid>
                    )}
                </Grid>

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