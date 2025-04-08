
import { useState } from 'react';
import { Lead } from '@/types/lead-types';
import { toast } from 'sonner';
import { useSupabaseQuery } from '@/hooks/supabase';
import { supabase } from '@/integrations/supabase/client';

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
  
  return { 
    leads, 
    isLoading,
    lastRefreshed,
    refreshLeads,
    createTestLead
  };
};

function getMockLeads(): Lead[] {
  return [
    {
      id: '1',
      name: 'Alex Johnson',
      email: 'alex@sunvalleyhoa.com',
      phone: '555-123-4567',
      company: 'Sunvalley HOA',
      source: 'Email',
      status: 'new',
      notes: 'Interested in management software for 250 units',
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      name: 'Sarah Miller',
      email: 'smiller@oakridgeestates.org',
      phone: '555-987-6543',
      company: 'Oakridge Estates',
      source: 'Website',
      status: 'contacted',
      notes: 'Looking to upgrade from spreadsheets, managing 120 units',
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '3',
      name: 'Robert Chen',
      email: 'robert.chen@cityloftshoa.com',
      phone: '555-222-3333',
      company: 'City Lofts HOA',
      source: 'Email',
      status: 'qualified',
      notes: 'Needs a complete management solution for 500+ properties',
      created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
}

function generateTestLead(): Lead {
  const names = ['John Smith', 'Emma Davis', 'Michael Wong', 'Lisa Garcia', 'David Taylor'];
  const companies = ['Lakeside HOA', 'Mountain View Estates', 'Riverfront Community', 'Harbor Heights', 'Greenfield Gardens'];
  const domains = ['hoa.org', 'management.com', 'properties.net', 'community.org', 'estates.com'];
  const sources = ['Email', 'Website', 'Referral', 'Trade Show'];
  const statuses: Lead['status'][] = ['new', 'contacted', 'qualified', 'proposal', 'converted', 'lost'];

  const randomName = names[Math.floor(Math.random() * names.length)];
  const randomCompany = companies[Math.floor(Math.random() * companies.length)];
  const randomDomain = domains[Math.floor(Math.random() * domains.length)];
  const randomSource = sources[Math.floor(Math.random() * sources.length)];
  const randomStatus = statuses[Math.floor(Math.random() * 3)]; // Bias toward earlier stages
  
  const firstName = randomName.split(' ')[0].toLowerCase();
  const email = `${firstName}@${randomCompany.toLowerCase().replace(/\s+/g, '')}${randomDomain}`;
  
  return {
    id: Math.random().toString(36).substring(2, 10),
    name: randomName,
    email: email,
    phone: `555-${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
    company: randomCompany,
    source: randomSource,
    status: randomStatus,
    notes: `Potential lead for ${Math.floor(50 + Math.random() * 500)} units`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}
