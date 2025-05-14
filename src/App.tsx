
import React from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import Router from './routes';
import { ErrorBoundary } from './components/ErrorBoundary';

// Main App component
function App() {
  return (
    <ErrorBoundary fallback={<div className="p-8">Something went wrong in the app. Please refresh and try again.</div>}>
      <AuthProvider>
        {/* Use Router component that defines all routes */}
        <Router />
        {/* Toaster should be placed here, outside of routes but inside AuthProvider */}
        <Toaster />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
