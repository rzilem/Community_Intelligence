
import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { MemberType } from '@/types/member-types';
import { ResidentWithProfile } from '@/types/resident-types';

interface MemberFormProps {
  memberType: MemberType;
  setMemberType: (type: MemberType) => void;
  selectedUserId: string;
  setSelectedUserId: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredHomeowners: ResidentWithProfile[];
  manualFirstName: string;
  setManualFirstName: (name: string) => void;
  manualLastName: string;
  setManualLastName: (name: string) => void;
  manualEmail: string;
  setManualEmail: (email: string) => void;
  roleType: 'board' | 'committee';
  setRoleType: (type: 'board' | 'committee') => void;
  roleName: string;
  setRoleName: (name: string) => void;
  boardRoles: string[];
  committeeRoles: string[];
  isLoading: boolean;
  homeowners: ResidentWithProfile[];
}

export const MemberForm: React.FC<MemberFormProps> = ({
  memberType,
  setMemberType,
  selectedUserId,
  setSelectedUserId,
  searchQuery,
  setSearchQuery,
  filteredHomeowners,
  manualFirstName,
  setManualFirstName,
  manualLastName,
  setManualLastName,
  manualEmail,
  setManualEmail,
  roleType,
  setRoleType,
  roleName,
  setRoleName,
  boardRoles,
  committeeRoles,
  isLoading,
  homeowners
}) => {
  const handleSelectHomeowner = (homeownerId: string) => {
    setSelectedUserId(homeownerId);
    setSearchQuery('');
  };

  return (
    <div className="space-y-4">
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
  );
};
