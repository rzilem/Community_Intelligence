
import { supabase } from '@/integrations/supabase/client';

/**
 * Updates a user's profile image in Supabase storage and updates the profile record
 */
export const updateProfileImage = async (userId: string, file: File): Promise<{ url?: string; error?: string }> => {
  try {
    // Upload file to storage
    const fileName = `${userId}-${Date.now()}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('profile-images')
      .upload(`public/${fileName}`, file);

    if (uploadError) {
      console.error('Error uploading profile image:', uploadError);
      return { error: uploadError.message };
    }

    // Get public URL
    const { data: urlData } = await supabase.storage
      .from('profile-images')
      .getPublicUrl(`public/${fileName}`);

    const imageUrl = urlData.publicUrl;

    // Update user profile with image URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: imageUrl })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating profile with image URL:', updateError);
      return { error: updateError.message };
    }

    return { url: imageUrl };
  } catch (error: any) {
    console.error('Unexpected error updating profile image:', error);
    return { error: error.message };
  }
};
