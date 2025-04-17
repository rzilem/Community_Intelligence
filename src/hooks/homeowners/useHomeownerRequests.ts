
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
    
    // Set up an interval to refresh the data every 30 seconds
    const interval = setInterval(() => {
      console.log('Auto-refreshing homeowner requests...');
      fetchRequests(false); // Silent refresh without loading indicator
    }, 30000);
    
    return () => clearInterval(interval);
  }, [currentAssociation?.id, lastRefreshed]);

  const fetchRequests = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);

      console.log('Fetching homeowner requests, current association:', currentAssociation?.id);
      
      // First check if we can access the homeowner_requests table
      const { error: accessError } = await supabase
        .from('homeowner_requests')
        .select('count', { count: 'exact', head: true });
        
      if (accessError) {
        console.error('Error accessing homeowner_requests table:', accessError);
        throw new Error(`Cannot access homeowner requests: ${accessError.message}`);
      }
      
      // Check if there are any requests in the table at all (for debugging)
      const { count: allCount, error: countError } = await supabase
        .from('homeowner_requests')
        .select('*', { count: 'exact', head: true });
        
      if (countError) {
        console.error('Error counting homeowner requests:', countError);
        throw countError;
      }
      
      console.log(`Total homeowner requests in database: ${allCount || 0}`);
      
      // Query without association filtering to see ALL requests (for debugging)
      const { data: allData, error: allDataError } = await supabase
        .from('homeowner_requests')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (allDataError) {
        console.error('Error fetching all homeowner requests:', allDataError);
      } else {
        console.log(`Found ${allData?.length || 0} total requests without association filtering`);
        if (allData && allData.length > 0) {
          console.log('First request sample without filtering:', allData[0]);
        }
      }
      
      // Get all requests instead of filtering by association
      // This approach allows us to show all requests and filter client-side
      let query = supabase.from('homeowner_requests').select('*');
      
      // Order by created date, most recent first
      query = query.order('created_at', { ascending: false });
      
      const { data, error: requestsError } = await query;
      
      if (requestsError) {
        console.error('Error fetching homeowner requests:', requestsError);
        throw requestsError;
      }
      
      console.log(`Received ${data?.length || 0} homeowner requests after querying`);
      
      if (data && data.length > 0) {
        console.log('First request sample:', data[0]);
      } else {
        console.log('No homeowner requests found in the database');
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
      if (showLoading) {
        toast.error(`Failed to load homeowner requests: ${err.message}`);
      }
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  // Filter requests based on search and filter criteria
  // Include association filtering at the client side
  const filteredRequests = manualRequests.filter(request => {
    // First, apply association filter if a current association is selected
    if (currentAssociation?.id && request.association_id && 
        request.association_id !== currentAssociation.id) {
      return false;
    }
    
    // Safety check for null or undefined values
    if (!request || !request.title || !request.description) {
      console.warn('Invalid request data encountered:', request);
      return false;
    }
    
    const matchesSearch = 
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.tracking_number && request.tracking_number.toLowerCase().includes(searchTerm.toLowerCase()));
    
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
    try {
      setLoading(true);
      
      // Create a test request that includes association_id when available
      const testRequest: any = {
        title: 'Test Request',
        description: 'This is a test homeowner request',
        status: 'open',
        priority: 'medium',
        type: 'general',
        tracking_number: `HOR-${Math.floor(Math.random() * 10000)}`
      };
      
      // Always add association_id 
      testRequest.association_id = currentAssociation?.id || "85bdb4ea-4288-414d-8f17-83b4a33725b8";
      
      console.log('Creating test request:', testRequest);
      
      const { data, error } = await supabase
        .from('homeowner_requests')
        .insert(testRequest)
        .select();
        
      if (error) {
        console.error('Error creating test request:', error);
        throw error;
      }
      
      console.log('Test request created successfully:', data);
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
