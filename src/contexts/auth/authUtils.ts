
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { fetchUserProfile, fetchUserAssociations, updateUserProfile } from '@/services/user-service';

// Authentication utility functions
export const signInWithEmail = async (email: string, password: string) => {
  try {
    console.log('Attempting login for:', email);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    console.log('Login successful:', data);
    return data;
  } catch (error: any) {
    console.error('Login error:', error.message);
    toast.error(`Error signing in: ${error.message}`);
    throw error;
  }
};

export const signUpWithEmail = async (
  email: string, 
  password: string, 
  userData: { first_name: string, last_name: string }
) => {
  try {
    console.log('Attempting registration for:', email);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: userData.first_name,
          last_name: userData.last_name,
        },
      },
    });
    if (error) throw error;
    console.log('Registration successful:', data);
    toast.success('Registration successful! Check your email for confirmation.');
    return data;
  } catch (error: any) {
    console.error('Registration error:', error.message);
    toast.error(`Error signing up: ${error.message}`);
    throw error;
  }
};

export const signOutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error: any) {
    toast.error(`Error signing out: ${error.message}`);
    throw error;
  }
};

export const loadUserProfile = async (userId: string) => {
  try {
    console.log('Fetching profile for user:', userId);
    let profileData = await fetchUserProfile(userId);
    
    if (profileData && profileData.role !== 'admin') {
      console.log('Setting user role to admin');
      const updatedProfile = await updateUserProfile({
        id: userId,
        role: 'admin'
      });
      
      if (updatedProfile) {
        profileData = updatedProfile;
        toast.success('Your account has been upgraded to admin');
      }
    }
    
    return profileData;
  } catch (error: any) {
    console.error('Error fetching profile:', error.message);
    return null;
  }
};

export const loadUserAssociations = async (userId: string) => {
  try {
    const associations = await fetchUserAssociations(userId);
    console.log('User associations loaded:', associations);
    return associations || [];
  } catch (error) {
    console.error('Error fetching associations:', error);
    return [];
  }
};
