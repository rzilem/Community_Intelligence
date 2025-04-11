
import { supabase } from '@/integrations/supabase/client';
import { Announcement, RecipientGroup, MessageRecipient } from '@/types/communication-types';

export const communicationService = {
  
  // Get all associations the user has access to
  getAllAssociations: async () => {
    try {
      const { data, error } = await supabase
        .from('associations')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching associations:', error);
      return [];
    }
  },
  
  // Get a specific association by ID
  getAssociationById: async (associationId: string) => {
    try {
      const { data, error } = await supabase
        .from('associations')
        .select('*')
        .eq('id', associationId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error fetching association with ID ${associationId}:`, error);
      return null;
    }
  },
  
  // Get recipient groups for a specific association
  getRecipientGroups: async (associationId: string) => {
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
  getRecipientGroupsForAssociations: async (associationIds: string[]) => {
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
  getAssociationMembersByRole: async (associationId: string, roleType?: string) => {
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
  getRecipientsInGroup: async (groupId: string) => {
    try {
      const { data: group, error: groupError } = await supabase
        .from('recipient_groups')
        .select('*')
        .eq('id', groupId)
        .single();
        
      if (groupError) throw groupError;
      
      // Depending on the group type and criteria, fetch the recipients
      if (group.group_type === 'system') {
        // Handle system groups
        switch (group.criteria?.type) {
          case 'all_residents':
            return await communicationService.getAllResidents(group.association_id);
          case 'owners':
            return await communicationService.getResidentsByType(group.association_id, 'owner');
          case 'tenants':
            return await communicationService.getResidentsByType(group.association_id, 'tenant');
          case 'board_members':
            return await communicationService.getMembersByRoleType(group.association_id, 'board');
          default:
            return [];
        }
      } else if (group.group_type === 'custom' && group.criteria) {
        // Handle custom groups with specific criteria
        return await communicationService.getRecipientsByCustomCriteria(group.association_id, group.criteria);
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching recipients in group:', error);
      return [];
    }
  },
  
  // Helper functions for getting different types of recipients
  getAllResidents: async (associationId: string) => {
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
  
  getResidentsByType: async (associationId: string, residentType: string) => {
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
  
  getMembersByRoleType: async (associationId: string, roleType: string) => {
    try {
      const { data, error } = await supabase
        .from('association_member_roles')
        .select('*, profiles:user_id(*)')
        .eq('association_id', associationId)
        .eq('role_type', roleType);
        
      if (error) throw error;
      
      return data?.map(member => ({
        id: member.id,
        name: `${member.profiles.first_name} ${member.profiles.last_name}`,
        email: member.profiles.email,
        type: 'member'
      })) || [];
    } catch (error) {
      console.error(`Error fetching members of role type ${roleType}:`, error);
      return [];
    }
  },
  
  getRecipientsByCustomCriteria: async (associationId: string, criteria: any) => {
    // This function would implement custom logic based on the criteria object
    // For this example, we'll return an empty array
    return [];
  },
  
  // Send a message
  sendMessage: async (messageData: {
    subject: string;
    content: string;
    association_id: string;
    recipient_groups: string[];
    type: 'email' | 'sms';
  }) => {
    try {
      // This is a placeholder for the actual API call
      console.log('Sending message:', messageData);
      
      // Simulate a successful API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return { success: true };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Get announcements for an association
  getAnnouncements: async (associationId: string) => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('association_id', associationId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching announcements:', error);
      return [];
    }
  },

  // Create a new announcement
  createAnnouncement: async (announcement: Omit<Announcement, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .insert([announcement])
        .select();
      
      if (error) throw error;
      return data?.[0] || null;
    } catch (error) {
      console.error('Error creating announcement:', error);
      throw error;
    }
  },

  // Update an existing announcement
  updateAnnouncement: async (id: string, updates: Partial<Announcement>) => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .update(updates)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data?.[0] || null;
    } catch (error) {
      console.error('Error updating announcement:', error);
      throw error;
    }
  },

  // Delete an announcement
  deleteAnnouncement: async (id: string) => {
    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting announcement:', error);
      throw error;
    }
  }
};
