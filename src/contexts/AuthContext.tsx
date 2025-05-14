
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/lib/types';
import type { User, Session } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';

interface AuthContextProps {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isLoading: boolean; // Explicitly added for components that expect this prop
  signOut?: () => Promise<void>;
  error: Error | null;
  userRole: UserRole | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextProps>({
  user: null,
  session: null,
  loading: true,
  isLoading: true,
  error: null,
  userRole: null,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Use direct window location instead of useNavigate to avoid Router conflicts
  const navigate = (path: string) => {
    window.location.href = path;
  };
  
  useEffect(() => {
    console.log('Starting auth initialization');
    
    // Set up auth state listener FIRST to prevent missing auth events during initialization
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (newSession?.user) {
          setUser(newSession.user);
          setSession(newSession);
          
          // Defer database operations with setTimeout to prevent auth deadlock
          setTimeout(async () => {
            try {
              // Fetch user role from profiles table when auth state changes
              const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', newSession.user.id)
                .single();
              
              if (profileError) {
                console.error('Error fetching user role:', profileError);
              } else if (profileData) {
                setUserRole(profileData.role as UserRole);
              }
            } catch (err) {
              console.error('Error in auth state change handler:', err);
            }
          }, 0);
        } else {
          setUser(null);
          setUserRole(null);
          setSession(null);
        }
      }
    );

    // THEN check for existing session
    const initAuth = async () => {
      try {
        // Get session from Supabase
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          setSession(session);
          
          // Fetch user role from profiles table
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
          
          if (profileError) {
            console.error('Error fetching user role:', profileError);
            setError(new Error(profileError.message));
          } else if (profileData) {
            setUserRole(profileData.role as UserRole);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError(err instanceof Error ? err : new Error('Auth initialization failed'));
      } finally {
        setLoading(false);
        console.log('Auth initialization complete');
      }
    };
    
    initAuth();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Helper function to clean up auth state
  const cleanupAuthState = () => {
    // Remove standard auth tokens
    localStorage.removeItem('supabase.auth.token');
    // Remove all Supabase auth keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    // Remove from sessionStorage if in use
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  };
  
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Clean up existing auth state
      cleanupAuthState();
      
      // Attempt global sign out first
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
        console.log('Global sign out failed, continuing with login');
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Fetch user role after successful login
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();
        
        if (profileError) {
          console.error('Error fetching user role:', profileError);
          throw profileError;
        }
        
        setUserRole(profileData.role as UserRole);
        
        // Navigate based on role
        if (profileData.role === 'admin') {
          navigate('/admin');
        } else if (profileData.role === 'teacher') {
          navigate('/dashboard');
        } else if (profileData.role === 'student') {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err : new Error('Failed to login'));
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const signup = async (email: string, password: string, name: string, role: UserRole) => {
    try {
      setLoading(true);
      setError(null);
      
      // Clean up existing auth state
      cleanupAuthState();
      
      // Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
          },
        },
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Show success message
        toast.success('Account created successfully! You can now log in.');
        navigate('/login');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError(err instanceof Error ? err : new Error('Failed to sign up'));
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Clean up auth state
      cleanupAuthState();
      
      // Attempt global sign out
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) throw error;
      
      setUser(null);
      setUserRole(null);
      setSession(null);
      
      // Force page reload for a clean state
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
      setError(err instanceof Error ? err : new Error('Failed to logout'));
    } finally {
      setLoading(false);
    }
  };
  
  const contextValue: AuthContextProps = {
    user,
    session,
    loading,
    isLoading: loading, // Add isLoading as an alias for loading
    signOut: logout,
    error,
    userRole,
    login,
    signup,
    logout,
  };
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
