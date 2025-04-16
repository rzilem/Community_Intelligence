
import { supabase } from '@/integrations/supabase/client';
import { RecipientGroup, MessageRecipient } from '@/types/communication-types';

export const recipientService = {
  // Get recipient groups for a specific association
  getRecipientGroups: async (associationId: string): Promise<RecipientGroup[]> => {
    try {
      const { data, error } = await supabase
        .from('recipient_groups')
        .select('*')
        .eq('association_id', associationId)
        .order('name');
      
      if (error) throw error;
      return data || [];
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
      return data || [];
    } catch (error) {
      console.error('Error fetching recipient groups for multiple associations:', error);
      return [];
    }
  },
  
  // Get association members by role (board members, committee members, etc.)
  getAssociationMembersByRole: async (associationId: string, roleType?: string): Promise<any[]> => {
    try {
      let query = supabase
        .from('association_member_roles')
        .select('*, users:user_id(first_name, last_name, email)')
        .eq('association_id', associationId);
      
      if (roleType) {
        query = query.eq('role_type', roleType);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching association members:', error);
      return [];
    }
  },
  
  // Get all recipients in a group 
  getRecipientsInGroup: async (groupId: string): Promise<MessageRecipient[]> => {
    try {
      const { data: group, error: groupError } = await supabase
        .from('recipient_groups')
        .select('*')
        .eq('id', groupId)
        .single();
        
      if (groupError) throw groupError;
      
      // Depending on the group type and criteria, fetch the recipients
      if (group.group_type === 'system' && group.criteria) {
        // Handle system groups - safely check type property
        const criteriaType = typeof group.criteria === 'object' && group.criteria ? 
          (group.criteria as Record<string, unknown>).type : null;
        
        switch (criteriaType) {
          case 'all_residents':
            return await recipientService.getAllResidents(group.association_id);
          case 'owners':
            return await recipientService.getResidentsByType(group.association_id, 'owner');
          case 'tenants':
            return await recipientService.getResidentsByType(group.association_id, 'tenant');
          case 'board_members':
            return await recipientService.getMembersByRoleType(group.association_id, 'board');
          default:
            return [];
        }
      } else if (group.group_type === 'custom' && group.criteria) {
        // Handle custom groups with specific criteria
        return await recipientService.getRecipientsByCustomCriteria(group.association_id, group.criteria);
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching recipients in group:', error);
      return [];
    }
  },
  
  // Helper functions for getting different types of recipients
  getAllResidents: async (associationId: string): Promise<MessageRecipient[]> => {
    try {
      const { data, error } = await supabase
        .from('residents')
        .select('*, properties:property_id(*)')
        .eq('properties.association_id', associationId);
        
      if (error) throw error;
      
      return data?.map(resident => ({
        id: resident.id,
        name: resident.name,
        email: resident.email,
        type: 'resident'
      })) || [];
    } catch (error) {
      console.error('Error fetching all residents:', error);
      return [];
    }
  },
  
  getResidentsByType: async (associationId: string, residentType: string): Promise<MessageRecipient[]> => {
    try {
      const { data, error } = await supabase
        .from('residents')
        .select('*, properties:property_id(*)')
        .eq('properties.association_id', associationId)
        .eq('resident_type', residentType);
        
      if (error) throw error;
      
      return data?.map(resident => ({
        id: resident.id,
        name: resident.name,
        email: resident.email,
        type: 'resident'
      })) || [];
    } catch (error) {
      console.error(`Error fetching residents of type ${residentType}:`, error);
      return [];
    }
  },
  
  getMembersByRoleType: async (associationId: string, roleType: string): Promise<MessageRecipient[]> => {
    try {
      const { data, error } = await supabase
        .from('association_member_roles')
        .select('*, profiles:user_id(*)')
        .eq('association_id', associationId)
        .eq('role_type', roleType);
        
      if (error) throw error;
      
      // Fix the types by safely accessing properties
      return data?.map(member => {
        const profile = member.profiles as any; // Type assertion to avoid errors
        return {
          id: member.id,
          name: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 'Unknown',
          email: profile?.email || '',
          type: 'member'
        };
      }) || [];
    } catch (error) {
      console.error(`Error fetching members of role type ${roleType}:`, error);
      return [];
    }
  },
  
  getRecipientsByCustomCriteria: async (associationId: string, criteria: any): Promise<MessageRecipient[]> => {
    // This function would implement custom logic based on the criteria object
    // For this example, we'll return an empty array
    return [];
  }
};
