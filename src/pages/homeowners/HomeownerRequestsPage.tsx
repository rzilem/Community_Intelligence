
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
        filteredRequests={requestsHook.filteredRequests}
        isLoading={requestsHook.isLoading}
        error={requestsHook.error}
        activeTab={requestsHook.activeTab}
        setActiveTab={(tab) => requestsHook.setActiveTab(tab as any)}
        searchTerm={requestsHook.searchTerm}
        setSearchTerm={requestsHook.setSearchTerm}
        priority={requestsHook.priority}
        setPriority={(priority) => requestsHook.setPriority(priority as any)}
        type={requestsHook.type}
        setType={(type) => requestsHook.setType(type as any)}
      />
      
      <HomeownerRequestDialogs 
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
