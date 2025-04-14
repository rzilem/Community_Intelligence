
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/app-types';
import { UserAssociation } from './types';

export const signInWithEmail = async (email: string, password: string) => {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) {
    throw error;
  }
};

export const signUpWithEmail = async (
  email: string, 
  password: string, 
  userData: { first_name: string; last_name: string }
) => {
  const { error } = await supabase.auth.signUp({
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
    throw error;
  }
};

export const signOutUser = async () => {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    throw error;
  }
};

export const loadUserProfile = async (userId: string): Promise<Profile | null> => {
  try {
    console.log('Loading profile for user:', userId);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error loading user profile:', error);
      return null;
    }
    
    console.log('Profile loaded:', data);
    return data as Profile;
  } catch (error) {
    console.error('Unexpected error loading user profile:', error);
    return null;
  }
};

export const loadUserAssociations = async (userId: string): Promise<UserAssociation[]> => {
  try {
    console.log('Loading associations for user:', userId);
    
    const { data, error } = await supabase
      .from('association_users')
      .select(`
        *,
        associations:association_id (*)
      `)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error loading user associations:', error);
      return [];
    }
    
    console.log('Associations loaded:', data);
    return data as unknown as UserAssociation[];
  } catch (error) {
    console.error('Unexpected error loading user associations:', error);
    return [];
  }
};
