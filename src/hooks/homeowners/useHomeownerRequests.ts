
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
      
      // Mock homeowner requests data since table doesn't exist
      const mockRequests: HomeownerRequest[] = [
        {
          id: '1',
          title: 'Pool Maintenance Request',
          description: 'The pool needs cleaning and chemical balancing',
          status: 'open',
          priority: 'medium',
          type: 'maintenance',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          resident_id: 'resident-1',
          property_id: 'property-1',
          association_id: currentAssociation?.id || 'default',
          tracking_number: 'HOR-001'
        },
        {
          id: '2',
          title: 'Billing Question',
          description: 'Question about monthly assessment fees',
          status: 'in-progress',
          priority: 'low',
          type: 'billing',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: new Date(Date.now() - 86400000).toISOString(),
          resident_id: 'resident-2',
          property_id: 'property-2',
          association_id: currentAssociation?.id || 'default',
          tracking_number: 'HOR-002'
        }
      ];
      
      console.log(`Generated ${mockRequests.length} mock homeowner requests`);
      setManualRequests(mockRequests);
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
      
      const testRequest: HomeownerRequest = {
        id: Date.now().toString(),
        title: 'Test Request',
        description: 'This is a test homeowner request',
        status: 'open',
        priority: 'medium',
        type: 'general',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        association_id: currentAssociation?.id || "85bdb4ea-4288-414d-8f17-83b4a33725b8",
        tracking_number: `HOR-${Math.floor(Math.random() * 10000)}`
      };
      
      console.log('Creating mock test request:', testRequest);
      
      // Add to current requests list
      setManualRequests(prev => [testRequest, ...prev]);
      
      console.log('Test request created successfully');
      toast.success('Test request created successfully');
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
