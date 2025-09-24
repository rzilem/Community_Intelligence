import { supabase } from '@/integrations/supabase/client';
import type { Profile } from './AuthProvider';

export const userService = {
  async getProfile(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, return null
          return null;
        }
        throw error;
      }

      return data as Profile;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  async createProfile(profileData: Partial<Profile>): Promise<Profile> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single();

      if (error) throw error;

      return data as Profile;
    } catch (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
  },

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      return data as Profile;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }
};