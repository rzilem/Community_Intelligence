
import { supabase } from '@/integrations/supabase/client';
import { RecipientGroup } from '@/types/communication-types';
import { Resident } from '@/types/resident-types';
import { Json } from '@/integrations/supabase/types';

export const recipientService = {
  // Get recipient groups for an association
  getRecipientGroups: async (associationId: string): Promise<RecipientGroup[]> => {
    try {
      const { data, error } = await supabase
        .from('recipient_groups')
        .select('*')
        .eq('association_id', associationId)
        .order('name');
      
      if (error) throw error;
      
      // Ensure the returned data is properly typed
      return (data || []).map(item => ({
        ...item,
        group_type: item.group_type as "system" | "custom"
      })) as RecipientGroup[];
    } catch (error) {
      console.error('Error fetching recipient groups:', error);
      return [];
    }
  },
  
  // Get recipient groups for multiple associations
  getRecipientGroupsForAssociations: async (associationIds: string[]): Promise<RecipientGroup[]> => {
    try {
      const { data, error } = await supabase
        .from('recipient_groups')
        .select('*')
        .in('association_id', associationIds)
        .order('name');
      
      if (error) throw error;
      
      // Ensure the returned data is properly typed
      return (data || []).map(item => ({
        ...item,
        group_type: item.group_type as "system" | "custom"
      })) as RecipientGroup[];
    } catch (error) {
      console.error('Error fetching recipient groups for associations:', error);
      return [];
    }
  },
  
  // Get members of a specific recipient group
  getRecipientsInGroup: async (groupId: string): Promise<Resident[]> => {
    try {
      // For now, return mock data
      return [
        { id: '1', name: 'John Doe', email: 'john@example.com', phone: '123-456-7890' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '234-567-8901' }
      ] as Resident[];
    } catch (error) {
      console.error(`Error fetching recipients in group ${groupId}:`, error);
      return [];
    }
  },
  
  // Get association members by role
  getAssociationMembersByRole: async (associationId: string, role: string): Promise<Resident[]> => {
    try {
      // For now, return mock data
      return [
        { id: '1', name: 'John Doe', email: 'john@example.com', phone: '123-456-7890' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '234-567-8901' }
      ] as Resident[];
    } catch (error) {
      console.error(`Error fetching ${role} members for association ${associationId}:`, error);
      return [];
    }
  },
  
  // Get all residents in an association
  getAllResidents: async (associationId: string): Promise<Resident[]> => {
    try {
      // For now, return mock data
      return [
        { id: '1', name: 'John Doe', email: 'john@example.com', phone: '123-456-7890' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '234-567-8901' }
      ] as Resident[];
    } catch (error) {
      console.error(`Error fetching residents for association ${associationId}:`, error);
      return [];
    }
  },
  
  // Get residents by type (owner, tenant, etc.)
  getResidentsByType: async (associationId: string, residentType: string): Promise<Resident[]> => {
    try {
      // For now, return mock data
      return [
        { id: '1', name: 'John Doe', email: 'john@example.com', phone: '123-456-7890' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '234-567-8901' }
      ] as Resident[];
    } catch (error) {
      console.error(`Error fetching ${residentType} residents for association ${associationId}:`, error);
      return [];
    }
  },
  
  // Get members by role type
  getMembersByRoleType: async (associationId: string, roleType: string): Promise<Resident[]> => {
    try {
      // For now, return mock data
      return [
        { id: '1', name: 'John Doe', email: 'john@example.com', phone: '123-456-7890' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '234-567-8901' }
      ] as Resident[];
    } catch (error) {
      console.error(`Error fetching members with role ${roleType} for association ${associationId}:`, error);
      return [];
    }
  },
  
  // Get recipients by custom criteria
  getRecipientsByCustomCriteria: async (associationId: string, criteria: Record<string, any>): Promise<Resident[]> => {
    try {
      // For now, return mock data
      return [
        { id: '1', name: 'John Doe', email: 'john@example.com', phone: '123-456-7890' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '234-567-8901' }
      ] as Resident[];
    } catch (error) {
      console.error(`Error fetching recipients by custom criteria for association ${associationId}:`, error);
      return [];
    }
  }
};
