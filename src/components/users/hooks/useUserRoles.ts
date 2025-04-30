
import { useState, useEffect } from 'react';
import { UserWithProfile } from '@/types/user-types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type UserRole = "maintenance" | "admin" | "manager" | "resident" | "accountant" | "user";

export const useUserRoles = (users: UserWithProfile[], onRoleUpdate: () => void) => {
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [userRoles, setUserRoles] = useState<Record<string, UserRole>>({});
  const [refreshingProfile, setRefreshingProfile] = useState<Record<string, boolean>>({});

  // Initialize user roles
  useEffect(() => {
    const rolesMap: Record<string, UserRole> = {};
    users.forEach(user => {
      if (user.profile?.role) {
        // Validate that the role is one of the allowed types
        const role = user.profile.role as UserRole;
        rolesMap[user.id] = role;
      }
    });
    setUserRoles(rolesMap);
  }, [users]);

  const updateUserRole = async (userId: string, role: UserRole) => {
    try {
      setLoading(prev => ({ ...prev, [userId]: true }));
      
      console.log(`Updating role for user ${userId} to ${role}`);
      
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId);
        
      if (error) throw error;
      
      setUserRoles(prev => ({ ...prev, [userId]: role }));
      toast.success('User role updated successfully');
      onRoleUpdate();
    } catch (err: any) {
      console.error('Error updating role:', err);
      toast.error(`Error updating role: ${err.message}`);
    } finally {
      setLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const refreshUserProfile = async (userId: string) => {
    try {
      setRefreshingProfile(prev => ({ ...prev, [userId]: true }));
      const user = users.find(u => u.id === userId);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      const defaultRole: UserRole = 'user';
      
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          email: user.email,
          role: user.profile?.role as UserRole || defaultRole,
          first_name: user.profile?.first_name || '',
          last_name: user.profile?.last_name || '',
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
      
      if (error) throw error;
      
      toast.success('User profile refreshed');
      onRoleUpdate();
    } catch (err: any) {
      console.error('Error refreshing profile:', err);
      toast.error(`Error refreshing profile: ${err.message}`);
    } finally {
      setRefreshingProfile(prev => ({ ...prev, [userId]: false }));
    }
  };

  return {
    userRoles,
    loading, 
    refreshingProfile,
    updateUserRole,
    refreshUserProfile
  };
};
