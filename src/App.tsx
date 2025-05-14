
import React, { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import Router from './routes';

// Main App component
function App() {
  return (
    <ErrorBoundary componentName="Root Application">
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<AppLoading />}>
            <Router />
            <Toaster />
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

// Simple loading component
const AppLoading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <p className="text-muted-foreground">Loading application...</p>
    </div>
  </div>
);

export default App;
