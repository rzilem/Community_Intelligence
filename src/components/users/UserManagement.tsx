
import React, { useState, useEffect } from 'react';
import { UserWithProfile } from '@/types/user-types';
import { Search, UserPlus, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import UserTable from './UserTable';
import CreateUserDialog from './CreateUserDialog';

interface UserManagementProps {
  users: UserWithProfile[];
  isLoading: boolean;
  error: any;
  roles: { id: string; name: string }[];
  onRefresh: () => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ 
  users, 
  isLoading, 
  error, 
  roles,
  onRefresh 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const filteredUsers = users.filter(user => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const email = user.email?.toLowerCase() || '';
    const firstName = user.profile?.first_name?.toLowerCase() || '';
    const lastName = user.profile?.last_name?.toLowerCase() || '';
    
    return (
      email.includes(searchLower) || 
      firstName.includes(searchLower) || 
      lastName.includes(searchLower)
    );
  });

  // Debug - Log all users received from parent
  useEffect(() => {
    console.log('UserManagement - All users:', users);
    console.log('UserManagement - Filtered users:', filteredUsers);
  }, [users, filteredUsers]);

  const handleOpenCreateDialog = () => {
    setIsCreateDialogOpen(true);
  };

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Assign roles to control what users can access in the system.
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={onRefresh} 
            variant="outline" 
            size="icon" 
            className="h-9 w-9"
            title="Refresh user list"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={handleOpenCreateDialog}>
            <UserPlus className="mr-2 h-4 w-4" />
            Create User
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by email or name..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">
            Error loading users. Please try again.
          </div>
        ) : filteredUsers.length > 0 ? (
          <UserTable users={filteredUsers} roles={roles} onRoleUpdate={onRefresh} />
        ) : (
          <div className="text-center py-10">
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "No users match your search." : "No user profiles found."}
            </p>
            {!searchTerm && (
              <p className="text-muted-foreground text-sm">
                You can create new users directly in this application using the "Create User" button above.
              </p>
            )}
          </div>
        )}
      </CardContent>

      <CreateUserDialog 
        isOpen={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen} 
        onUserCreated={onRefresh}
        roles={roles}
      />
    </Card>
  );
};

export default UserManagement;
