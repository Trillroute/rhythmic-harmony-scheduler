
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function getInitialSession() {
      setIsLoading(true);
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        toast({
          title: 'Authentication error',
          description: 'Could not retrieve your session. Please try again.',
          variant: 'destructive',
        });
      }
      
      setSession(session);
      setUser(session?.user || null);
      
      if (session?.user) {
        await fetchUserRole(session.user.id);
      }
      
      setIsLoading(false);
    }
    
    getInitialSession();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user || null);
        
        if (session?.user) {
          await fetchUserRole(session.user.id);
        } else {
          setUserRole(null);
        }
        
        setIsLoading(false);
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
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
      
      // Clean up existing auth state to avoid conflicts
      cleanupAuthState();
      
      // Make sure the role is passed correctly in the metadata
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role
          }
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
          description: 'Welcome to Music School!',
        });
        
        // Explicitly log the user metadata for debugging
        console.log('User metadata:', data.user.user_metadata);
        
        navigate('/');
      }
    } catch (error) {
      console.error('Error in signUp:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Clean up existing auth state first
      cleanupAuthState();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
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
        navigate('/');
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
    }
  };
  
  const signOut = async () => {
    try {
      setIsLoading(true);
      
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
