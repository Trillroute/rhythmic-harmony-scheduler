
import React from 'react';
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

console.log('Creating React root');
const root = createRoot(rootElement);

// Main application render
console.log('Rendering React application');
root.render(
  <React.StrictMode>
    <ErrorBoundary fallback={
      <div className="flex flex-col items-center justify-center h-screen bg-background p-4">
        <div className="w-full max-w-md p-6 bg-card rounded-lg shadow-lg border border-border">
          <h1 className="text-2xl font-bold mb-4 text-foreground">Application Error</h1>
          <p className="text-muted-foreground mb-6">
            The application encountered a critical error and could not start. Please try reloading the page.
          </p>
          <button
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            onClick={() => window.location.reload()}
          >
            Reload Application
          </button>
        </div>
      </div>
    }>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <App />
          {/* Remove this Toaster as it's already included in App.tsx */}
          {/* <Toaster /> */}
        </QueryClientProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);

console.log('Application rendering complete');
