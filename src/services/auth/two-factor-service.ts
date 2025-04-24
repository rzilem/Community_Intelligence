
import { supabase } from '@/integrations/supabase/client';

export const twoFactorService = {
  async isEnabled(): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('check_totp_status');
      
      if (error) throw error;
      
      return data?.enabled || false;
    } catch (error) {
      console.error('Error checking 2FA status:', error);
      return false;
    }
  },
  
  async setup(): Promise<{ secret: string; qrCode: string }> {
    try {
      // For the demo, we're not actually implementing TOTP generation
      // In a real app, this would call a Supabase function to generate a TOTP secret
      const mockSecret = 'ABCDEFGHIJKLMNOP';
      
      return {
        secret: mockSecret,
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/CommunityIntelligence:user@example.com?secret=${mockSecret}&issuer=CommunityIntelligence`
      };
    } catch (error) {
      console.error('Error setting up 2FA:', error);
      throw error;
    }
  },
  
  async verify(token: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('verify_totp', { p_token: token });
      
      if (error) throw error;
      
      return data?.valid || false;
    } catch (error) {
      console.error('Error verifying 2FA token:', error);
      return false;
    }
  },
  
  async disable(): Promise<boolean> {
    try {
      await supabase.rpc('delete_totp_secret');
      return true;
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      return false;
    }
  }
};
