
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { UserRole } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: UserRole | null;
  isLoading: boolean;
  signUp: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const cleanupAuthState = () => {
  // Only remove expired or temporary auth state items
  // We're more selective now to avoid removing active sessions
  
  // Remove items related to one-time tokens or errors
  localStorage.removeItem('supabase.auth.token');
  
  // Only clear specific auth-related temporary storage
  // This is safer than clearing all auth keys
  const keysToRemove = ['errorMessage', 'inviteToken', 'tempAuthState'];
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
  });
};

// Helper function to get redirect path based on user role
const getRoleBasedRedirectPath = (role: UserRole | null): string => {
  if (!role) return '/dashboard';
  
  switch(role) {
    case 'admin': return '/admin/dashboard';
    case 'teacher': return '/teacher/dashboard';
    case 'student': return '/student/dashboard';
    default: return '/dashboard';
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Initialize to false
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const navigate = useNavigate();

  // Initialize auth state on component mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Only set loading true for the initial auth check
        setIsLoading(true);
        console.log('Starting auth initialization');
        
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting initial session:', error);
          toast({
            title: 'Authentication error',
            description: 'Could not retrieve your session. Please try again.',
            variant: 'destructive',
          });
        }
        
        setSession(data?.session || null);
        setUser(data?.session?.user || null);
        
        if (data?.session?.user) {
          await fetchUserRole(data.session.user.id);
        }
      } catch (err) {
        console.error('Unexpected error during auth initialization:', err);
      } finally {
        // Always reset loading and mark initialization as complete
        setIsLoading(false);
        setInitialLoadComplete(true);
        console.log('Auth initialization complete');
      }
    };
    
    initializeAuth();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        setSession(session);
        setUser(session?.user || null);
        
        // Handle session expiration events
        if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          console.log(`Auth event ${event} detected`);
          
          if (!session) {
            // Session expired or user signed out
            setUserRole(null);
            toast({
              title: 'Session ended',
              description: 'Your session has ended. Please sign in again.',
            });
            navigate('/login');
            return;
          }
        }
        
        if (session?.user) {
          // Defer fetching user role to prevent potential deadlocks
          setTimeout(async () => {
            await fetchUserRole(session.user.id);
          }, 0);
        } else {
          setUserRole(null);
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);
  
  // Fetch user role from profiles table
  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching user role:', error);
        return;
      }
      
      if (data) {
        setUserRole(data.role as UserRole);
      }
    } catch (error) {
      console.error('Error in fetchUserRole:', error);
    }
  };
  
  const signUp = async (email: string, password: string, name: string, role: UserRole) => {
    try {
      setIsLoading(true);
      console.log('Starting signup process');
      
      // Clean up existing auth state to avoid conflicts
      cleanupAuthState();
      
      // Get the current app URL for redirection
      const appUrl = window.location.origin;
      
      // Make sure the role is passed correctly in the metadata
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role
          },
          emailRedirectTo: `${appUrl}/verify`,
        }
      });
      
      if (error) {
        // Log detailed error information
        console.error('Supabase signup error:', error);
        toast({
          title: 'Sign up failed',
          description: error.message,
          variant: 'destructive',
        });
        throw new Error(error.message);
      }
      
      if (data.user) {
        toast({
          title: 'Account created',
          description: 'Please check your email to verify your account.',
        });
        
        // Explicitly log the user metadata for debugging
        console.log('User metadata:', data.user.user_metadata);
        console.log('Redirect URL:', `${appUrl}/verify`);
        
        navigate('/');
      }
    } catch (error) {
      console.error('Error in signUp:', error);
      throw error;
    } finally {
      setIsLoading(false);
      console.log('Signup process complete, isLoading set to false');
    }
  };
  
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log('Starting signin process');
      
      // Clean up existing auth state first, but be more selective
      // to avoid removing critical authentication data
      cleanupAuthState();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Sign in error:', error);
        toast({
          title: 'Sign in failed',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }
      
      if (data.user) {
        toast({
          title: 'Signed in',
          description: 'Welcome back!',
        });
        
        // Fetch user role and redirect based on role
        try {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single();
            
          const role = profileData?.role as UserRole;
          setUserRole(role);
          
          // Redirect based on user role
          const redirectPath = getRoleBasedRedirectPath(role);
          navigate(redirectPath);
        } catch (roleError) {
          console.error('Error fetching user role for redirect:', roleError);
          // Default redirect if role fetch fails
          navigate('/');
        }
      }
    } catch (error) {
      console.error('Error in signIn:', error);
      toast({
        title: 'Sign in error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      console.log('Signin process complete, isLoading set to false');
    }
  };
  
  const signOut = async () => {
    try {
      setIsLoading(true);
      console.log('Starting signout process');
      
      // Clean up auth state
      cleanupAuthState();
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast({
          title: 'Sign out failed',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }
      
      toast({
        title: 'Signed out',
        description: 'You have been signed out successfully.',
      });
      
      navigate('/login');
    } catch (error) {
      console.error('Error in signOut:', error);
      toast({
        title: 'Sign out error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      console.log('Signout process complete, isLoading set to false');
    }
  };
  
  return (
    <AuthContext.Provider value={{
      user,
      session,
      userRole,
      isLoading,
      signUp,
      signIn,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
