
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import PageTemplate from '@/components/layout/PageTemplate';
import { Building2, Plus, FileDown, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VendorList from '@/components/vendors/VendorList';
import VendorStatsCards from '@/components/vendors/VendorStatsCards';
import VendorDialog from '@/components/vendors/VendorDialog';
import { vendorService } from '@/services/vendor-service';
import { VendorFormData } from '@/types/vendor-types';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/auth';
import { Link } from 'react-router-dom';

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
      <div className="space-y-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Vendor Management</h1>
              <p className="text-gray-600 mb-1">
                Manage your vendor relationships and services
              </p>
              <p className="text-sm text-gray-500">
                View vendor performance metrics and insurance tracking
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" asChild>
                <Link to="/operations/vendors/advanced">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Advanced Features
                </Link>
              </Button>
              <Button onClick={() => setAddVendorOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> 
                Add Vendor
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {vendorStats && <VendorStatsCards stats={vendorStats} />}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <TabsList className="grid grid-cols-2 w-full max-w-md">
              <TabsTrigger value="list" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Vendor Directory
              </TabsTrigger>
              <TabsTrigger value="metrics" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Performance
              </TabsTrigger>
            </TabsList>
            
            <Button variant="outline" size="sm">
              <FileDown className="mr-2 h-4 w-4" />
              Export Data
            </Button>
          </div>
        </Tabs>

        {/* Content */}
        {isLoadingVendors ? (
          <div className="flex justify-center py-12">
            <div className="text-center">
              <div className="h-8 w-8 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">Loading vendors...</p>
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
