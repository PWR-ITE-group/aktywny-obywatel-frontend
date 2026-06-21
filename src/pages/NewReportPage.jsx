import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Container, Box, Button, Typography, CircularProgress, AppBar, Toolbar, IconButton,
    MobileStepper, Paper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SendIcon from '@mui/icons-material/Send';
import toast from 'react-hot-toast';

import StepCategory from '../components/ReportForm/StepCategory';
import StepDetails from '../components/ReportForm/StepDetails';
import StepLocation from '../components/ReportForm/StepLocation';
import StepConfirm from '../components/ReportForm/StepConfirm';
import { complaintService } from '../services/complaintService';
import { useAuth } from '../context/AuthContext';

const STEPS = ['Przedmiot wniosku', 'Opis i zdjęcia', 'Lokalizacja', 'Potwierdzenie'];

const INITIAL_FORM = {
    categoryId: '',     // Techniczne ID kategorii przekazywane do backendu (np. 'roads')
    categoryLabel: '',  // Czytelna etykieta wyświetlana na podsumowaniu (np. 'Drogi i ulice')
    title: '',          // Wybrany dokładny temat zgłoszenia (np. 'Dziury w drodze...')
    description: '',
    photos: [],
    location: null,     // Tablica [lat, lng]
    addressDetails: null // Pełny obiekt adresowy z geokodera Nominatim
};

const NewReportPage = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [uploadingAttachments, setUploadingAttachments] = useState(false);
    const navigate = useNavigate();
    const { state } = useLocation();
    const { user } = useAuth();

    // Jeżeli na HomePage kliknięto chip kategorii — wstępnie wybierz ją
    useEffect(() => {
        if (state?.prefilledCategory) {
            setFormData((prev) => ({ ...prev, categoryId: state.prefilledCategory }));
        }
    }, [state]);

    const updateForm = (changes) => {
        setFormData((prev) => ({ ...prev, ...changes }));
    };

    const canProceed = () => {
        if (activeStep === 0) return Boolean(formData.title); // Tytuł jest wymagany
        if (activeStep === 2) return Boolean(formData.location);
        return true;
    };

    const handleNext = () => setActiveStep((s) => s + 1);
    const handleBack = () => {
        if (activeStep === 0) {
            navigate(-1);
        } else {
            setActiveStep((s) => s - 1);
        }
    };
    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const osm = formData.addressDetails;

            // Kategoria idzie do backendu bez zmian - klucze kategorii i reguł routingu
            // są spójne (np. 'roads' = 'roads'). Fallback tylko gdy pole puste.
            let backendCategory = formData.categoryId || 'other';

            // 2. Upewniamy się, że ID użytkownika to czysta liczba (Long), usuwając ryzyko przekazania stringa
            const rawUserId = user?.id ? Number(user.id) : 1;

            // 3. Budujemy payload kropka w kropkę pod ComplaintRequestDto oraz AddressDto
            const complaintData = {
                title: formData.title || "Nowe zgłoszenie",
                category: backendCategory,
                description: formData.description?.trim() || "Brak opisu",
                userId: user?.id ? Number(user.id) : (localStorage.getItem('userId') ? Number(localStorage.getItem('userId')) : 1),
                address: {
                    displayName: osm?.display_name || "Nieznany adres",
                    latitude: formData.location ? formData.location[0] : 51.107883,
                    longitude: formData.location ? formData.location[1] : 17.038538,
                    osmPlaceId: osm?.place_id ? Number(osm.place_id) : 0,
                    street: osm?.address?.road || "Nieznana ulica",
                    houseNumber: osm?.address?.house_number || "",
                    city: osm?.address?.city || osm?.address?.town || osm?.address?.village || "Wrocław",
                    postalCode: osm?.address?.postcode || "00-000",
                    country: osm?.address?.country || "Polska"
                }
            };

            console.log("Wysyłany payload do backendu:", complaintData);
            // DODAJ TO TUŻ PRZED WYSYŁKĄ:
            console.log("DOKŁADNY PAYLOAD WYSYŁANY DO MICHAŁA:");
            console.log(JSON.stringify(complaintData, null, 2));


            const createdComplaint = await complaintService.create(complaintData);

            // 2. Jeśli użytkownik załączył pliki graficzne, wysyłamy je w pętli sekwencyjnie
            if (formData.photos && formData.photos.length > 0) {
                setUploadingAttachments(true);
                const uploadPromises = formData.photos.map(photo =>
                    complaintService.addAttachment(createdComplaint.id, photo)
                );
                await Promise.all(uploadPromises);
                setUploadingAttachments(false);
            }

            toast.success('Zgłoszenie zostało złożone!');
            navigate('/dashboard');
        } catch (error) {
            console.error('Błąd podczas składania zgłoszenia:', error);

            if (error.response && error.response.status === 400) {
                toast.error('Uzupełnij brakujące dane (np. dokładny adres).');
            } else {
                toast.error('Nie udało się złożyć zgłoszenia. Spróbuj ponownie.');
            }
        } finally {
            setSubmitting(false);
        }
    };
    const renderStep = () => {
        switch (activeStep) {
            case 0:
                return (
                    <StepCategory
                        value={formData.title}
                        onChange={(title) => updateForm({ title })}
                        // Zapisujemy techniczny slug do bazy oraz etykietę dla widoku podsumowania
                        onCategoryChange={(categoryId, categoryLabel) => updateForm({ categoryId, categoryLabel })}
                    />
                );
            case 1:
                return (
                    <StepDetails
                        description={formData.description}
                        photos={formData.photos}
                        priority={formData.priority}
                        onChange={updateForm}
                    />
                );
            case 2:
                return (
                    <StepLocation
                        location={formData.location}
                        // Odbieramy punkt oraz pełne metadane adresowe z OpenStreetMap
                        onChange={(location, addressDetails) => updateForm({ location, addressDetails })}
                    />
                );
            case 3:
                return <StepConfirm formData={formData} />;
            default:
                return null;
        }
    };

    const isLast = activeStep === STEPS.length - 1;

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
            <AppBar position="sticky" color="inherit" elevation={0}>
                <Toolbar sx={{ minHeight: 56 }}>
                    <IconButton edge="start" onClick={() => navigate(-1)} aria-label="Zamknij">
                        <CloseIcon />
                    </IconButton>
                    <Typography
                        variant="subtitle1"
                        fontWeight={600}
                        sx={{ flex: 1, textAlign: 'center' }}
                    >
                        {STEPS[activeStep]}
                    </Typography>
                    <IconButton edge="end" aria-label="Pomoc">
                        <HelpOutlineIcon />
                    </IconButton>
                </Toolbar>
                <MobileStepper
                    variant="progress"
                    steps={STEPS.length}
                    position="static"
                    activeStep={activeStep}
                    sx={{
                        bgcolor: 'transparent',
                        p: 0,
                        '& .MuiLinearProgress-root': { width: '100%', height: 3, borderRadius: 0 },
                    }}
                    backButton={null}
                    nextButton={null}
                />
            </AppBar>

            <Container maxWidth="md" sx={{ flexGrow: 1, py: 3 }}>
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 2, sm: 3 },
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    {renderStep()}
                </Paper>
            </Container>

            <Box
                sx={{
                    position: 'sticky',
                    bottom: 0,
                    bgcolor: 'background.paper',
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    p: 2,
                    display: 'flex',
                    gap: 1,
                    zIndex: 1100
                }}
            >
                <Button
                    onClick={handleBack}
                    startIcon={<ArrowBackIcon />}
                    sx={{ flex: activeStep === 0 ? 0 : 1 }}
                >
                    {activeStep === 0 ? 'Anuluj' : 'Wstecz'}
                </Button>

                {!isLast ? (
                    <Button
                        variant="contained"
                        endIcon={<ArrowForwardIcon />}
                        onClick={handleNext}
                        disabled={!canProceed()}
                        sx={{ flex: 2 }}
                    >
                        Dalej
                    </Button>
                ) : (
                    <Button
                        variant="contained"
                        color="primary"
                        endIcon={
                            submitting || uploadingAttachments ? <CircularProgress size={16} color="inherit" /> : <SendIcon />
                        }
                        onClick={handleSubmit}
                        disabled={submitting || uploadingAttachments || !formData.location}
                        sx={{ flex: 2 }}
                    >
                        {submitting || uploadingAttachments ? 'Wysyłanie...' : 'Złóż zgłoszenie'}
                    </Button>
                )}
            </Box>
        </Box>
    );
};

export default NewReportPage;