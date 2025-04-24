
import { supabase } from '@/integrations/supabase/client';
import { signInWithEmail, signUpWithEmail, signOutUser } from '../authUtils';
import { toast } from 'sonner';
import { twoFactorService } from '@/services/auth/two-factor-service';

export function useAuthMethods(setLoading: (loading: boolean) => void) {
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const result = await signInWithEmail(email, password);
      
      if (result.error) throw result.error;
      
      // Check if 2FA is required for this user
      try {
        const requires2FA = await twoFactorService.isEnabled();
        
        if (requires2FA) {
          // We need to handle 2FA verification in the UI
          // This will be handled in the login component by checking the return value
          return { success: true, requires2FA: true, user: result.user };
        }
      } catch (twoFactorError) {
        console.error('[AuthProvider] 2FA check error:', twoFactorError);
        // Continue with normal sign-in if 2FA check fails
      }
      
      return { success: true, requires2FA: false, user: result.user };
    } catch (error) {
      console.error('[AuthProvider] Sign in error:', error);
      toast.error(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const verify2FA = async (token: string): Promise<boolean> => {
    try {
      setLoading(true);
      return await twoFactorService.verify(token);
    } catch (error) {
      console.error('[AuthProvider] 2FA verification error:', error);
      toast.error(`Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
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

  return { signIn, signUp, signOut, verify2FA };
}
