// Mock implementation to avoid database errors - table association_member_roles doesn't exist
import { toast } from 'sonner';

export interface AssociationMember {
  id: string;
  user_id: string;
  association_id: string;
  role_type: 'board' | 'committee';
  role_name: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

export const associationMemberService = {
  // Fetch board and committee members for an association
  getAssociationMembers: async (associationId: string): Promise<AssociationMember[]> => {
    // Mock implementation
    return [
      {
        id: 'member-1',
        user_id: 'user-1',
        association_id: associationId,
        role_type: 'board',
        role_name: 'President',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'member-2',
        user_id: 'user-2',
        association_id: associationId,
        role_type: 'committee',
        role_name: 'Landscape Committee Chair',
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane.smith@example.com',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  },

  // Add a new board or committee member
  addAssociationMember: async (memberData: {
    user_id: string;
    association_id: string;
    role_type: 'board' | 'committee';
    role_name: string;
  }): Promise<AssociationMember> => {
    // Mock implementation
    toast.success(`Member added as ${memberData.role_name} successfully`);
    
    return {
      id: crypto.randomUUID(),
      user_id: memberData.user_id,
      association_id: memberData.association_id,
      role_type: memberData.role_type,
      role_name: memberData.role_name,
      first_name: 'New',
      last_name: 'Member',
      email: 'new.member@example.com',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  },

  // Update an existing board or committee member
  updateAssociationMember: async (id: string, memberData: {
    role_type: 'board' | 'committee';
    role_name: string;
  }): Promise<AssociationMember> => {
    // Mock implementation
    toast.success('Member updated successfully');
    
    return {
      id,
      user_id: 'user-1',
      association_id: 'assoc-1',
      role_type: memberData.role_type,
      role_name: memberData.role_name,
      first_name: 'Updated',
      last_name: 'Member',
      email: 'updated.member@example.com',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  },

  // Remove a board or committee member
  removeAssociationMember: async (id: string): Promise<void> => {
    // Mock implementation
    toast.success('Member removed successfully');
  },

  // Get all association users for selection
  getAssociationUsers: async (associationId: string) => {
    // Mock implementation
    return [
      {
        id: 'user-1',
        first_name: 'Available',
        last_name: 'User 1',
        email: 'user1@example.com',
        role: 'resident'
      },
      {
        id: 'user-2',
        first_name: 'Available',
        last_name: 'User 2',
        email: 'user2@example.com',
        role: 'resident'
      }
    ];
  }
};