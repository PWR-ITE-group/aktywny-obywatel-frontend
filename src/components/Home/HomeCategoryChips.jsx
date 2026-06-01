import { Box, Stack, Typography } from '@mui/material';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import HouseIcon from '@mui/icons-material/House';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Szybkie skróty do kategorii — jak "Śnieg i lód", "Sople na dachu" na screenie.

const QUICK_CATEGORIES = [
    /*
    { id: 'snieg',  label: 'Śnieg i lód',   icon: <AcUnitIcon fontSize="small" />,         category: 'Drogi i chodniki' },
    { id: 'sople',  label: 'Sople na dachu', icon: <HouseIcon fontSize="small" />,          category: 'Bezpieczeństwo' },
    { id: 'smieci', label: 'Śmieci',         icon: <DeleteOutlineIcon fontSize="small" />,  category: 'Odpady' },
    { id: 'oswietl', label: 'Oświetlenie',   icon: <LightbulbOutlinedIcon fontSize="small" />, category: 'Oświetlenie' },
*/];


const HomeCategoryChips = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const go = (category) => {
        if (!user) {
            // Przekieruj do logowania z informacją o wybranej kategorii
            navigate('/logowanie', {
                state: {
                    from: '/nowe-zgloszenie',
                    prefilledCategory: category
                }
            });
            return;
        }
        // Przekazujemy kategorię przez state, żeby StepCategory mogła ją wstępnie wybrać
        navigate('/nowe-zgloszenie', { state: { prefilledCategory: category } });
    };

    return (
        <Box
            sx={{
                display: 'flex',
                gap: 1.5,
                overflowX: 'auto',
                px: 2,
                pb: 1.5,
                '&::-webkit-scrollbar': { display: 'none' },
                scrollbarWidth: 'none',
            }}
        >
            {QUICK_CATEGORIES.map((c) => (
                <Stack
                    key={c.id}
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    onClick={() => go(c.category)}
                    sx={{
                        bgcolor: 'background.paper',
                        borderRadius: 999,
                        px: 2, py: 1.25,
                        boxShadow: '0 1px 3px rgba(17,24,39,0.08)',
                        border: '1px solid rgba(17, 24, 39, 0.06)',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        color: 'text.primary',
                        transition: 'transform 0.1s',
                        '&:active': { transform: 'scale(0.97)' },
                    }}
                >
                    <Box sx={{ color: 'primary.main', display: 'flex' }}>{c.icon}</Box>
                    <Typography variant="body2" fontWeight={500}>{c.label}</Typography>
                </Stack>
            ))}
        </Box>
    );
};

export default HomeCategoryChips;
