import React, { useState } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Shield, UserCheck, Search, CheckCircle, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useSupabaseQuery } from '@/hooks/supabase';
import { useSupabaseCreate } from '@/hooks/supabase/use-supabase-create';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import ProfileImageUpload from '@/components/users/ProfileImageUpload';

interface UserWithProfile {
  id: string;
  email: string;
  created_at: string;
  profile?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    role: string;
    email: string | null;
    profile_image_url: string | null;
  };
}

const roles = [
  { id: 'admin', name: 'Administrator' },
  { id: 'manager', name: 'Manager' },
  { id: 'resident', name: 'Resident' },
  { id: 'maintenance', name: 'Maintenance' },
  { id: 'accountant', name: 'Accountant' },
  { id: 'user', name: 'Basic User' },
];

const newUserSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  firstName: z.string().min(2, { message: 'First name must be at least 2 characters' }),
  lastName: z.string().min(2, { message: 'Last name must be at least 2 characters' }),
  role: z.string().min(1, { message: 'Please select a role' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type NewUserFormValues = z.infer<typeof newUserSchema>;

const Permissions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data = [], isLoading, error, refetch } = useSupabaseQuery<UserWithProfile[]>(
    'users', 
    {
      select: '*, profile:profiles(*)',
      filter: [],
      order: { column: 'created_at', ascending: false },
    }
  );
  
  const users = data as UserWithProfile[];

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

  const updateUserRole = async (userId: string, role: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId);
        
      if (error) throw error;
      
      toast.success('User role updated successfully');
      refetch();
    } catch (err: any) {
      toast.error(`Error updating role: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileImageUpdated = (userId: string, newUrl: string) => {
    refetch();
  };

  const newUserForm = useForm<NewUserFormValues>({
    resolver: zodResolver(newUserSchema),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      role: 'user',
      password: '',
    }
  });

  const createUser = async (formData: NewUserFormValues) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
          }
        }
      });
      
      if (error) throw error;
      
      if (data.user && formData.role !== 'user') {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: formData.role })
          .eq('id', data.user.id);
          
        if (updateError) {
          console.error('Error updating role:', updateError);
          toast.error(`User created, but role could not be set: ${updateError.message}`);
        }
      }
      
      toast.success('User created successfully');
      setIsCreateDialogOpen(false);
      newUserForm.reset();
      refetch();
      
    } catch (err: any) {
      toast.error(`Error creating user: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTemplate 
      title="User Permissions" 
      icon={<Shield className="h-8 w-8" />}
      description="Manage user roles and permissions across the platform."
    >
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              Assign roles to control what users can access in the system.
            </CardDescription>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Create User
          </Button>
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
                {filteredUsers.map((user) => (
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
                          <p className="font-medium">{user.profile?.first_name} {user.profile?.last_name}</p>
                          <p className="text-sm text-muted-foreground">ID: {user.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
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
                        defaultValue={user.profile?.role || 'user'}
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
                      >
                        <UserCheck className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground">
                {searchTerm ? "No users match your search." : "No users found."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
          <CardDescription>
            Overview of what each role can access in the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Access Level</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>
                  <div className="font-medium">Administrator</div>
                </TableCell>
                <TableCell>Full access to all features, including system settings</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>Unrestricted</span>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <div className="font-medium">Manager</div>
                </TableCell>
                <TableCell>Access to most features except system configuration</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-blue-500 mr-2" />
                    <span>High</span>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <div className="font-medium">Resident</div>
                </TableCell>
                <TableCell>Access to community information and resident features</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-amber-500 mr-2" />
                    <span>Medium</span>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <div className="font-medium">Maintenance</div>
                </TableCell>
                <TableCell>Access to maintenance requests and schedules</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-amber-500 mr-2" />
                    <span>Medium</span>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <div className="font-medium">Accountant</div>
                </TableCell>
                <TableCell>Access to financial information and reports</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-amber-500 mr-2" />
                    <span>Medium</span>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <div className="font-medium">Basic User</div>
                </TableCell>
                <TableCell>Limited access to basic features only</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-gray-500 mr-2" />
                    <span>Low</span>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Create New User</AlertDialogTitle>
            <AlertDialogDescription>
              Create a new user account. The user will receive an email confirmation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Form {...newUserForm}>
            <form onSubmit={newUserForm.handleSubmit(createUser)} className="space-y-4">
              <FormField
                control={newUserForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="user@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={newUserForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={newUserForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={newUserForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={newUserForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                      Creating...
                    </>
                  ) : 'Create User'}
                </Button>
              </AlertDialogFooter>
            </form>
          </Form>
        </AlertDialogContent>
      </AlertDialog>
    </PageTemplate>
  );
};

export default Permissions;
