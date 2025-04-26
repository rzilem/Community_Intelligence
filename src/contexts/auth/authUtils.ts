
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/profile-types';
import { UserAssociation } from './types';
import { toast } from 'sonner';
import { UserRole } from '@/types/user-types';

/**
 * Signs in a user with email and password
 */
export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('[AuthUtils] Sign in error:', error);
    throw error;
  }

  console.log('[AuthUtils] User signed in successfully:', data.user?.email);
  return data;
};

/**
 * Signs up a new user with email and password
 */
export const signUpWithEmail = async (
  email: string, 
  password: string, 
  userData: { first_name: string; last_name: string }
) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData
    }
  });

  if (error) {
    console.error('[AuthUtils] Sign up error:', error);
    throw error;
  }

  console.log('[AuthUtils] User signed up successfully:', data.user?.email);
  return data;
};

/**
 * Sends a magic link to the user's email
 */
export const sendMagicLink = async (email: string) => {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/confirm`,
    },
  });

  if (error) {
    console.error('[AuthUtils] Magic link error:', error);
    throw error;
  }

  console.log('[AuthUtils] Magic link sent to:', email);
  return data;
};

/**
 * Signs out the current user
 */
export const signOutUser = async () => {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error('[AuthUtils] Sign out error:', error);
    throw error;
  }
  
  console.log('[AuthUtils] User signed out successfully');
};

/**
 * Loads a user's profile data
 */
export const loadUserProfile = async (userId: string): Promise<Profile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('[AuthUtils] Error loading user profile:', error);
      return null;
    }
    
    return data as Profile;
  } catch (error) {
    console.error('[AuthUtils] Unexpected error loading user profile:', error);
    return null;
  }
};

/**
 * Loads a user's association memberships
 */
export const loadUserAssociations = async (userId: string): Promise<UserAssociation[]> => {
  try {
    const { data, error } = await supabase
      .from('association_users')
      .select(`
        id,
        user_id,
        association_id,
        role,
        created_at,
        associations:association_id (
          id,
          name,
          address,
          city,
          state,
          zip,
          phone,
          contact_email,
          property_type,
          total_units,
          logo_url
        )
      `)
      .eq('user_id', userId);
    
    if (error) {
      console.error('[AuthUtils] Error loading user associations:', error);
      return [];
    }
    
    return data as UserAssociation[];
  } catch (error) {
    console.error('[AuthUtils] Unexpected error loading user associations:', error);
    return [];
  }
};

/**
 * Complete user profile sync to ensure database has correct user info
 */
export const syncUserProfile = async (userId: string, profile?: Partial<Profile>) => {
  try {
    // First check if profile exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('[AuthUtils] Error checking profile existence:', fetchError);
      return null;
    }
    
    if (!existingProfile) {
      // Profile doesn't exist, create it
      const { data: authUser, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('[AuthUtils] Error getting auth user:', userError);
        return null;
      }
      
      const userData = {
        id: userId,
        email: authUser.user.email,
        first_name: authUser.user.user_metadata?.first_name || '',
        last_name: authUser.user.user_metadata?.last_name || '',
        role: 'user' as UserRole,
        ...profile
      };
      
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert([userData])
        .select()
        .single();
      
      if (insertError) {
        console.error('[AuthUtils] Error creating profile:', insertError);
        return null;
      }
      
      return newProfile;
    } else if (profile) {
      // Profile exists and we have updates
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update(profile)
        .eq('id', userId)
        .select()
        .single();
      
      if (updateError) {
        console.error('[AuthUtils] Error updating profile:', updateError);
        return null;
      }
      
      return updatedProfile;
    }
    
    // Profile exists but no updates needed
    return existingProfile;
  } catch (error) {
    console.error('[AuthUtils] Unexpected error syncing user profile:', error);
    return null;
  }
};
