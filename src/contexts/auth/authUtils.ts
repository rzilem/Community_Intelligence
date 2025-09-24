import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/profile-types';
import { UserAssociation } from './types';
import { toast } from 'sonner';
import { ensurePasswordNotLeaked } from '@/utils/security/password-utils';

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error('[authUtils] Login error:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('[authUtils] Sign in error details:', error);
    throw error;
  }
};

export const signUpWithEmail = async (
  email: string, 
  password: string, 
  userData: { first_name: string; last_name: string }
) => {
  try {
    // New: prevent sign-up with leaked/breached passwords
    try {
      await ensurePasswordNotLeaked(password);
    } catch (err: any) {
      console.warn('[authUtils] Blocked leaked password during sign-up:', err);
      toast.error(err?.message || 'This password appears in known breaches. Please choose a different password.');
      throw err;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: userData.first_name,
          last_name: userData.last_name
        }
      }
    });
    
    if (error) {
      console.error('[authUtils] Sign up error:', error);
      throw error;
    }
    
    // Create a profile record for the new user
    if (data.user) {
      try {
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          first_name: userData.first_name,
          last_name: userData.last_name,
          email: email,
          role: 'user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
        if (profileError) {
          console.error('[authUtils] Error creating profile:', profileError);
          // Not throwing here as the user was created successfully
          toast.error('Profile creation failed, but account was created');
        }
      } catch (profileErr) {
        console.error('[authUtils] Unexpected error creating profile:', profileErr);
      }
    }
    
    return data;
  } catch (error) {
    console.error('[authUtils] Sign up error details:', error);
    throw error;
  }
};

export const signOutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('[authUtils] Sign out error:', error);
      throw error;
    }
  } catch (error) {
    console.error('[authUtils] Sign out error details:', error);
    throw error;
  }
};

export const loadUserProfile = async (userId: string): Promise<Profile | null> => {
  try {
    console.log('[authUtils] Loading profile for user:', userId);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.warn('[authUtils] Profile not found for user:', userId);
        return null;
      }
      
      console.error('[authUtils] Error loading user profile:', error);
      return null;
    }
    
    console.log('[authUtils] Profile loaded:', data);
    return data as Profile;
  } catch (error) {
    console.error('[authUtils] Unexpected error loading user profile:', error);
    return null;
  }
};

export const loadUserAssociations = async (userId: string): Promise<UserAssociation[]> => {
  try {
    console.log('[authUtils] Loading associations for user:', userId);
    
    // Use associations table directly since association_users doesn't exist
    const { data, error } = await supabase
      .from('associations')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('[authUtils] Error loading user associations:', error);
      return [];
    }
    
    // Transform associations to UserAssociation format
    if (data && data.length > 0) {
      const userAssociations: UserAssociation[] = data.map(association => ({
        id: `user-assoc-${association.id}`,
        user_id: userId,
        association_id: association.id,
        role: 'member',
        associations: association,
        created_at: new Date().toISOString()
      }));
      
      console.log('[authUtils] Associations loaded:', userAssociations);
      return userAssociations;
    }
    
    console.log('[authUtils] No associations found');
    return [];
  } catch (error) {
    console.error('[authUtils] Unexpected error loading user associations:', error);
    return [];
  }
};
