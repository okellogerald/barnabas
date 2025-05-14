import React, { PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthenticationManager } from '@/data/authentication/authentication.manager';
import { ROUTES } from './route.constants';

/**
 * Component for protecting routes that require authentication
 * Redirects to login page if user is not authenticated
 */
const ProtectedRoute: React.FC<PropsWithChildren> = ({ children }) => {
    const location = useLocation();
    const isAuthenticated = AuthenticationManager.instance.isAuthenticated;

    if (!isAuthenticated) {
        // Redirect to login page with the return url
        return <Navigate to={ROUTES.LOGIN} state={{ from: location.pathname }} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;