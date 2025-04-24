
import { supabase } from '@/integrations/supabase/client';

export const updateProfile = async (userId: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating profile:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, profile: data };
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return { success: false, error: error.message };
  }
};

export const updateProfileImage = async (userId: string, imageUrl: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ profile_image_url: imageUrl })
      .eq('id', userId)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating profile image:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, profile: data };
  } catch (error: any) {
    console.error('Error updating profile image:', error);
    return { success: false, error: error.message };
  }
};

export const getProfileByUserId = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) {
      console.error('Error fetching profile:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, profile: data };
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return { success: false, error: error.message };
  }
};
