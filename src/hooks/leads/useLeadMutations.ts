
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Lead } from '@/types/lead-types';
import { useLeadScoring } from './useLeadScoring';

export const useLeadMutations = () => {
  const { updateLeadScore } = useLeadScoring();

  const createTestLead = async () => {
    try {
      const testLead = generateTestLead();
      
      try {
        console.log('Creating test lead:', testLead);
        const { data, error } = await supabase
          .from('leads' as any)
          .insert(testLead)
          .select();
        
        if (error) {
          console.error('Error inserting test lead:', error);
          throw error;
        }
        
        if (data && data[0]) {
          const leadData = data[0] as unknown as Lead;
          await updateLeadScore(leadData);
        }
        
        console.log('Test lead created successfully:', data);
        toast.success('Test lead created successfully');
        return data;
      } catch (dbError: any) {
        console.error('Database error details:', dbError);
        toast.error(`Error creating lead: ${dbError.message || 'Unknown error'}`);
        throw dbError;
      }
    } catch (error: any) {
      console.error('General error creating test lead:', error);
      toast.error('Failed to create test lead');
      throw error;
    }
  };
  
  const deleteLead = async (id: string): Promise<void> => {
    try {
      console.log('Deleting lead:', id);
      const { error } = await supabase
        .from('leads' as any)
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error('Error deleting lead:', error);
        throw error;
      }
    } catch (error: any) {
      console.error('Error deleting lead:', error);
      throw error;
    }
  };
  
  const updateLeadStatus = async (id: string, status: Lead['status']): Promise<void> => {
    try {
      // First, fetch the lead to get current data
      const { data: leadData, error: fetchError } = await supabase
        .from('leads' as any)
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !leadData) {
        console.error('Error fetching lead:', fetchError);
        throw fetchError || new Error('Lead not found');
      }

      // Now we have properly typed lead data
      const lead = leadData as Lead;
      
      console.log(`Updating lead ${id} status to ${status}`);
      
      // Prepare update data
      const updateData: Partial<Lead> = { 
        status, 
        updated_at: new Date().toISOString() 
      };
      
      // Add follow-up data if status is qualified
      if (status === 'qualified') {
        updateData.follow_up_sequence = (lead.follow_up_sequence || 0) + 1;
        updateData.next_follow_up = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      }

      const { error } = await supabase
        .from('leads' as any)
        .update(updateData)
        .eq('id', id);
      
      if (error) {
        console.error('Error updating lead status:', error);
        throw error;
      }
      
      // Update lead score with new status
      await updateLeadScore({ ...lead, status });
      
    } catch (error: any) {
      console.error('Error updating lead status:', error);
      throw error;
    }
  };

  return {
    createTestLead,
    deleteLead,
    updateLeadStatus
  };
};

function generateTestLead(): Lead {
  const names = ['John Smith', 'Emma Davis', 'Michael Wong', 'Lisa Garcia', 'David Taylor'];
  const companies = ['Lakeside HOA', 'Mountain View Estates', 'Riverfront Community', 'Harbor Heights', 'Greenfield Gardens'];
  const domains = ['hoa.org', 'management.com', 'properties.net', 'community.org', 'estates.com'];
  const sources = ['Email', 'Website', 'Referral', 'Trade Show'];
  const statuses: Lead['status'][] = ['new', 'contacted', 'qualified', 'proposal', 'converted', 'lost'];
  const associationTypes = ['Condominium', 'Single-family', 'Townhouse', 'Mixed-use'];
  const states = ['TX', 'CA', 'FL', 'NY', 'IL'];
  const currentManagements = ['Self-managed', 'Local company', 'National firm', 'None'];
  const cities = ['Austin', 'San Francisco', 'Miami', 'New York', 'Chicago', 'Dallas', 'Seattle'];

  const randomName = names[Math.floor(Math.random() * names.length)];
  const nameParts = randomName.split(' ');
  const firstName = nameParts[0];
  const lastName = nameParts[1];
  const randomCompany = companies[Math.floor(Math.random() * companies.length)];
  const randomDomain = domains[Math.floor(Math.random() * domains.length)];
  const randomSource = sources[Math.floor(Math.random() * sources.length)];
  const randomStatus = statuses[Math.floor(Math.random() * 3)]; // Bias toward earlier stages
  const randomAssocType = associationTypes[Math.floor(Math.random() * associationTypes.length)];
  const randomState = states[Math.floor(Math.random() * states.length)];
  const randomManagement = currentManagements[Math.floor(Math.random() * currentManagements.length)];
  const randomCity = cities[Math.floor(Math.random() * cities.length)];
  
  const email = `${firstName.toLowerCase()}@${randomCompany.toLowerCase().replace(/\s+/g, '')}${randomDomain}`;
  const units = Math.floor(20 + Math.random() * 400);
  
  return {
    id: Math.random().toString(36).substring(2, 10),
    name: randomName,
    email: email,
    phone: `555-${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
    company: randomCompany,
    source: randomSource,
    status: randomStatus,
    notes: `Potential lead for ${units} units`,
    first_name: firstName,
    last_name: lastName,
    association_name: randomCompany,
    association_type: randomAssocType,
    number_of_units: units,
    street_address: `${Math.floor(100 + Math.random() * 9900)} Main St`,
    city: randomCity,
    state: randomState,
    zip: `${Math.floor(10000 + Math.random() * 90000)}`,
    current_management: randomManagement,
    additional_requirements: Math.random() > 0.7 ? 'Needs special attention to maintenance issues' : undefined,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    // New properties required by the updated Lead type
    lead_score: 0,
    follow_up_sequence: 0,
    proposal_count: 0
  };
}
