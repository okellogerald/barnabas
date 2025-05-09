import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppProvider } from '@/app';

import './index.css'

// // Run the sample data generator
// import { ChurchApiClient } from './_dev/script';

// const apiClient = new ChurchApiClient();
// apiClient.initialize().catch(error => {
//   console.error('Failed to run sample data generator:', error);
// });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider />
  </StrictMode>,
)
