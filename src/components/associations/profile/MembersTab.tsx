import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Plus, Pencil, Trash, AlertCircle, Search } from 'lucide-react';
import { toast } from 'sonner';
import { AssociationMember, associationMemberService } from '@/services/association-member-service';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ResidentWithProfile } from '@/types/resident-types';
import { useSupabaseQuery } from '@/hooks/supabase';

interface MembersTabProps {
  associationId: string;
}

// Member types
type MemberType = 'homeowner' | 'developer' | 'builder';

const MembersTab: React.FC<MembersTabProps> = ({ associationId }) => {
  const [activeTab, setActiveTab] = useState('board');
  const [members, setMembers] = useState<AssociationMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [homeowners, setHomeowners] = useState<ResidentWithProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredHomeowners, setFilteredHomeowners] = useState<ResidentWithProfile[]>([]);
  
  const [selectedUserId, setSelectedUserId] = useState('');
  const [roleType, setRoleType] = useState<'board' | 'committee'>('board');
  const [roleName, setRoleName] = useState('');
  const [editingMember, setEditingMember] = useState<AssociationMember | null>(null);
  const [memberType, setMemberType] = useState<MemberType>('homeowner');
  
  // For manual entry (developer/builder)
  const [manualFirstName, setManualFirstName] = useState('');
  const [manualLastName, setManualLastName] = useState('');
  const [manualEmail, setManualEmail] = useState('');

  // Fetch homeowners for the association
  const { data: associationHomeowners = [], isLoading: isLoadingHomeowners } = useSupabaseQuery<ResidentWithProfile[]>(
    'residents',
    {
      select: `
        *,
        user:user_id (
          profile:profiles (
            id,
            first_name,
            last_name,
            email,
            phone_number
          )
        )
      `,
      filter: [
        { column: 'property_id', operator: 'eq', value: null },
        { column: 'resident_type', operator: 'eq', value: 'owner' }
      ]
    }
  );

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
    if (associationHomeowners.length > 0) {
      setHomeowners(associationHomeowners);
    }
  }, [associationHomeowners]);

  useEffect(() => {
    if (roleType === 'board') {
      setRoleName('');
    } else {
      setRoleName('');
    }
  }, [roleType]);

  // Filter homeowners based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredHomeowners(homeowners);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = homeowners.filter(homeowner => {
      const firstName = homeowner.user?.profile?.first_name?.toLowerCase() || '';
      const lastName = homeowner.user?.profile?.last_name?.toLowerCase() || '';
      const email = homeowner.user?.profile?.email?.toLowerCase() || '';
      
      return firstName.includes(query) || 
             lastName.includes(query) || 
             email.includes(query) ||
             `${firstName} ${lastName}`.includes(query);
    });
    
    setFilteredHomeowners(filtered);
  }, [searchQuery, homeowners]);

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
    setMemberType('homeowner');
    setManualFirstName('');
    setManualLastName('');
    setManualEmail('');
    setSearchQuery('');
    setIsDialogOpen(true);
  };

  const handleEditMember = (member: AssociationMember) => {
    setEditingMember(member);
    setSelectedUserId(member.user_id);
    setRoleType(member.role_type);
    setRoleName(member.role_name);
    setMemberType(member.member_type || 'homeowner');
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
    if (memberType === 'homeowner' && !selectedUserId) {
      toast.error('Please select a homeowner');
      return;
    }

    if ((memberType === 'developer' || memberType === 'builder') && 
        (!manualFirstName || !manualLastName || !manualEmail)) {
      toast.error('Please fill out all required fields');
      return;
    }

    if (!roleName) {
      toast.error('Please select a role');
      return;
    }

    try {
      setIsLoading(true);
      
      let userId = selectedUserId;
      
      if (memberType !== 'homeowner') {
        const existingUserData = await associationMemberService.findUserByEmail(manualEmail);
        
        if (existingUserData) {
          userId = existingUserData.id;
        } else {
          const newUserData = await associationMemberService.createExternalUser({
            first_name: manualFirstName,
            last_name: manualLastName,
            email: manualEmail,
            user_type: memberType
          }, associationId);
          
          if (newUserData) {
            userId = newUserData.id;
          } else {
            throw new Error('Failed to create user');
          }
        }
      }
      
      if (editingMember) {
        await associationMemberService.updateAssociationMember(editingMember.id, {
          role_type: roleType,
          role_name: roleName
        });
        toast.success('Member updated successfully');
      } else {
        await associationMemberService.addAssociationMember({
          user_id: userId,
          association_id: associationId,
          role_type: roleType,
          role_name: roleName,
          member_type: memberType
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

  const handleSelectHomeowner = (homeownerId: string) => {
    setSelectedUserId(homeownerId);
    setSearchQuery('');
  };

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
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Member Type</label>
                  <RadioGroup 
                    value={memberType} 
                    onValueChange={(value: MemberType) => setMemberType(value)}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="homeowner" id="homeowner" />
                      <Label htmlFor="homeowner">Homeowner</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="developer" id="developer" />
                      <Label htmlFor="developer">Developer</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="builder" id="builder" />
                      <Label htmlFor="builder">Builder</Label>
                    </div>
                  </RadioGroup>
                </div>

                {memberType === 'homeowner' ? (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Homeowner</label>
                    <div className="relative">
                      <Input
                        placeholder="Search homeowners by name or email"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full"
                      />
                      <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                    
                    {searchQuery && (
                      <div className="mt-1 border rounded-md max-h-40 overflow-y-auto">
                        {isLoadingHomeowners ? (
                          <div className="p-2 text-center text-sm text-muted-foreground">Loading homeowners...</div>
                        ) : filteredHomeowners.length === 0 ? (
                          <div className="p-2 text-center text-sm text-muted-foreground">No homeowners found</div>
                        ) : (
                          <div className="py-1">
                            {filteredHomeowners.map(homeowner => (
                              <div 
                                key={homeowner.user_id} 
                                className={`px-3 py-2 cursor-pointer hover:bg-accent ${selectedUserId === homeowner.user_id ? 'bg-accent' : ''}`}
                                onClick={() => handleSelectHomeowner(homeowner.user_id || '')}
                              >
                                {homeowner.user?.profile?.first_name || ''} {homeowner.user?.profile?.last_name || ''} 
                                {homeowner.user?.profile?.email ? ` (${homeowner.user.profile.email})` : ''}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {selectedUserId && (
                      <div className="mt-2 p-2 border rounded-md bg-muted">
                        <p className="text-sm font-medium">Selected Homeowner:</p>
                        <p className="text-sm">
                          {homeowners.find(h => h.user_id === selectedUserId)?.user?.profile?.first_name || ''} 
                          {' '}
                          {homeowners.find(h => h.user_id === selectedUserId)?.user?.profile?.last_name || ''}
                          {' '}
                          ({homeowners.find(h => h.user_id === selectedUserId)?.user?.profile?.email || ''})
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">First Name</label>
                        <Input 
                          value={manualFirstName} 
                          onChange={(e) => setManualFirstName(e.target.value)} 
                          placeholder="Enter first name"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Last Name</label>
                        <Input 
                          value={manualLastName} 
                          onChange={(e) => setManualLastName(e.target.value)} 
                          placeholder="Enter last name"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <Input 
                        value={manualEmail} 
                        onChange={(e) => setManualEmail(e.target.value)} 
                        placeholder="Enter email address"
                        type="email"
                      />
                    </div>
                  </div>
                )}
              </>
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
            <Button 
              onClick={handleSaveMember} 
              disabled={
                (memberType === 'homeowner' && !selectedUserId) || 
                ((memberType === 'developer' || memberType === 'builder') && 
                  (!manualFirstName || !manualLastName || !manualEmail)) ||
                !roleName || 
                isLoading
              }
            >
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
