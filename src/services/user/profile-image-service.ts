
import { supabase } from '@/integrations/supabase/client';

/**
 * Updates a user's profile image in Supabase storage and updates the profile record
 */
export const updateProfileImage = async (userId: string, file: File): Promise<string> => {
  try {
    // Upload file to storage
    const fileName = `${userId}-${Date.now()}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('profile-images')
      .upload(`public/${fileName}`, file);

    if (uploadError) {
      console.error('Error uploading profile image:', uploadError);
      throw new Error(uploadError.message);
    }

    // Get public URL
    const { data: urlData } = await supabase.storage
      .from('profile-images')
      .getPublicUrl(`public/${fileName}`);

    const imageUrl = urlData.publicUrl;

    // Update user profile with image URL
    // Use profile_image_url as the field name
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ profile_image_url: imageUrl })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating profile with image URL:', updateError);
      throw new Error(updateError.message);
    }

    return imageUrl;
  } catch (error: any) {
    console.error('Unexpected error updating profile image:', error);
    throw new Error(error.message || 'Failed to upload image');
  }
};
