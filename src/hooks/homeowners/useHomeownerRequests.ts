
import { useState, useEffect } from 'react';
import { HomeownerRequest, HomeownerRequestStatus, HomeownerRequestPriority, HomeownerRequestType } from '@/types/homeowner-request-types';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';

export const useHomeownerRequests = () => {
  const [activeTab, setActiveTab] = useState<HomeownerRequestStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [priority, setPriority] = useState<HomeownerRequestPriority | 'all'>('all');
  const [type, setType] = useState<HomeownerRequestType | 'all'>('all');
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [manualRequests, setManualRequests] = useState<HomeownerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const { currentAssociation } = useAuth();

  // Fetch homeowner requests directly using Supabase client
  useEffect(() => {
    fetchRequests();
  }, [currentAssociation, lastRefreshed]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching homeowner requests, current association:', currentAssociation?.id);
      
      // Check if there are any requests in the table at all (for debugging)
      const { data: allRequests, error: countError } = await supabase
        .from('homeowner_requests')
        .select('*', { count: 'exact' });
        
      if (countError) {
        console.error('Error fetching all homeowner requests:', countError);
        throw countError;
      }
      
      console.log(`Total homeowner requests in database: ${allRequests?.length || 0}`);
      
      // If current association exists, filter by it
      let query = supabase.from('homeowner_requests').select('*');
      
      if (currentAssociation) {
        console.log(`Filtering by association: ${currentAssociation.id}`);
        query = query.eq('association_id', currentAssociation.id);
      } else {
        console.log('No current association selected, showing all requests user has access to');
      }
      
      const { data, error: requestsError } = await query.order('created_at', { ascending: false });
      
      if (requestsError) {
        console.error('Error fetching homeowner requests:', requestsError);
        throw requestsError;
      }
      
      console.log(`Received ${data?.length || 0} homeowner requests after filtering`);
      
      if (data && data.length > 0) {
        console.log('First request sample:', data[0]);
      }
      
      // Properly cast the data to ensure it matches the HomeownerRequest type
      const typedRequests: HomeownerRequest[] = (data || []).map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        status: item.status as HomeownerRequestStatus,
        priority: item.priority as HomeownerRequestPriority,
        type: item.type as HomeownerRequestType,
        created_at: item.created_at,
        updated_at: item.updated_at,
        resident_id: item.resident_id,
        property_id: item.property_id,
        association_id: item.association_id,
        assigned_to: item.assigned_to,
        resolved_at: item.resolved_at,
        html_content: item.html_content,
        tracking_number: item.tracking_number
      }));
      
      setManualRequests(typedRequests);
    } catch (err: any) {
      console.error('Error in fetchRequests:', err);
      setError(err);
      toast.error(`Failed to load homeowner requests: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Filter requests based on search and filter criteria
  const filteredRequests = manualRequests.filter(request => {
    // Safety check for null or undefined values
    if (!request || !request.title || !request.description) {
      console.warn('Invalid request data encountered:', request);
      return false;
    }
    
    const matchesSearch = 
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = activeTab === 'all' || request.status === activeTab;
    const matchesPriority = priority === 'all' || request.priority === priority;
    const matchesType = type === 'all' || request.type === type;

    return matchesSearch && matchesStatus && matchesPriority && matchesType;
  });

  const handleRefresh = () => {
    console.log('Refreshing homeowner requests...');
    setLastRefreshed(new Date());
  };

  // Create a dummy request for testing if no requests exist
  const createDummyRequest = async () => {
    if (!currentAssociation) {
      toast.error("Please select an association first");
      return;
    }
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('homeowner_requests')
        .insert({
          title: 'Test Request',
          description: 'This is a test homeowner request',
          status: 'open',
          priority: 'medium',
          type: 'general',
          association_id: currentAssociation.id,
          tracking_number: `HOR-${Math.floor(Math.random() * 10000)}`
        })
        .select();
        
      if (error) throw error;
      
      toast.success('Test request created successfully');
      handleRefresh();
    } catch (err: any) {
      console.error('Error creating test request:', err);
      toast.error(`Failed to create test request: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return {
    homeownerRequests: manualRequests,
    filteredRequests,
    isLoading: loading,
    error,
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    priority,
    setPriority,
    type,
    setType,
    lastRefreshed,
    handleRefresh,
    createDummyRequest
  };
};
