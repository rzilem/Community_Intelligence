
import React, { useState } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Building2, Plus, FileDown, SlidersIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VendorList from '@/components/vendors/VendorList';
import VendorStatsCards from '@/components/vendors/VendorStatsCards';
import VendorDialog from '@/components/vendors/VendorDialog';
import { useVendors, useVendorStats, useCreateVendor } from '@/hooks/vendors/useVendors';
import { VendorFormData } from '@/types/vendor-types';

const Vendors = () => {
  const [addVendorOpen, setAddVendorOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('list');

  const { data: vendors = [], isLoading: isLoadingVendors } = useVendors();
  const { data: vendorStats, isLoading: isLoadingStats } = useVendorStats();
  const createVendor = useCreateVendor();

  const handleAddVendor = (data: VendorFormData) => {
    createVendor.mutate(data, {
      onSuccess: () => {
        setAddVendorOpen(false);
      }
    });
  };

  return (
    <PageTemplate 
      title="Vendor Management" 
      icon={<Building2 className="h-8 w-8" />}
      description="Manage vendor relationships, contracts, and service providers."
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="text-muted-foreground">
              Manage your vendor relationships and services
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              View vendor performance metrics and insurance tracking
            </p>
          </div>
          <Button onClick={() => setAddVendorOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Vendor
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="list">
              <Building2 className="mr-2 h-4 w-4" />
              Vendor List
            </TabsTrigger>
            <TabsTrigger value="metrics">
              <SlidersIcon className="mr-2 h-4 w-4" />
              Metrics & Analytics
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {vendorStats && <VendorStatsCards stats={vendorStats} />}

        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Vendors</h2>
          <Button variant="outline" size="sm">
            <FileDown className="mr-2 h-4 w-4" />
            Import/Export
          </Button>
        </div>

        {isLoadingVendors ? (
          <div className="flex justify-center py-8">Loading vendors...</div>
        ) : (
          <VendorList vendors={vendors} />
        )}
      </div>

      <VendorDialog
        open={addVendorOpen}
        onOpenChange={setAddVendorOpen}
        onSubmit={handleAddVendor}
        title="Add Vendor"
      />
    </PageTemplate>
  );
};

export default Vendors;
