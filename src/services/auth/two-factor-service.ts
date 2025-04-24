
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TwoFactorSetupResponse {
  secretKey: string;
  qrCodeUrl: string;
}

/**
 * Service for handling two-factor authentication operations
 */
export const twoFactorService = {
  /**
   * Setup two-factor authentication for a user
   * @returns Secret key and QR code URL for setup
   */
  async setup(): Promise<TwoFactorSetupResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('setup-2fa', {
        method: 'POST',
      });

      if (error) throw error;
      
      return {
        secretKey: data.secret,
        qrCodeUrl: data.qrCode,
      };
    } catch (error) {
      console.error('Failed to setup 2FA:', error);
      throw new Error('Failed to set up two-factor authentication');
    }
  },

  /**
   * Verify a two-factor code during setup
   * @param token The verification token from the authenticator app
   * @returns Whether the token is valid
   */
  async verifySetup(token: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('verify-2fa-setup', {
        method: 'POST',
        body: { token },
      });

      if (error) throw error;
      
      return data.valid || false;
    } catch (error) {
      console.error('Failed to verify 2FA setup:', error);
      return false;
    }
  },

  /**
   * Verify a two-factor code during login
   * @param token The verification token from the authenticator app
   * @returns Whether the token is valid
   */
  async verify(token: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('verify-2fa', {
        method: 'POST',
        body: { token },
      });

      if (error) throw error;
      
      return data.valid || false;
    } catch (error) {
      console.error('Failed to verify 2FA token:', error);
      return false;
    }
  },

  /**
   * Disable two-factor authentication for the current user
   * @returns Whether the operation was successful
   */
  async disable(): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('disable-2fa', {
        method: 'POST',
      });

      if (error) throw error;
      
      toast.success('Two-factor authentication has been disabled');
      return true;
    } catch (error) {
      console.error('Failed to disable 2FA:', error);
      toast.error('Failed to disable two-factor authentication');
      return false;
    }
  },

  /**
   * Check if the current user has two-factor authentication enabled
   * @returns Whether 2FA is enabled
   */
  async isEnabled(): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('check-2fa-status', {
        method: 'GET',
      });

      if (error) throw error;
      
      return data.enabled || false;
    } catch (error) {
      console.error('Failed to check 2FA status:', error);
      return false;
    }
  },
};
