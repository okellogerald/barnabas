import React, { PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthManager } from '@/managers/auth/auth.manager';
import { ROUTES } from './constants';

/**
 * Component for protecting routes that require authentication
 * Redirects to login page if user is not authenticated
 */
const ProtectedRoute: React.FC<PropsWithChildren> = ({ children }) => {
    const location = useLocation();
    const isAuthenticated = AuthManager.instance.isAuthenticated;

    if (!isAuthenticated) {
        // Redirect to login page with the return url
        return <Navigate to={ROUTES.LOGIN} state={{ from: location.pathname }} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;