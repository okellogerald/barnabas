import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { App as AntApp } from 'antd';
import { QueryClientProvider } from '@tanstack/react-query';
import AppRoutes from './navigation/routes';
import ThemeProvider from './theme/provider';
import { ToastContainer } from 'react-toastify';
import NiceModal from '@ebay/nice-modal-react';
import { queryClient } from '@/lib/query';

/**
 * AppProvider
 * ============
 * The root application component responsible for:
 * - Theme management
 * - Global Modals
 * - Query Client Provider (React Query)
 * - Routing
 * - Toast Notifications
 */
const AppProvider: React.FC = () => {
  return (
    <ThemeProvider>
      <NiceModal.Provider>
        <AntApp>
          <QueryClientProvider client={queryClient}>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
            <ToastContainer />
          </QueryClientProvider>
        </AntApp>
      </NiceModal.Provider>
    </ThemeProvider>
  );
};

export default AppProvider;
