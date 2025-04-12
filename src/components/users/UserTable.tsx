
import React, { useState, useEffect } from 'react';
import { UserWithProfile } from '@/types/user-types';
import { Table, TableBody } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import UserTableHeader from './table/UserTableHeader';
import UserTableRow from './table/UserTableRow';
import EmptyUserTable from './table/EmptyUserTable';

interface UserTableProps {
  users: UserWithProfile[];
  roles: { id: string; name: string }[];
  onRoleUpdate: () => void;
}

const UserTable: React.FC<UserTableProps> = ({ users, roles, onRoleUpdate }) => {
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [userRoles, setUserRoles] = useState<Record<string, string>>({});
  const [refreshingProfile, setRefreshingProfile] = useState<Record<string, boolean>>({});

  // Initialize user roles
  useEffect(() => {
    const rolesMap: Record<string, string> = {};
    users.forEach(user => {
      if (user.profile?.role) {
        rolesMap[user.id] = user.profile.role;
      }
    });
    setUserRoles(rolesMap);
  }, [users]);

  const updateUserRole = async (userId: string, role: string) => {
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

  const handleProfileImageUpdated = (userId: string, newUrl: string) => {
    onRoleUpdate();
  };

  // Create or update a profile for users who don't have complete profile data
  const refreshUserProfile = async (userId: string) => {
    try {
      setRefreshingProfile(prev => ({ ...prev, [userId]: true }));
      const user = users.find(u => u.id === userId);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          email: user.email,
          role: user.profile?.role || 'user',
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

  return (
    <Table>
      <UserTableHeader />
      <TableBody>
        {users.length === 0 ? (
          <EmptyUserTable />
        ) : (
          users.map((user) => (
            <UserTableRow
              key={user.id}
              user={user}
              roles={roles}
              userRoles={userRoles}
              loading={loading}
              refreshingProfile={refreshingProfile}
              onRoleUpdate={updateUserRole}
              onProfileImageUpdated={handleProfileImageUpdated}
              onRefreshProfile={refreshUserProfile}
            />
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default UserTable;
