
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import PageTemplate from '@/components/layout/PageTemplate';
import { Building2, Plus, FileDown, SlidersIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VendorList from '@/components/vendors/VendorList';
import VendorStatsCards from '@/components/vendors/VendorStatsCards';
import VendorDialog from '@/components/vendors/VendorDialog';
import { vendorService } from '@/services/vendor-service';
import { VendorFormData } from '@/types/vendor-types';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/auth';

const Vendors = () => {
  const [addVendorOpen, setAddVendorOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  const { toast } = useToast();
  const { currentAssociation } = useAuth();

  const { data: vendors = [], isLoading: isLoadingVendors, error: vendorsError } = useQuery({
    queryKey: ['vendors'],
    queryFn: vendorService.getVendors,
  });

  const { data: vendorStats, isLoading: isLoadingStats, error: statsError } = useQuery({
    queryKey: ['vendor-stats'],
    queryFn: vendorService.getVendorStats,
  });

  const handleAddVendor = async (data: VendorFormData) => {
    try {
      if (!currentAssociation) {
        toast({
          title: "Error",
          description: "No association selected. Please select an association first.",
          variant: "destructive",
        });
        return;
      }

      await vendorService.createVendor({
        ...data,
        hoa_id: currentAssociation.id,
      });
      
      toast({
        title: "Vendor added",
        description: `${data.name} has been added successfully.`,
      });
      setAddVendorOpen(false);
    } catch (error) {
      console.error('Error adding vendor:', error);
      toast({
        title: "Error",
        description: "Failed to add vendor. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (vendorsError || statsError) {
    return (
      <PageTemplate 
        title="Vendor Management" 
        icon={<Building2 className="h-8 w-8" />}
        description="Manage vendor relationships, contracts, and service providers."
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-2">Error loading vendors data</p>
            <p className="text-sm text-muted-foreground">
              {vendorsError?.message || statsError?.message || 'Unknown error occurred'}
            </p>
          </div>
        </div>
      </PageTemplate>
    );
  }

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
          <h2 className="text-xl font-semibold">
            Vendors ({vendors.length})
          </h2>
          <Button variant="outline" size="sm">
            <FileDown className="mr-2 h-4 w-4" />
            Import/Export
          </Button>
        </div>

        {isLoadingVendors ? (
          <div className="flex justify-center py-8">
            <div className="text-center">
              <div className="h-8 w-8 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-2">Loading vendors...</p>
            </div>
          </div>
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
