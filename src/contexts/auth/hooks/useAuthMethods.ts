
import { supabase } from '@/integrations/supabase/client';
import { signInWithEmail, signUpWithEmail, signOutUser, sendMagicLink } from '../authUtils';
import { toast } from 'sonner';

export function useAuthMethods(setLoading: (loading: boolean) => void) {
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      await signInWithEmail(email, password);
    } catch (error) {
      console.error('[AuthProvider] Sign in error:', error);
      toast.error(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    userData: { first_name: string; last_name: string }
  ) => {
    try {
      setLoading(true);
      await signUpWithEmail(email, password, userData);
    } catch (error) {
      console.error('[AuthProvider] Sign up error:', error);
      toast.error(`Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithMagicLink = async (email: string) => {
    try {
      setLoading(true);
      await sendMagicLink(email);
      toast.success(`Magic link sent to ${email}. Check your email!`);
      return true;
    } catch (error) {
      console.error('[AuthProvider] Magic link error:', error);
      toast.error(`Failed to send magic link: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await signOutUser();
    } catch (error) {
      console.error('[AuthProvider] Sign out error:', error);
      toast.error(`Sign out failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { signIn, signUp, signOut, signInWithMagicLink };
}
