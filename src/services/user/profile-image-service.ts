
import { supabase } from '@/integrations/supabase/client';

/**
 * Updates the user's profile image
 */
export const updateProfileImage = async (
  userId: string, 
  imageFile: File
): Promise<{ url: string | null; error: string | null }> => {
  try {
    // Validate file
    if (!imageFile) {
      return { url: null, error: 'No file provided' };
    }
    
    // Validate file is an image
    if (!imageFile.type.startsWith('image/')) {
      return { url: null, error: 'File must be an image' };
    }
    
    // Validate file size (max 5MB)
    if (imageFile.size > 5 * 1024 * 1024) {
      return { url: null, error: 'Image must be less than 5MB' };
    }
    
    // Create file path using user ID to enforce ownership
    const filePath = `${userId}/${Date.now()}_${imageFile.name.replace(/\s+/g, '_')}`;
    
    // Upload image to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('profile_images')
      .upload(filePath, imageFile);
    
    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      return { url: null, error: uploadError.message };
    }
    
    // Get the public URL of the uploaded image
    const { data: publicUrlData } = supabase.storage
      .from('profile_images')
      .getPublicUrl(uploadData.path);
    
    const imageUrl = publicUrlData.publicUrl;
    
    // Update the user's profile with the new image URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ profile_image_url: imageUrl })
      .eq('id', userId);
    
    if (updateError) {
      console.error('Error updating profile with image URL:', updateError);
      return { url: null, error: updateError.message };
    }
    
    return { url: imageUrl, error: null };
  } catch (error: any) {
    console.error('Error in updateProfileImage:', error);
    return { url: null, error: error.message };
  }
};
