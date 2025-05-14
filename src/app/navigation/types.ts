/**
 * Navigation parameters for different routes
 */
export interface NavigationParams {
    member: {
        fellowshipId?: string;
    };
    envelope: {
        isAssigned?: boolean;
        memberId?: string;
    };
}

/**
 * Props for the ProtectedRoute component
 */
export interface ProtectedRouteProps {
    children: React.ReactNode;
}
