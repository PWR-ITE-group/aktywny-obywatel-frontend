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
        api.post('/api/auth/login', {
            email: email, password: password
        }).then((response) => {
            console.log(response.data);
            setUser(response.data);
            setToken('mock-token');
            localStorage.setItem('token', 'mock-token');
        }).catch((error) => console.error(error))
            .finally(() => console.log('Request complete'))
    };

    const register = async (email, password, phoneNumber) => {
        api.post("/api/auth/register", {
            email: email, password: password, phoneNumber: phoneNumber
        }).then((response) => {
            console.log(response.data);
            if (response.data.success) {
                alert(response.data.data.verificationToken);
                console.log("?token=" + response.data.data.verificationToken);
            }
        }).catch((error) => {
            console.error(error);
        }).finally(() => {
            console.log("Request complete");
        })
    }

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