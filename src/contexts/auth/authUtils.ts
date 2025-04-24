import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';
import { Profile } from '@/types/profile-types';
import { Association } from '@/types/association-types';
import { UserAssociation } from './types';

/**
 * Sign in a user with email and password
 */
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) throw error;
    
    return { 
      user: data.user,
      error: null
    };
  } catch (error) {
    console.error('Error signing in:', error);
    return {
      user: null,
      error
    };
  }
};

/**
 * Sign up a new user with email and password
 */
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
    
    if (error) throw error;
    
    // Check if email confirmation is required
    if (data.user && !data.user.confirmed_at) {
      toast.success(`Verification email sent to ${email}. Please check your inbox.`);
    } else {
      toast.success('Account created successfully!');
    }
    
    return { user: data.user, error: null };
  } catch (error) {
    console.error('Error signing up:', error);
    return { user: null, error };
  }
};

/**
 * Sign out the current user
 */
export const signOutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error signing out:', error);
    return { error };
  }
};

/**
 * Load user profile data
 */
export const loadUserProfile = async (userId: string): Promise<Profile | null> => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return profile;
  } catch (error) {
    console.error('Error loading user profile:', error);
    return null;
  }
};

/**
 * Load user associations
 */
export const loadUserAssociations = async (userId: string): Promise<UserAssociation[]> => {
  try {
    const { data, error } = await supabase
      .from('association_users')
      .select(`
        role,
        associations (
          id,
          name,
          description,
          logo_url,
          status
        )
      `)
      .eq('user_id', userId);

    if (error) throw error;

    return data.map(item => ({
      role: item.role,
      associations: item.associations
    }));
  } catch (error) {
    console.error('Error loading user associations:', error);
    return [];
  }
};
