import {
    Drawer, Box, Typography, IconButton, List, ListItemButton,
    ListItemIcon, ListItemText, Button, Divider, Stack,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';

// Bottom sheet pokazujący szczegóły obiektu/adresu — jak na screenach 2 i 4.
// Props:
//   open, onClose       - sterowanie widocznością
//   property            - { id, title, address, type, isFavorite }
//   nearbyItems         - lista powiązanych obiektów pod tym adresem
//   onSelect            - callback po "Wybierz obiekt"
//   onToggleFavorite    - callback po kliknięciu zakładki
const PropertyBottomSheet = ({
                                 open,
                                 onClose,
                                 property,
                                 nearbyItems = [],
                                 onSelect,
                                 onToggleFavorite,
                             }) => {
    if (!property) return null;

    return (
        <Drawer
            anchor="bottom"
            open={open}
            onClose={onClose}
            // ModalProps: żeby nie łapać całego ekranu (tło przezroczyste, można przesuwać mapę)
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
            {/* Drag handle */}
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
                    </Box>
                    <IconButton size="small" onClick={onClose} aria-label="Zamknij">
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Stack>
            </Box>

            <Divider />

            {/* Akcje */}
            <List disablePadding>
                <ListItemButton>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                        <InfoOutlinedIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                        primary="Informacje o nieruchomości"
                        primaryTypographyProps={{ fontSize: '0.9375rem' }}
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

            {/* Lista "Obiekty w pobliżu" / właściwości pod adresem */}
            {nearbyItems.length > 0 && (
                <>
                    <Divider />
                    <Box sx={{ px: 2, pt: 1.5 }}>
                        <Typography
                            variant="overline"
                            color="text.secondary"
                            sx={{ letterSpacing: '0.08em' }}
                        >
                            OBIEKTY W POBLIŻU
                        </Typography>
                    </Box>
                    <List disablePadding>
                        {nearbyItems.map((item) => (
                            <ListItemButton key={item.id}>
                                <ListItemIcon sx={{ minWidth: 40 }}>
                                    <LocationOnOutlinedIcon color="action" />
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.title}
                                    secondary={item.subtitle}
                                    primaryTypographyProps={{ fontSize: '0.9375rem', fontWeight: 500 }}
                                />
                                {item.distance && (
                                    <Typography variant="caption" color="text.secondary">
                                        {item.distance}
                                    </Typography>
                                )}
                            </ListItemButton>
                        ))}
                    </List>
                </>
            )}

            {/* Duży primary CTA */}
            <Box sx={{ p: 2 }}>
                <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={onSelect}
                >
                    Wybierz obiekt
                </Button>
            </Box>
        </Drawer>
    );
};

export default PropertyBottomSheet;
