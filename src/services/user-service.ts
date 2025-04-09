
import { supabase } from '@/integrations/supabase/client';
import { Profile, UserWithProfile } from '@/types/app-types';

/**
 * Fetches the profile for the specified user ID
 */
export const fetchUserProfile = async (userId: string): Promise<Profile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }

    return data as Profile;
  } catch (error) {
    console.error('Error in fetchUserProfile:', error);
    return null;
  }
};

/**
 * Updates user profile information
 */
export const updateUserProfile = async (profileData: Partial<Profile>): Promise<Profile | null> => {
  try {
    if (!profileData.id) {
      throw new Error('Profile ID is required for update');
    }

    console.log('Updating profile with data:', profileData);
    
    const { data, error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', profileData.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }

    console.log('Profile updated successfully:', data);
    return data as Profile;
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    return null;
  }
};

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

/**
 * Fetches associations for the current user based on their role
 */
export const fetchUserAssociations = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('association_users')
      .select(`
        id,
        role,
        associations:association_id (
          id,
          name,
          address,
          contact_email
        )
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user associations:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in fetchUserAssociations:', error);
    return [];
  }
};

/**
 * Assigns a user to an association with a specified role
 */
export const assignUserToAssociation = async (
  userId: string, 
  associationId: string, 
  role: 'admin' | 'manager' | 'member' = 'member'
) => {
  try {
    const { data, error } = await supabase
      .from('association_users')
      .insert({
        user_id: userId,
        association_id: associationId,
        role
      })
      .select()
      .single();

    if (error) {
      console.error('Error assigning user to association:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in assignUserToAssociation:', error);
    return null;
  }
};

/**
 * Updates a user's role in an association
 */
export const updateUserRole = async (
  userId: string,
  associationId: string,
  role: 'admin' | 'manager' | 'member'
) => {
  try {
    const { data, error } = await supabase
      .from('association_users')
      .update({ role })
      .match({ user_id: userId, association_id: associationId })
      .select()
      .single();

    if (error) {
      console.error('Error updating user role:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateUserRole:', error);
    return null;
  }
};
