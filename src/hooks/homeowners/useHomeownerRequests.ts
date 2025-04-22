
import { useState, useEffect, useCallback } from 'react';
import { useSupabaseQuery } from '@/hooks/supabase';
import { HomeownerRequest, HomeownerRequestPriority, HomeownerRequestType } from '@/types/homeowner-request-types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

export const useHomeownerRequests = () => {
  const { currentAssociation } = useAuth();
  const [homeownerRequests, setHomeownerRequests] = useState<HomeownerRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<HomeownerRequest[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [priority, setPriority] = useState<HomeownerRequestPriority | ''>('');
  const [type, setType] = useState<HomeownerRequestType | ''>('');
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [selectedRequests, setSelectedRequests] = useState<HomeownerRequest[]>([]);
  
  // Advanced filters
  const [advancedFilters, setAdvancedFilters] = useState({
    dateFrom: undefined as Date | undefined,
    dateTo: undefined as Date | undefined,
    assignedToMe: false,
    propertyId: '',
    trackingNumber: ''
  });

  // Fetch homeowner requests
  const { data, isLoading, error, refetch } = useSupabaseQuery<HomeownerRequest[]>(
    'homeowner_requests',
    {
      filter: currentAssociation 
        ? [{ column: 'association_id', value: currentAssociation.id }] 
        : [],
      order: { column: 'created_at', ascending: false }
    },
    !!currentAssociation
  );

  // Update homeowner requests when data changes
  useEffect(() => {
    if (data) {
      setHomeownerRequests(data);
      setLastRefreshed(new Date());
    }
  }, [data]);

  // Filter requests based on active tab, search term, priority, and type
  useEffect(() => {
    if (!homeownerRequests) return;

    let filtered = [...homeownerRequests];

    // Filter by tab (status)
    if (activeTab !== 'all') {
      filtered = filtered.filter(request => request.status === activeTab);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        request =>
          request.title?.toLowerCase().includes(term) ||
          request.description?.toLowerCase().includes(term) ||
          request.tracking_number?.toLowerCase().includes(term)
      );
    }

    // Filter by priority
    if (priority) {
      filtered = filtered.filter(request => request.priority === priority);
    }

    // Filter by type
    if (type) {
      filtered = filtered.filter(request => request.type === type);
    }
    
    // Apply advanced filters
    if (advancedFilters.dateFrom) {
      const fromDate = new Date(advancedFilters.dateFrom);
      filtered = filtered.filter(request => {
        const createdAt = new Date(request.created_at);
        return createdAt >= fromDate;
      });
    }
    
    if (advancedFilters.dateTo) {
      const toDate = new Date(advancedFilters.dateTo);
      // Set to end of day
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(request => {
        const createdAt = new Date(request.created_at);
        return createdAt <= toDate;
      });
    }
    
    if (advancedFilters.trackingNumber) {
      filtered = filtered.filter(request => 
        request.tracking_number?.includes(advancedFilters.trackingNumber)
      );
    }
    
    if (advancedFilters.propertyId) {
      filtered = filtered.filter(request => 
        request.property_id === advancedFilters.propertyId
      );
    }

    setFilteredRequests(filtered);
  }, [homeownerRequests, activeTab, searchTerm, priority, type, advancedFilters]);

  // Refresh data
  const handleRefresh = useCallback(() => {
    refetch();
    setLastRefreshed(new Date());
  }, [refetch]);

  // Create a dummy request for testing
  const createDummyRequest = useCallback(async () => {
    if (!currentAssociation) {
      toast.error('Please select an association first');
      return;
    }

    try {
      const dummyRequest = {
        title: `Test Request ${new Date().toLocaleTimeString()}`,
        description: 'This is a test request created for development purposes.',
        type: 'general',
        priority: 'medium',
        status: 'open',
        association_id: currentAssociation.id,
        tracking_number: `REQ-${Math.floor(Math.random() * 10000)}`
      };

      const { data, error } = await supabase
        .from('homeowner_requests')
        .insert(dummyRequest)
        .select();

      if (error) throw error;
      toast.success('Test request created successfully');
      handleRefresh();
    } catch (error) {
      console.error('Error creating test request:', error);
      toast.error('Failed to create test request');
    }
  }, [currentAssociation, handleRefresh]);
  
  // Handle bulk status change
  const handleBulkStatusChange = async (status: string, requestIds: string[]) => {
    try {
      const { error } = await supabase
        .from('homeowner_requests')
        .update({ status, updated_at: new Date().toISOString() })
        .in('id', requestIds);
        
      if (error) throw error;
      handleRefresh();
      return;
    } catch (error) {
      console.error('Error updating status in bulk:', error);
      throw error;
    }
  };
  
  // Handle bulk priority change
  const handleBulkPriorityChange = async (priority: string, requestIds: string[]) => {
    try {
      const { error } = await supabase
        .from('homeowner_requests')
        .update({ priority, updated_at: new Date().toISOString() })
        .in('id', requestIds);
        
      if (error) throw error;
      handleRefresh();
      return;
    } catch (error) {
      console.error('Error updating priority in bulk:', error);
      throw error;
    }
  };
  
  // Handle bulk assign
  const handleBulkAssign = async (userId: string, requestIds: string[]) => {
    try {
      const { error } = await supabase
        .from('homeowner_requests')
        .update({ assigned_to: userId, updated_at: new Date().toISOString() })
        .in('id', requestIds);
        
      if (error) throw error;
      handleRefresh();
      return;
    } catch (error) {
      console.error('Error assigning in bulk:', error);
      throw error;
    }
  };
  
  // Apply advanced filters
  const applyAdvancedFilters = (filters: any) => {
    setSearchTerm(filters.searchTerm || '');
    setPriority(filters.priority || '');
    setType(filters.type || '');
    setAdvancedFilters({
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      assignedToMe: filters.assignedToMe,
      propertyId: filters.propertyId || '',
      trackingNumber: filters.trackingNumber || ''
    });
  };
  
  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setPriority('');
    setType('');
    setAdvancedFilters({
      dateFrom: undefined,
      dateTo: undefined,
      assignedToMe: false,
      propertyId: '',
      trackingNumber: ''
    });
  };
  
  // Toggle request selection
  const toggleRequestSelection = (request: HomeownerRequest) => {
    setSelectedRequests(prev => {
      const isSelected = prev.some(r => r.id === request.id);
      if (isSelected) {
        return prev.filter(r => r.id !== request.id);
      } else {
        return [...prev, request];
      }
    });
  };
  
  // Select all visible requests
  const selectAllRequests = () => {
    setSelectedRequests(filteredRequests);
  };
  
  // Clear selection
  const clearSelection = () => {
    setSelectedRequests([]);
  };

  return {
    homeownerRequests,
    filteredRequests,
    isLoading,
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
    createDummyRequest,
    advancedFilters,
    applyAdvancedFilters,
    resetFilters,
    selectedRequests,
    toggleRequestSelection,
    selectAllRequests,
    clearSelection,
    handleBulkStatusChange,
    handleBulkPriorityChange,
    handleBulkAssign
  };
};
