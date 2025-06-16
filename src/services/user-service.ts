
import { supabase } from '@/integrations/supabase/client';

export const updateProfileImage = async (userId: string, file: File): Promise<string> => {
  try {
    // Upload to storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `profile-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(filePath, file);

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data } = supabase.storage
      .from('uploads')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error: any) {
    throw new Error(`Failed to update profile image: ${error.message}`);
  }
};
