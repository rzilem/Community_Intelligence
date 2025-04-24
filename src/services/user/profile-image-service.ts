
import { supabase } from '@/integrations/supabase/client';
import { updateProfileImage } from './profile-service';

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export const uploadProfileImage = async (
  userId: string,
  file: File
): Promise<ImageUploadResult> => {
  try {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return { success: false, error: 'Please select a valid image file (JPG, PNG, WebP)' };
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: 'Image size should be less than 5MB' };
    }
    
    // Upload to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `profile-images/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);
      
    if (uploadError) throw uploadError;
    
    // Get the public URL
    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    
    if (!data.publicUrl) {
      throw new Error('Failed to get public URL for uploaded image');
    }
    
    // Update the user's profile with the new image URL
    const { success, error } = await updateProfileImage(userId, data.publicUrl);
    
    if (!success) {
      throw new Error(error || 'Failed to update profile image');
    }
    
    return { success: true, url: data.publicUrl };
  } catch (error: any) {
    console.error('Error uploading profile image:', error);
    return { success: false, error: error.message || 'Failed to upload image' };
  }
};
