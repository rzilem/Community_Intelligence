
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AdvancedVendorSearch from '@/components/vendors/search/AdvancedVendorSearch';
import VendorList from '@/components/vendors/VendorList';
import LoadingTabContent from '../components/LoadingTabContent';
import { Vendor } from '@/types/vendor-types';
import { VENDOR_TABS } from '../config/tab-constants';

interface SearchTabProps {
  filteredVendors: Vendor[];
  isLoading: boolean;
  onFiltersChange: (filters: any) => void;
  onSaveSearch: (searchName: string, filters: any) => void;
  onCreateAlert: (filters: any) => void;
}

const SearchTab: React.FC<SearchTabProps> = ({
  filteredVendors,
  isLoading,
  onFiltersChange,
  onSaveSearch,
  onCreateAlert
}) => {
  return (
    <TabsContent value={VENDOR_TABS.SEARCH} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <AdvancedVendorSearch 
            onFiltersChange={onFiltersChange}
            onSaveSearch={onSaveSearch}
            onCreateAlert={onCreateAlert}
          />
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Search Results ({filteredVendors.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <LoadingTabContent />
              ) : (
                <VendorList vendors={filteredVendors} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </TabsContent>
  );
};

export default SearchTab;
