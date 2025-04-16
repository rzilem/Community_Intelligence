
import { useState, useEffect } from 'react';
import { HomeownerRequest, HomeownerRequestStatus, HomeownerRequestPriority, HomeownerRequestType } from '@/types/homeowner-request-types';
import { useSupabaseQuery } from '@/hooks/supabase';

export const useHomeownerRequests = () => {
  const [activeTab, setActiveTab] = useState<HomeownerRequestStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [priority, setPriority] = useState<HomeownerRequestPriority | 'all'>('all');
  const [type, setType] = useState<HomeownerRequestType | 'all'>('all');
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  // Fetch homeowner requests from Supabase
  const { data: homeownerRequests = [], isLoading, error, refetch } = useSupabaseQuery<HomeownerRequest[]>(
    'homeowner_requests',
    {
      select: '*',
      order: { column: 'created_at', ascending: false },
    }
  );

  // Log any errors to help with debugging
  if (error) {
    console.error('Error fetching homeowner requests:', error);
  }

  // Troubleshooting: Log the data to see what we're getting back
  useEffect(() => {
    if (homeownerRequests && homeownerRequests.length > 0) {
      console.log('Homeowner requests loaded:', homeownerRequests);
    }
  }, [homeownerRequests]);

  // Filter requests based on search and filter criteria
  const filteredRequests = homeownerRequests.filter(request => {
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
    refetch();
    setLastRefreshed(new Date());
  };

  return {
    homeownerRequests,
    filteredRequests,
    isLoading,
    error,
    refetch,
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    priority,
    setPriority,
    type,
    setType,
    lastRefreshed,
    setLastRefreshed,
    handleRefresh
  };
};
