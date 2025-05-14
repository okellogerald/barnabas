import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/app';

/**
 * Not Found Page (404)
 * Displayed when a user navigates to a route that doesn't exist
 */
const NotFoundPage: React.FC = () => {
    const navigate = useNavigate();

    // Function to navigate back to dashboard
    const handleGoHome = () => {
        navigate(ROUTES.DASHBOARD);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
            <div className="text-center max-w-md">
                <h1 className="text-9xl font-bold text-indigo-600">404</h1>

                <div className="mt-4 mb-8">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Page Not Found</h2>
                    <p className="text-gray-600">
                        The page you're looking for doesn't exist or has been moved.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <button
                        onClick={handleGoHome}
                        className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-300"
                    >
                        Go to Dashboard
                    </button>

                    <button
                        onClick={() => window.history.back()}
                        className="px-6 py-3 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors duration-300"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotFoundPage;