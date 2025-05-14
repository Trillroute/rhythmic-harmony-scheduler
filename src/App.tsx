
import React from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import Router from './routes';
import { ErrorBoundary } from './components/ErrorBoundary';

// Main App component
function App() {
  return (
    <ErrorBoundary fallback={
      <div className="p-8 max-w-2xl mx-auto mt-16 bg-destructive/10 border border-destructive/30 rounded-lg">
        <h2 className="text-2xl font-bold text-destructive mb-4">Application Error</h2>
        <p className="text-muted-foreground mb-6">
          The application encountered a critical error and could not render properly. Technical details:
        </p>
        <div className="bg-card p-4 rounded overflow-auto max-h-48 mb-6">
          <pre className="text-sm text-muted-foreground whitespace-pre-wrap">
            Error initializing application. See the console for more details.
          </pre>
        </div>
        <button
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          onClick={() => window.location.reload()}
        >
          Reload Application
        </button>
      </div>
    }>
      <AuthProvider>
        {/* Use Router component that defines all routes */}
        <Router />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
