import {
    Drawer, Box, Typography, IconButton, List, ListItemButton,
    ListItemIcon, ListItemText, Button, Divider, Stack, Dialog
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import { useState, useEffect } from 'react';
import { complaintService } from '../../services/complaintService';
import { useNavigate } from 'react-router-dom';

const PropertyBottomSheet = ({
                                 open,
                                 onClose,
                                 property,

                                 onToggleFavorite,
                             }) => {
    const navigate = useNavigate();
    const [attachments, setAttachments] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        if (open && property?.id) {
            complaintService.getAttachments(property.id)
                .then(att => setAttachments(att || []))
                .catch(() => setAttachments([]));
        } else {
            setAttachments([]);
        }
    }, [open, property?.id]);

    if (!property) return null;

    return (
        <Drawer
            anchor="bottom"
            open={open}
            onClose={onClose}
            ModalProps={{ BackdropProps: { sx: { bgcolor: 'transparent' } } }}
            PaperProps={{
                sx: {
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                    maxHeight: '65vh',
                    pb: 'env(safe-area-inset-bottom)',
                },
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1, pb: 1 }}>
                <Box sx={{ width: 36, height: 4, borderRadius: 2, bgcolor: 'grey.300' }} />
            </Box>

            <Box sx={{ px: 2, pb: 1 }}>
                <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography variant="subtitle1" fontWeight={700}>
                            {property.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {property.address}
                        </Typography>
                        {property.author && (
                            <Typography variant="caption" color="primary.main" sx={{ display: 'block', mt: 0.5, fontWeight: 500 }}>
                                Zgłaszający: {property.author.firstName} ({property.author.email})
                            </Typography>
                        )}
                    </Box>
                    <IconButton size="small" onClick={onClose} aria-label="Zamknij">
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Stack>
            </Box>

            <Divider />

            <List disablePadding>
                <ListItemButton>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                        <InfoOutlinedIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                        primary={property.description || "Brak opisu"}
                        primaryTypographyProps={{ fontSize: '0.9375rem', style: { whiteSpace: 'pre-wrap' } }}
                    />
                </ListItemButton>
                <ListItemButton onClick={onToggleFavorite}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                        {property.isFavorite
                            ? <BookmarkIcon color="primary" />
                            : <BookmarkBorderIcon color="primary" />}
                    </ListItemIcon>
                    <ListItemText
                        primary={property.isFavorite ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
                        primaryTypographyProps={{ fontSize: '0.9375rem' }}
                    />
                </ListItemButton>
            </List>

            {attachments && attachments.length > 0 && (
                <>
                    <Divider />
                    <Box sx={{ px: 2, pt: 1.5 }}>
                        <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: '0.08em' }}>
                            ZAŁĄCZONE ZDJĘCIA
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 1, mt: 1 }}>
                            {attachments.map((att) => (
                                <Box
                                    key={att.id}
                                    component="img"
                                    src={`/api/complaints/attachments/${att.id}/download`}
                                    alt="Załącznik"
                                    onClick={() => setSelectedImage(`/api/complaints/attachments/${att.id}/download`)}
                                    sx={{
                                        height: 100,
                                        borderRadius: 1,
                                        objectFit: 'cover',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        cursor: 'pointer',
                                    }}
                                />
                            ))}
                        </Stack>
                    </Box>
                </>
            )}

            <Box sx={{ p: 2, pt: 1 }}>
                <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={() => {
                        navigate(`/zgloszenie/${property.id}`);
                    }}
                >
                    Zobacz szczegóły
                </Button>
            </Box>

            {/* Modal ze zdjęciem */}
            <Dialog open={!!selectedImage} onClose={() => setSelectedImage(null)} maxWidth="md">
                <Box sx={{ position: 'relative' }}>
                    <IconButton
                        onClick={() => setSelectedImage(null)}
                        sx={{ position: 'absolute', right: 8, top: 8, bgcolor: 'rgba(0,0,0,0.5)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }, zIndex: 1 }}
                    >
                        <CloseIcon />
                    </IconButton>
                    <Box component="img" src={selectedImage} sx={{ width: '100%', height: 'auto', display: 'block', maxHeight: '90vh', objectFit: 'contain' }} />
                </Box>
            </Dialog>
        </Drawer>
    );
};

export default PropertyBottomSheet;
