import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token'));

    useEffect(() => {
        const initializeAuth = async () => {
            const savedToken = localStorage.getItem('token');
            if (savedToken) {
                setToken(savedToken);
            }
            setLoading(false);
        };

        initializeAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const result = await authService.login(email, password);
            if (result.success) {
                setUser({ email: result.data.email, role: result.data.role });
                setToken(result.data.token);
                localStorage.setItem('token', result.data.token);
            }
            return result;
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: error.message || "Błąd serwera" };
        }
    };

    const register = async (email, password, phoneNumber, firstName, lastName) => {
        try {
            const result = await authService.register(email, password, phoneNumber, firstName, lastName);
            if (result.success) {
                console.log(window.location.origin + "/weryfikacja?token=" + result.data.verificationToken);
            }
            return result;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    };
    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, register, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};