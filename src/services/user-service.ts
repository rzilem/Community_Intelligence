
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/profile-types';

export const fetchUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    
    return { profile: data as Profile, error: null };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return { profile: null, error };
  }
};

export const updateUserProfile = async (userId: string, updates: Partial<Profile>) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select();
    
    if (error) throw error;
    
    return { profile: data[0] as Profile, error: null };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { profile: null, error };
  }
};
