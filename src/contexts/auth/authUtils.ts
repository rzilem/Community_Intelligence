import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/profile-types';
import { UserAssociation } from './types';
import { toast } from 'sonner';

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
    
    const { data, error } = await supabase
      .from('association_users')
      .select(`
        *,
        association:association_id (*)
      `)
      .eq('user_id', userId);
    
    if (error) {
      console.error('[authUtils] Error loading user associations:', error);
      return [];
    }
    
    if (!data || data.length === 0) {
      // Try mock data if no associations found
      console.log('[authUtils] No associations found, using mock data');
      
      // This is just a temporary solution for development
      const { data: mockAssociations } = await supabase
        .from('associations')
        .select('*')
        .limit(1);
      
      if (mockAssociations && mockAssociations.length > 0) {
        return [{
          id: 'mock-association-1',
          user_id: userId,
          association_id: mockAssociations[0].id,
          role: 'member',
          association: mockAssociations[0],
          created_at: new Date().toISOString()
        }];
      }
    }
    
    console.log('[authUtils] Associations loaded:', data);
    return data as unknown as UserAssociation[];
  } catch (error) {
    console.error('[authUtils] Unexpected error loading user associations:', error);
    return [];
  }
};

export async function createUserAssociation(
  userId: string,
  hoaId: string,
  role: string = 'resident'
): Promise<UserAssociation> {
  // First, get the association data
  const { data: associationData, error: associationError } = await supabase
    .from('associations')
    .select('*')
    .eq('id', hoaId)
    .single();

  if (associationError) {
    throw associationError;
  }

  // Create the association_users record
  const { data, error } = await supabase
    .from('association_users')
    .insert({
      user_id: userId,
      association_id: hoaId,
      role,
    })
    .select()
    .single();

  if (error) throw error;

  // Return the data with the association object included
  return {
    ...data,
    association: associationData
  } as UserAssociation;
}
