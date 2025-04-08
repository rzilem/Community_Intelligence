
import { useState } from 'react';
import { Lead, LEAD_COLUMN_DEFINITIONS } from '@/types/lead-types';
import { toast } from 'sonner';
import { useSupabaseQuery } from '@/hooks/supabase';
import { supabase } from '@/integrations/supabase/client';
import { useTableColumns } from './useTableColumns';

export const useLeads = () => {
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  
  const { 
    data: leads = [], 
    isLoading,
    error,
    refetch: refreshLeadsData
  } = useSupabaseQuery<Lead[]>(
    'leads' as any, // Type assertion needed until database types are regenerated
    {
      select: '*',
      order: { column: 'created_at', ascending: false }
    }
  );
  
  // Set up customizable columns
  const { 
    columns, 
    visibleColumnIds, 
    updateVisibleColumns,
    reorderColumns 
  } = useTableColumns(
    LEAD_COLUMN_DEFINITIONS,
    'leads-visible-columns'
  );
  
  // Log information about the leads data for debugging
  if (leads.length > 0) {
    console.log('Leads data loaded:', leads.length, 'leads');
    console.log('Sample lead:', leads[0]);
  } else if (!isLoading) {
    console.log('No leads found in the database');
  }
  
  // Log any errors from the query
  if (error) {
    console.error('Error fetching leads:', error);
  }
  
  const refreshLeads = async () => {
    try {
      console.log('Refreshing leads data...');
      await refreshLeadsData();
      setLastRefreshed(new Date());
      console.log('Leads refresh completed');
    } catch (error) {
      console.error('Error refreshing leads:', error);
      toast.error('Could not fetch leads. Please ensure you are authenticated.');
    }
  };
  
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
        
        console.log('Test lead created successfully:', data);
        toast.success('Test lead created successfully');
        refreshLeads();
      } catch (dbError: any) {
        console.error('Database error details:', dbError);
        toast.error(`Error creating lead: ${dbError.message || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('General error creating test lead:', error);
      toast.error('Failed to create test lead');
    }
  };
  
  const deleteLead = async (id: string) => {
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
      
      refreshLeads();
      return true;
    } catch (error: any) {
      console.error('Error deleting lead:', error);
      throw error;
    }
  };
  
  const updateLeadStatus = async (id: string, status: Lead['status']) => {
    try {
      console.log(`Updating lead ${id} status to ${status}`);
      const { error } = await supabase
        .from('leads' as any)
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) {
        console.error('Error updating lead status:', error);
        throw error;
      }
      
      refreshLeads();
      return true;
    } catch (error: any) {
      console.error('Error updating lead status:', error);
      throw error;
    }
  };
  
  return { 
    leads, 
    isLoading,
    lastRefreshed,
    refreshLeads,
    createTestLead,
    deleteLead,
    updateLeadStatus,
    columns,
    visibleColumnIds,
    updateVisibleColumns,
    reorderColumns
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
    city: 'Springfield',
    state: randomState,
    zip: `${Math.floor(10000 + Math.random() * 90000)}`,
    current_management: randomManagement,
    additional_requirements: Math.random() > 0.7 ? 'Needs special attention to maintenance issues' : undefined,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}
