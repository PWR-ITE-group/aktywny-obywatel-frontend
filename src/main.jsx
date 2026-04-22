import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast';
import './index.css';
import App from './App.jsx';
import theme from './theme.js';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <App />
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: { fontFamily: 'Roboto, sans-serif' },
                }}
            />
        </ThemeProvider>
    </StrictMode>
);