
import React from 'react';
import { useHomeownerRequests } from '@/hooks/homeowners/useHomeownerRequests';
import HomeownerRequestHeader from './components/HomeownerRequestHeader';
import HomeownerRequestContent from './components/HomeownerRequestContent'; 
import HomeownerRequestDialogs from './components/HomeownerRequestDialogs';
import HomeownerRequestDebugInfo from '@/components/homeowners/debug/HomeownerRequestDebugInfo';

const HomeownerRequestsPage = () => {
  const requestsHook = useHomeownerRequests();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <HomeownerRequestHeader 
        isLoading={requestsHook.isLoading}
        onRefresh={requestsHook.handleRefresh}
        onCreateTest={requestsHook.createDummyRequest}
      />
      
      <HomeownerRequestContent 
        {...requestsHook}
      />
      
      <HomeownerRequestDialogs 
        selectedRequest={null}
        handleRefresh={requestsHook.handleRefresh}
      />
      
      <HomeownerRequestDebugInfo 
        requests={requestsHook.homeownerRequests}
        filteredRequests={requestsHook.filteredRequests}
      />
    </div>
  );
};

export default HomeownerRequestsPage;
