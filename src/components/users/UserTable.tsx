
import React, { useState } from 'react';
import { UserWithProfile } from '@/types/user-types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { UserCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import ProfileImageUpload from '@/components/users/ProfileImageUpload';

interface UserTableProps {
  users: UserWithProfile[];
  roles: { id: string; name: string }[];
  onRoleUpdate: () => void;
}

const UserTable: React.FC<UserTableProps> = ({ users, roles, onRoleUpdate }) => {
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [userRoles, setUserRoles] = useState<Record<string, string>>({});

  // Initialize user roles
  React.useEffect(() => {
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

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Current Role</TableHead>
          <TableHead>Change Role</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
              No users found. Create a new user to get started.
            </TableCell>
          </TableRow>
        ) : (
          users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <ProfileImageUpload
                    userId={user.id}
                    imageUrl={user.profile?.profile_image_url}
                    firstName={user.profile?.first_name}
                    lastName={user.profile?.last_name}
                    onImageUpdated={(newUrl) => handleProfileImageUpdated(user.id, newUrl)}
                    size="sm"
                  />
                  <div>
                    <p className="font-medium">{user.profile?.first_name || 'Unknown'} {user.profile?.last_name || 'User'}</p>
                    <p className="text-sm text-muted-foreground">ID: {user.id.slice(0, 8)}...</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>{user.email || 'No email'}</TableCell>
              <TableCell>
                <div className="flex items-center">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium 
                    ${user.profile?.role === 'admin' ? 'bg-red-100 text-red-800' : ''}
                    ${user.profile?.role === 'manager' ? 'bg-blue-100 text-blue-800' : ''}
                    ${user.profile?.role === 'resident' ? 'bg-green-100 text-green-800' : ''}
                    ${user.profile?.role === 'maintenance' ? 'bg-amber-100 text-amber-800' : ''}
                    ${user.profile?.role === 'accountant' ? 'bg-purple-100 text-purple-800' : ''}
                    ${user.profile?.role === 'user' ? 'bg-gray-100 text-gray-800' : ''}
                  `}>
                    {user.profile?.role || 'user'}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <Select
                  value={userRoles[user.id] || user.profile?.role || 'user'}
                  onValueChange={(value) => updateUserRole(user.id, value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="text-right">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0"
                  onClick={() => updateUserRole(user.id, 'admin')}
                  title="Grant admin privileges"
                  disabled={loading[user.id] || user.profile?.role === 'admin'}
                >
                  {loading[user.id] ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  ) : (
                    <UserCheck className="h-4 w-4" />
                  )}
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default UserTable;
