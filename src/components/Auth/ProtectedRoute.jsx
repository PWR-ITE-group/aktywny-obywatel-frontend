import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole = 'user' }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Ładowanie...</div>;
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (requiredRole === 'admin' && user.role !== 'admin') {
        return <Navigate to="/" />;
    }

    return children;
};

export default ProtectedRoute;