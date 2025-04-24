
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/profile-types';
import { UserAssociation } from './types';

// Sign in with email and password
export async function signInWithEmail(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    return { user: data.user, error: null };
  } catch (error: any) {
    console.error('Error signing in:', error);
    return { user: null, error };
  }
}

// Sign up with email and password
export async function signUpWithEmail(
  email: string, 
  password: string, 
  userData: { first_name: string; last_name: string }
) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: userData.first_name,
          last_name: userData.last_name,
        }
      }
    });
    
    if (error) throw error;
    
    return { user: data.user, error: null };
  } catch (error: any) {
    console.error('Error signing up:', error);
    throw error;
  }
}

// Sign out the current user
export async function signOutUser() {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) throw error;
    
    return { error: null };
  } catch (error: any) {
    console.error('Error signing out:', error);
    throw error;
  }
}

// Load user profile from profiles table
export async function loadUserProfile(userId: string): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) {
      console.error('Error loading user profile:', error);
      return null;
    }
    
    return data as Profile;
  } catch (error) {
    console.error('Error loading user profile:', error);
    return null;
  }
}

// Load user association data
export async function loadUserAssociations(userId: string): Promise<UserAssociation[]> {
  try {
    const { data, error } = await supabase
      .from('association_users')
      .select('*, associations(*)')
      .eq('user_id', userId);
      
    if (error) {
      console.error('Error loading user associations:', error);
      return [];
    }
    
    return data as UserAssociation[];
  } catch (error) {
    console.error('Error loading user associations:', error);
    return [];
  }
}
