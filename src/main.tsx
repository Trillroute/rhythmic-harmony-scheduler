
import React, { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import App from './App.tsx';
import './index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from './components/ErrorBoundary';

console.log('Application initialization started');

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      // Add default error handling
      onError: (error) => {
        console.error('Query error:', error);
      }
    },
    mutations: {
      // Add default error handling
      onError: (error) => {
        console.error('Mutation error:', error);
      }
    }
  }
});

// Global error handler for uncaught exceptions
window.addEventListener('error', (event) => {
  console.error('Uncaught error:', event.error);
});

// Global error handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('Root element not found');
  throw new Error('Root element not found');
}

// Fallback component for Suspense
const SuspenseFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <p className="text-muted-foreground">Loading app from Suspense...</p>
    </div>
  </div>
);

// Global error fallback
const GlobalErrorFallback = () => (
  <div className="flex flex-col items-center justify-center h-screen bg-background p-4">
    <div className="w-full max-w-md p-6 bg-card rounded-lg shadow-lg border border-border">
      <h1 className="text-2xl font-bold mb-4 text-foreground">Critical Error</h1>
      <p className="text-muted-foreground mb-6">
        The application encountered a critical error during initialization and could not start.
      </p>
      <button
        className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        onClick={() => window.location.reload()}
      >
        Reload Application
      </button>
    </div>
  </div>
);

console.log('Creating React root');
const root = createRoot(rootElement);

// Main application render
console.log('Rendering React application');
root.render(
  <React.StrictMode>
    <ErrorBoundary fallback={<GlobalErrorFallback />}>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <Suspense fallback={<SuspenseFallback />}>
            <App />
          </Suspense>
          {/* Remove this Toaster as it's already included in App.tsx */}
          {/* <Toaster /> */}
        </QueryClientProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);

console.log('Application rendering complete');
