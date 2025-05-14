
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { toast } from '@/components/ui/sonner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showLoadingMessage, setShowLoadingMessage] = useState(false);
  const { login, isLoading, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get the "from" redirect path if available
  const from = location.state?.from?.pathname || '/';
  
  // Reset loading state when component mounts
  useEffect(() => {
    // Force loading state to false on mount
    setShowLoadingMessage(false);
    
    // Show loading message after delay if still loading
    const loadingTimer = setTimeout(() => {
      if (isLoading) {
        setShowLoadingMessage(true);
      }
    }, 2000);

    // If we have a user already, redirect to appropriate page
    if (user) {
      navigate(from, { replace: true });
    }
    
    // Check if we have a session expired message
    const sessionExpired = new URLSearchParams(location.search).get('session_expired');
    if (sessionExpired === 'true') {
      setErrorMessage('Your session has expired. Please sign in again.');
    }

    return () => {
      clearTimeout(loadingTimer);
    };
  }, [isLoading, user, navigate, from, location.search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    
    try {
      console.log('Attempting login with:', { email });
      // Call the login function directly from context
      await login(email, password);
      // Success notification is handled inside login function
      console.log('Login successful');
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof Error) {
        setErrorMessage(error.message || 'An error occurred during sign in');
      } else {
        setErrorMessage('An unexpected error occurred');
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Sign In</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {errorMessage && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
            
            {showLoadingMessage && isLoading && (
              <Alert>
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertTitle>Checking session...</AlertTitle>
                <AlertDescription>
                  We're verifying your authentication status. This should only take a moment.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email"
                type="email" 
                placeholder="Enter your email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password"
                type="password" 
                placeholder="Enter your password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : 'Sign In'}
            </Button>
            <p className="text-sm text-center text-gray-500">
              Don't have an account?{' '}
              <Link to="/signup" className="text-blue-500 hover:underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Login;
