
import React, { useEffect } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import Router from './routes';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useNavigate } from 'react-router-dom';

// TEMPORARY DIAGNOSTIC TEST COMPONENT
const DiagnosticTest = () => {
  console.log('DiagnosticTest component rendered');
  return <div className="p-8 bg-green-100">App Loaded - Diagnostic Test</div>;
};

// Main App component
function App() {
  console.log('App component mounting...');
  const navigate = useNavigate();
  
  // Global diagnostic logging
  useEffect(() => {
    console.log('App component mounted - useEffect triggered');
    
    // Attempt to force a route render
    setTimeout(() => {
      console.log('Attempting to navigate to /dashboard');
      // navigate('/dashboard'); // Uncomment if needed
    }, 1000);
    
    // Log any unhandled promise rejections
    const unhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled Promise Rejection:', event.reason);
    };
    
    window.addEventListener('unhandledrejection', unhandledRejection);
    
    return () => {
      console.log('App component unmounting');
      window.removeEventListener('unhandledrejection', unhandledRejection);
    };
  }, [navigate]);

  // Fallback UI for error boundary
  const fallbackUI = (
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
  );

  console.log('App rendering... attempting two render paths');

  // OPTION 1: Render just the diagnostic component to test basic rendering
  // return <DiagnosticTest />;
  
  // OPTION 2: Render with AuthProvider commented out
  return (
    <ErrorBoundary fallback={fallbackUI}>
      {/* Comment out AuthProvider to test if it's blocking renders */}
      {/* <AuthProvider> */}
        <div className="min-h-screen">
          <div className="p-8 bg-yellow-100 mb-4">
            <h2 className="text-xl font-bold">Diagnostic Header</h2>
            <p>If you can see this, basic rendering is working</p>
          </div>
          {/* Use Router component that defines all routes */}
          <Router />
          <Toaster />
        </div>
      {/* </AuthProvider> */}
    </ErrorBoundary>
  );
  
  // OPTION 3: Original rendering with AuthProvider (commented out for testing)
  /* return (
    <ErrorBoundary fallback={fallbackUI}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </ErrorBoundary>
  ); */
}

export default App;
