import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { App as AntApp } from 'antd';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppRoutes from './navigation/routes';
import ThemeProvider from './theme/provider';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

/**
 * Main App component
 * Provides global providers and routing using Ant Design's App component for notifications
 */
const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AntApp>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter >
            <AppRoutes />
          </BrowserRouter>
        </QueryClientProvider>
      </AntApp>
    </ThemeProvider>
  );
};

export default App;