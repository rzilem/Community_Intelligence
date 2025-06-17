
import React from 'react';
import VendorsAdvancedHeader from './vendors-advanced/components/VendorsAdvancedHeader';
import TabNavigation from './vendors-advanced/components/TabNavigation';
import SearchTab from './vendors-advanced/tabs/SearchTab';
import RecommendationsTab from './vendors-advanced/tabs/RecommendationsTab';
import MobileTab from './vendors-advanced/tabs/MobileTab';
import AnalyticsTab from './vendors-advanced/tabs/AnalyticsTab';
import APITab from './vendors-advanced/tabs/APITab';
import VendorListTab from './vendors-advanced/tabs/VendorListTab';
import { useVendorsAdvanced } from './vendors-advanced/hooks/useVendorsAdvanced';
import { useRecommendationCriteria } from './vendors-advanced/hooks/useRecommendationCriteria';
import { useAdvancedFilters } from './vendors-advanced/hooks/useAdvancedFilters';
import { useTabNavigation } from './vendors-advanced/hooks/useTabNavigation';

const VendorsAdvanced = () => {
  const {
    vendors,
    vendorStats,
    isLoadingVendors,
    vendorsError,
    handleSelectVendor,
    handleVisitSave,
    handleVisitComplete
  } = useVendorsAdvanced();

  const { criteria, updateCriteria } = useRecommendationCriteria();
  const { activeTab, setActiveTab } = useTabNavigation();
  
  const {
    filteredVendors,
    handleFiltersChange,
    handleSaveSearch,
    handleCreateAlert
  } = useAdvancedFilters(vendors);

  if (vendorsError) {
    return (
      <VendorsAdvancedHeader vendorStats={vendorStats}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-2">Error loading vendors data</p>
            <p className="text-sm text-muted-foreground">
              {vendorsError?.message || 'Unknown error occurred'}
            </p>
          </div>
        </div>
      </VendorsAdvancedHeader>
    );
  }

  return (
    <VendorsAdvancedHeader vendorStats={vendorStats}>
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab}>
        <SearchTab
          filteredVendors={filteredVendors}
          isLoading={isLoadingVendors}
          onFiltersChange={handleFiltersChange}
          onSaveSearch={handleSaveSearch}
          onCreateAlert={handleCreateAlert}
        />

        <RecommendationsTab
          vendors={vendors}
          criteria={criteria}
          onCriteriaChange={updateCriteria}
          onSelectVendor={handleSelectVendor}
        />

        <MobileTab
          onSave={handleVisitSave}
          onComplete={handleVisitComplete}
        />

        <AnalyticsTab vendors={vendors} />

        <APITab />

        <VendorListTab 
          vendors={vendors} 
          isLoading={isLoadingVendors} 
        />
      </TabNavigation>
    </VendorsAdvancedHeader>
  );
};

export default VendorsAdvanced;
