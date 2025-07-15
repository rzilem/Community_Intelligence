
import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useHomeownerRequests } from '@/hooks/homeowners/useHomeownerRequests';
import HomeownerRequestHeader from './components/HomeownerRequestHeader';
import HomeownerRequestContent from './components/HomeownerRequestContent'; 
import HomeownerRequestDialogs from './components/HomeownerRequestDialogs';
import HomeownerRequestDebugInfo from '@/components/homeowners/debug/HomeownerRequestDebugInfo';

const HomeownerRequestsPage = () => {
  const requestsHook = useHomeownerRequests();
  
  return (
    <AppLayout>
      <div className="space-y-6 p-6">
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
    </AppLayout>
  );
};

export default HomeownerRequestsPage;
