
import { User } from '@supabase/supabase-js';
import { Profile } from '@/types/profile-types';
import { Association } from '@/types/association-types';
import { UserAssociation } from '../types';
import { loadUserProfile, loadUserAssociations } from '../authUtils';
import { toast } from 'sonner';

interface UseLoadUserDataProps {
  setProfile: (profile: Profile | null) => void;
  setIsAdmin: (isAdmin: boolean) => void;
  setUserRole: (role: string | null) => void;
  setUserAssociations: (associations: UserAssociation[]) => void;
  setCurrentAssociation: (association: Association | null) => void;
  currentAssociation: Association | null;
  setLoading: (loading: boolean) => void;
}

export function useLoadUserData({
  setProfile,
  setIsAdmin,
  setUserRole,
  setUserAssociations,
  setCurrentAssociation,
  currentAssociation,
  setLoading,
}: UseLoadUserDataProps) {
  const loadUserData = async (user: User | null) => {
    if (user) {
      try {
        console.log('[AuthProvider] Loading user data for:', user.id);
        const profileData = await loadUserProfile(user.id);
        
        if (profileData) {
          console.log('[AuthProvider] Profile data loaded:', profileData);
          setProfile(profileData);
          setIsAdmin(profileData.role === 'admin');
          setUserRole(profileData.role);
          
          const associations = await loadUserAssociations(user.id);
          console.log('[AuthProvider] User associations loaded:', associations);
          setUserAssociations(associations);
          
          if (associations?.length > 0 && !currentAssociation) {
            setCurrentAssociation(associations[0].associations);
          }
        } else {
          console.warn('[AuthProvider] No profile data found for user:', user.id);
          setProfile({
            id: user.id,
            role: 'user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            email: user.email || '',
            first_name: user.user_metadata?.first_name || '',
            last_name: user.user_metadata?.last_name || '',
            profile_image_url: null
          } as Profile);
        }
      } catch (error) {
        console.error('[AuthProvider] Error loading user data:', error);
        toast.error('Failed to load user profile data');
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  return { loadUserData };
}
