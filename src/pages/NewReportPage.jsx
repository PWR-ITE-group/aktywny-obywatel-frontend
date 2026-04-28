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

const STEPS = ['Przedmiot wniosku', 'Opis i zdjęcia', 'Lokalizacja', 'Potwierdzenie'];

const INITIAL_FORM = {
    category: '',
    description: '',
    photos: [],
    location: null,
};

const NewReportPage = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();
    const { state } = useLocation();

    // Jeżeli na HomePage kliknięto chip kategorii — wstępnie wybierz ją
    useEffect(() => {
        if (state?.prefilledCategory) {
            setFormData((prev) => ({ ...prev, category: state.prefilledCategory }));
        }
    }, [state]);

    const updateForm = (changes) => {
        setFormData((prev) => ({ ...prev, ...changes }));
    };

    const canProceed = () => {
        if (activeStep === 0) return Boolean(formData.category);
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
            await complaintService.create({
                category: formData.category,
                description: formData.description,
                location: {
                    lat: formData.location[0],
                    lng: formData.location[1],
                },
                photoCount: formData.photos.length,
            });
            toast.success('Zgłoszenie zostało złożone!');
            navigate('/dashboard');
        } catch {
            toast.error('Nie udało się złożyć zgłoszenia. Spróbuj ponownie.');
        } finally {
            setSubmitting(false);
        }
    };

    const renderStep = () => {
        switch (activeStep) {
            case 0:
                return (
                    <StepCategory
                        value={formData.category}
                        onChange={(category) => updateForm({ category })}
                    />
                );
            case 1:
                return (
                    <StepDetails
                        description={formData.description}
                        photos={formData.photos}
                        onChange={updateForm}
                    />
                );
            case 2:
                return (
                    <StepLocation
                        location={formData.location}
                        onChange={(location) => updateForm({ location })}
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
            {/* Górny pasek — X po lewej, tytuł kroku, ? po prawej */}
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

            {/* Sticky dolny pasek akcji */}
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
                            submitting ? <CircularProgress size={16} color="inherit" /> : <SendIcon />
                        }
                        onClick={handleSubmit}
                        disabled={submitting || !formData.location}
                        sx={{ flex: 2 }}
                    >
                        {submitting ? 'Wysyłanie...' : 'Złóż zgłoszenie'}
                    </Button>
                )}
            </Box>
        </Box>
    );
};

export default NewReportPage;
