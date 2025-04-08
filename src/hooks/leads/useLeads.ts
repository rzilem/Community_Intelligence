
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Lead } from '@/types/lead-types';
import { toast } from 'sonner';

export const useLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  
  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      // Fetch leads from the database
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // Since we're now guaranteed that the data matches our Lead type
      // after creating the table, we can safely cast it
      setLeads(data as Lead[] || []);
      setLastRefreshed(new Date());
    } catch (error) {
      console.error('Error fetching leads:', error);
      // If there's an error, use mock data
      setLeads(getMockLeads());
      toast.error('Could not fetch leads. Please ensure you are authenticated.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const createTestLead = async () => {
    try {
      const testLead = generateTestLead();
      
      // Try to insert into supabase first
      try {
        const { data, error } = await supabase
          .from('leads')
          .insert(testLead)
          .select();
        
        if (error) {
          throw error;
        }
        
        toast.success('Test lead created successfully');
        fetchLeads();
      } catch (dbError) {
        console.error('Database error, using mock data:', dbError);
        // If database operation fails, just add to local state
        setLeads(prevLeads => [testLead as Lead, ...prevLeads]);
        toast.success('Test lead created (local only)');
      }
    } catch (error) {
      console.error('Error creating test lead:', error);
      toast.error('Failed to create test lead');
    }
  };
  
  useEffect(() => {
    fetchLeads();
  }, []);
  
  return { 
    leads, 
    isLoading,
    lastRefreshed,
    refreshLeads: fetchLeads,
    createTestLead
  };
};

// Helper functions
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
