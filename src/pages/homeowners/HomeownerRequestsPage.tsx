
import React from 'react';
import { useHomeownerRequests } from '@/hooks/homeowners/useHomeownerRequests';
import HomeownerRequestHeader from './components/HomeownerRequestHeader';
import HomeownerRequestContent from './components/HomeownerRequestContent';
import HomeownerRequestDialogs from './components/HomeownerRequestDialogs';

const HomeownerRequestsPage = () => {
  const requestsHook = useHomeownerRequests();
  const {
    filteredRequests,
    homeownerRequests,
    isLoading,
    error,
    activeTab,
    handleRefresh,
    createDummyRequest
  } = requestsHook;

  return (
    <div className="container mx-auto px-4 py-8">
      <HomeownerRequestHeader 
        isLoading={isLoading}
        onRefresh={handleRefresh}
        onCreateTest={createDummyRequest}
      />
      
      <HomeownerRequestContent 
        {...requestsHook}
      />
      
      <HomeownerRequestDialogs 
        {...requestsHook}
      />
    </div>
  );
};

export default HomeownerRequestsPage;
