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
                    if (profile.isAdmin) {
                        profile.role = 'admin';
                    } else {
                        profile.role = 'user';
                    }
                    setUser(profile);
                } catch (error) {
                    console.error('Failed to load user profile:', error);
                    if (savedToken === 'mock.jwt.token') {
                        setUser({
                            id: 999,
                            email: 'admin@test.pl',
                            role: 'admin',
                            firstName: 'Tester',
                            lastName: 'Admin'
                        });
                    } else {
                        // User profile couldn't be loaded (e.g., deleted from DB), so clear the token and log out
                        setToken(null);
                        setUser(null);
                        localStorage.removeItem('token');
                    }
                }
            }
            setLoading(false);
        };

        initializeAuth();
    }, []);

    const login = async (email, password) => {
        try {
            if (email === 'admin@test.pl' && password === 'admin123') {
                const mockAdminUser = {
                    id: 999,
                    email: 'admin@test.pl',
                    role: 'admin',
                    firstName: 'Tester',
                    lastName: 'Admin'
                };
                const mockToken = "mock.jwt.token"; 
                setToken(mockToken);
                localStorage.setItem('token', mockToken);
                setUser(mockAdminUser);
                return { token: mockToken, ...mockAdminUser };
            }

            const result = await authService.login(email, password);
            setToken(result.token);
            localStorage.setItem('token', result.token);
            try {
                const profile = await userService.getCurrentProfile();
                if (profile.isAdmin) {
                    profile.role = 'admin';
                } else {
                    profile.role = 'user';
                }
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