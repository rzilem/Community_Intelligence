
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

  if (error) {
    console.error('Error fetching homeowner requests:', error);
  }

  // Filter requests based on search and filter criteria
  const filteredRequests = homeownerRequests.filter(request => {
    const matchesSearch = 
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = activeTab === 'all' || request.status === activeTab;
    const matchesPriority = priority === 'all' || request.priority === priority;
    const matchesType = type === 'all' || request.type === type;

    return matchesSearch && matchesStatus && matchesPriority && matchesType;
  });

  const handleRefresh = () => {
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
