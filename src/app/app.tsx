import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { App as AntApp } from 'antd';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppRoutes from './navigation/routes';
import ThemeProvider from './theme/provider';
import { ToastContainer } from 'react-toastify';
import NiceModal from '@ebay/nice-modal-react';

// Create a client for React Query
export const queryClient = new QueryClient({
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
      <NiceModal.Provider>
        <AntApp>
          <QueryClientProvider client={queryClient}>
            <BrowserRouter >
              <AppRoutes />
            </BrowserRouter>
            <ToastContainer />
          </QueryClientProvider>
        </AntApp>
      </NiceModal.Provider>
    </ThemeProvider>
  );
};

export default App;