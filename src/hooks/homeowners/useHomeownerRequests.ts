import { useState, useEffect } from 'react';
import { HomeownerRequest, HomeownerRequestStatus, HomeownerRequestPriority, HomeownerRequestType } from '@/types/homeowner-request-types';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';

export const useHomeownerRequests = () => {
  const [activeTab, setActiveTab] = useState<HomeownerRequestStatus | 'all' | 'active'>('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [priority, setPriority] = useState<HomeownerRequestPriority | 'all'>('all');
  const [type, setType] = useState<HomeownerRequestType | 'all'>('all');
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [manualRequests, setManualRequests] = useState<HomeownerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const { currentAssociation } = useAuth();

  useEffect(() => {
    fetchRequests();
    
    const interval = setInterval(() => {
      console.log('Auto-refreshing homeowner requests...');
      fetchRequests(false);
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
      
      const { error: accessError } = await supabase
        .from('homeowner_requests')
        .select('count', { count: 'exact', head: true });
        
      if (accessError) {
        console.error('Error accessing homeowner_requests table:', accessError);
        throw new Error(`Cannot access homeowner requests: ${accessError.message}`);
      }
      
      let query = supabase.from('homeowner_requests').select('*');
      
      query = query.order('created_at', { ascending: false });
      
      const { data, error: requestsError } = await query;
      
      if (requestsError) {
        console.error('Error fetching homeowner requests:', requestsError);
        throw requestsError;
      }
      
      console.log(`Received ${data?.length || 0} homeowner requests after querying`);
      
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

  const filteredRequests = manualRequests.filter(request => {
    if (currentAssociation?.id && request.association_id && 
        request.association_id !== currentAssociation.id) {
      return false;
    }
    
    if (!request || !request.title || !request.description) {
      console.warn('Invalid request data encountered:', request);
      return false;
    }
    
    const matchesSearch = 
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.tracking_number && request.tracking_number.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = 
      activeTab === 'all' ? true :
      activeTab === 'active' ? request.status !== 'closed' :
      request.status === activeTab;
      
    const matchesPriority = priority === 'all' || request.priority === priority;
    const matchesType = type === 'all' || request.type === type;

    return matchesSearch && matchesStatus && matchesPriority && matchesType;
  });

  const handleRefresh = () => {
    console.log('Refreshing homeowner requests...');
    setLastRefreshed(new Date());
  };

  const createDummyRequest = async () => {
    try {
      setLoading(true);
      
      const testRequest: any = {
        title: 'Test Request',
        description: 'This is a test homeowner request',
        status: 'open',
        priority: 'medium',
        type: 'general',
        tracking_number: `HOR-${Math.floor(Math.random() * 10000)}`
      };
      
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
