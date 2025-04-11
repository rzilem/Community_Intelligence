
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Plus, Pencil, Trash, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { AssociationMember, associationMemberService } from '@/services/association-member-service';

interface MembersTabProps {
  associationId: string;
}

const MembersTab: React.FC<MembersTabProps> = ({ associationId }) => {
  const [activeTab, setActiveTab] = useState('board');
  const [members, setMembers] = useState<AssociationMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  
  const [selectedUserId, setSelectedUserId] = useState('');
  const [roleType, setRoleType] = useState<'board' | 'committee'>('board');
  const [roleName, setRoleName] = useState('');
  const [editingMember, setEditingMember] = useState<AssociationMember | null>(null);

  const boardRoles = [
    'President',
    'Vice President',
    'Secretary',
    'Treasurer',
    'Director',
    'Officer',
    'Member at Large'
  ];

  const committeeRoles = [
    'Architectural Review',
    'Landscape',
    'Maintenance',
    'Social',
    'Welcome',
    'Security',
    'Budget & Finance',
    'Rules & Regulations',
    'Communications',
    'Pool',
    'Nominating',
    'Chair',
    'Member'
  ];

  useEffect(() => {
    if (associationId) {
      fetchMembers();
      fetchUsers();
    }
  }, [associationId]);

  useEffect(() => {
    if (roleType === 'board') {
      setRoleName('');
    } else {
      setRoleName('');
    }
  }, [roleType]);

  const fetchMembers = async () => {
    try {
      setIsLoading(true);
      const data = await associationMemberService.getAssociationMembers(associationId);
      setMembers(data);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast.error('Failed to load association members');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await associationMemberService.getAssociationUsers(associationId);
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load association users');
    }
  };

  const handleAddMember = () => {
    setEditingMember(null);
    setSelectedUserId('');
    setRoleType('board');
    setRoleName('');
    setIsDialogOpen(true);
  };

  const handleEditMember = (member: AssociationMember) => {
    setEditingMember(member);
    setSelectedUserId(member.user_id);
    setRoleType(member.role_type);
    setRoleName(member.role_name);
    setIsDialogOpen(true);
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) {
      return;
    }

    try {
      setIsLoading(true);
      await associationMemberService.removeAssociationMember(memberId);
      toast.success('Member removed successfully');
      fetchMembers();
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove member');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveMember = async () => {
    if (!selectedUserId || !roleName) {
      toast.error('Please fill out all required fields');
      return;
    }

    try {
      setIsLoading(true);
      
      if (editingMember) {
        // Update existing member
        await associationMemberService.updateAssociationMember(editingMember.id, {
          role_type: roleType,
          role_name: roleName
        });
        toast.success('Member updated successfully');
      } else {
        // Add new member
        await associationMemberService.addAssociationMember({
          user_id: selectedUserId,
          association_id: associationId,
          role_type: roleType,
          role_name: roleName
        });
        toast.success('Member added successfully');
      }

      fetchMembers();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving member:', error);
      toast.error('Failed to save member');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter members based on active tab
  const filteredMembers = members.filter(member => member.role_type === activeTab);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Association Members</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="board" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="board">Board Members</TabsTrigger>
            <TabsTrigger value="committee">Committee Members</TabsTrigger>
          </TabsList>
          
          <div className="flex justify-end mb-4">
            <Button onClick={handleAddMember}>
              <Plus className="mr-2 h-4 w-4" /> Add {activeTab === 'board' ? 'Board' : 'Committee'} Member
            </Button>
          </div>
          
          <TabsContent value="board">
            {isLoading ? (
              <div className="text-center py-8">Loading board members...</div>
            ) : filteredMembers.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="text-lg font-medium">No Board Members</h3>
                <p className="text-muted-foreground">
                  There are no board members added for this association yet.
                </p>
                <Button onClick={handleAddMember}>Add Board Member</Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map(member => (
                    <TableRow key={member.id}>
                      <TableCell>{member.first_name} {member.last_name}</TableCell>
                      <TableCell>{member.role_name}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditMember(member)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="text-destructive" onClick={() => handleDeleteMember(member.id)}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
          
          <TabsContent value="committee">
            {isLoading ? (
              <div className="text-center py-8">Loading committee members...</div>
            ) : filteredMembers.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="text-lg font-medium">No Committee Members</h3>
                <p className="text-muted-foreground">
                  There are no committee members added for this association yet.
                </p>
                <Button onClick={handleAddMember}>Add Committee Member</Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Committee</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map(member => (
                    <TableRow key={member.id}>
                      <TableCell>{member.first_name} {member.last_name}</TableCell>
                      <TableCell>{member.role_name}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditMember(member)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="text-destructive" onClick={() => handleDeleteMember(member.id)}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingMember 
                ? `Edit ${editingMember.role_type === 'board' ? 'Board' : 'Committee'} Member` 
                : `Add ${roleType === 'board' ? 'Board' : 'Committee'} Member`}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {!editingMember && (
              <div className="space-y-2">
                <label className="text-sm font-medium">User</label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.first_name} {user.last_name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Member Type</label>
              <Select value={roleType} onValueChange={(value: 'board' | 'committee') => setRoleType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select member type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="board">Board Member</SelectItem>
                  <SelectItem value="committee">Committee Member</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {roleType === 'board' ? 'Board Position' : 'Committee'}
              </label>
              <Select value={roleName} onValueChange={setRoleName}>
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${roleType === 'board' ? 'position' : 'committee'}`} />
                </SelectTrigger>
                <SelectContent>
                  {roleType === 'board' ? (
                    boardRoles.map(role => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))
                  ) : (
                    committeeRoles.map(role => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveMember} disabled={!selectedUserId || !roleName || isLoading}>
              {isLoading 
                ? 'Saving...' 
                : editingMember 
                  ? 'Update' 
                  : 'Add Member'
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default MembersTab;
