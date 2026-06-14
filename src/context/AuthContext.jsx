import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { userService } from '../services/userService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token'));

    const parseJwt = (token) => {
        try {
            return JSON.parse(atob(token.split('.')[1]));
        } catch (e) {
            return null;
        }
    };

    useEffect(() => {
        const initializeAuth = async () => {
            const savedToken = localStorage.getItem('token');
            if (savedToken) {
                setToken(savedToken);
                try {
                    const profile = await userService.getCurrentProfile();
                    setUser(profile);
                } catch (error) {
                    console.error('Failed to load user profile:', error);
                    const tokenData = parseJwt(savedToken);
                    setUser({
                        id: 1, // Fallback ID
                        email: tokenData?.sub || 'user@example.com',
                        role: 'user' // Default role
                    });
                }
            }
            setLoading(false);
        };

        initializeAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const result = await authService.login(email, password);
            setToken(result.token);
            localStorage.setItem('token', result.token);
            try {
                const profile = await userService.getCurrentProfile();
                setUser(profile);
            } catch {
                setUser({
                    id: 1, // Fallback ID
                    email: result.email,
                    role: result.role || 'user',
                    ...result
                });
            }
            return result;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const register = async (email, password, phoneNumber, firstName, lastName) => {
        try {
            const result = await authService.register(email, password, phoneNumber, firstName, lastName);
            console.log(window.location.origin + "/weryfikacja?token=" + result.verificationToken);
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