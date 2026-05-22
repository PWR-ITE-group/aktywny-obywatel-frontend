import { createContext, useContext, useState, useEffect } from 'react';
import api from '../config/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token'));

    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        if (savedToken) {
            setToken(savedToken);
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        return api.post('/api/auth/login', {
            email: email, password: password
        }).then((response) => {
            console.log(response.data);
            if (response.data.success) {
                setUser({ email: response.data.data.email, role: response.data.data.role });
                setToken(response.data.data.token);
                localStorage.setItem('token', response.data.data.token);
            }
            return response.data;
        }).catch((error) => {
            return { success: error.response?.data?.success || false, message: error.response?.data?.message || "Błąd serwera" };
        });
    };

    const register = async (email, password, phoneNumber) => {
        return api.post("/api/auth/register", {
            email: email, password: password, phoneNumber: phoneNumber
        }).then((response) => {
            console.log(response.data);
            if (response.data.success) {
                console.log(window.location.origin + "/weryfikacja?token=" + response.data.data.verificationToken);
            }
            return response.data;
        }).catch((error) => {
            console.error(error);
            throw error;
        });
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