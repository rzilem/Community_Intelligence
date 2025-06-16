
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import PageTemplate from '@/components/layout/PageTemplate';
import { Building2, Search, TrendingUp, Smartphone, BarChart, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import VendorList from '@/components/vendors/VendorList';
import VendorStatsCards from '@/components/vendors/VendorStatsCards';
import AdvancedVendorSearch from '@/components/vendors/search/AdvancedVendorSearch';
import VendorRecommendationEngine from '@/components/vendors/recommendations/VendorRecommendationEngine';
import MobileVendorWorkflow from '@/components/vendors/mobile/MobileVendorWorkflow';
import VendorPerformanceReports from '@/components/vendors/analytics/VendorPerformanceReports';
import VendorAPIManagement from '@/components/vendors/api/VendorAPIManagement';
import { vendorService } from '@/services/vendor-service';
import { Vendor } from '@/types/vendor-types';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/auth';

const VendorsAdvanced = () => {
  const [activeTab, setActiveTab] = useState('search');
  const [searchFilters, setSearchFilters] = useState<any>({});
  const [recommendationCriteria, setRecommendationCriteria] = useState({
    projectType: 'Plumbing',
    budget: 5000,
    timeline: 'this_week',
    priority: 'quality' as const
  });
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const { toast } = useToast();
  const { currentAssociation } = useAuth();

  const { data: vendors = [], isLoading: isLoadingVendors, error: vendorsError } = useQuery({
    queryKey: ['vendors'],
    queryFn: vendorService.getVendors,
  });

  const { data: vendorStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['vendor-stats'],
    queryFn: vendorService.getVendorStats,
  });

  useEffect(() => {
    // Apply advanced filtering logic
    let filtered = vendors;

    if (searchFilters.specialties?.length > 0) {
      filtered = filtered.filter(vendor => 
        vendor.specialties?.some(specialty => 
          searchFilters.specialties.includes(specialty)
        )
      );
    }

    if (searchFilters.ratings?.length > 0) {
      const [minRating, maxRating] = searchFilters.ratings;
      filtered = filtered.filter(vendor => 
        vendor.rating && vendor.rating >= minRating && vendor.rating <= maxRating
      );
    }

    if (searchFilters.verified) {
      filtered = filtered.filter(vendor => vendor.is_active);
    }

    if (searchFilters.emergency24h) {
      // Filter for vendors with 24/7 availability
      filtered = filtered.filter(vendor => 
        vendor.average_response_time && vendor.average_response_time <= 2
      );
    }

    // Location-based filtering would go here with actual geo-data

    setFilteredVendors(filtered);
  }, [vendors, searchFilters]);

  const handleFiltersChange = (filters: any) => {
    setSearchFilters(filters);
  };

  const handleSaveSearch = (searchName: string, filters: any) => {
    // Save search logic would go here
    console.log('Saving search:', searchName, filters);
  };

  const handleCreateAlert = (filters: any) => {
    // Create alert logic would go here
    console.log('Creating alert for filters:', filters);
  };

  const handleSelectVendor = (vendor: Vendor) => {
    // Navigate to vendor profile or open detailed view
    window.location.href = `/operations/vendors/${vendor.id}`;
  };

  const handleVisitSave = (visitData: any) => {
    console.log('Saving visit data:', visitData);
    toast({
      title: "Visit Progress Saved",
      description: "Vendor visit information has been updated"
    });
  };

  const handleVisitComplete = (visit: any) => {
    console.log('Completing visit:', visit);
    toast({
      title: "Visit Completed",
      description: "Vendor visit has been marked as completed"
    });
  };

  if (vendorsError) {
    return (
      <PageTemplate 
        title="Advanced Vendor Management" 
        icon={<Building2 className="h-8 w-8" />}
        description="AI-powered vendor relationship management with advanced analytics."
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-2">Error loading vendors data</p>
            <p className="text-sm text-muted-foreground">
              {vendorsError?.message || 'Unknown error occurred'}
            </p>
          </div>
        </div>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate 
      title="Advanced Vendor Management" 
      icon={<Building2 className="h-8 w-8" />}
      description="AI-powered vendor relationship management with advanced analytics."
    >
      <div className="space-y-6">
        {/* Header Stats */}
        {vendorStats && <VendorStatsCards stats={vendorStats} />}

        {/* Advanced Features Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Advanced Search</span>
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">AI Recommendations</span>
            </TabsTrigger>
            <TabsTrigger value="mobile" className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              <span className="hidden sm:inline">Mobile Tools</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">API & Data</span>
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Vendor List</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <AdvancedVendorSearch 
                  onFiltersChange={handleFiltersChange}
                  onSaveSearch={handleSaveSearch}
                  onCreateAlert={handleCreateAlert}
                />
              </div>
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Search Results ({filteredVendors.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingVendors ? (
                      <div className="text-center py-8">
                        <div className="h-8 w-8 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-2">Loading vendors...</p>
                      </div>
                    ) : (
                      <VendorList vendors={filteredVendors} />
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg">Project Requirements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Project Type</label>
                    <select 
                      className="w-full mt-1 p-2 border rounded"
                      value={recommendationCriteria.projectType}
                      onChange={(e) => setRecommendationCriteria(prev => ({
                        ...prev, 
                        projectType: e.target.value
                      }))}
                    >
                      <option>Plumbing</option>
                      <option>Electrical</option>
                      <option>HVAC</option>
                      <option>Landscaping</option>
                      <option>Roofing</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Budget: ${recommendationCriteria.budget}</label>
                    <input 
                      type="range"
                      min="1000"
                      max="50000"
                      step="500"
                      value={recommendationCriteria.budget}
                      onChange={(e) => setRecommendationCriteria(prev => ({
                        ...prev,
                        budget: parseInt(e.target.value)
                      }))}
                      className="w-full mt-1"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Timeline</label>
                    <select 
                      className="w-full mt-1 p-2 border rounded"
                      value={recommendationCriteria.timeline}
                      onChange={(e) => setRecommendationCriteria(prev => ({
                        ...prev,
                        timeline: e.target.value
                      }))}
                    >
                      <option value="urgent">Urgent (1-2 days)</option>
                      <option value="this_week">This Week</option>
                      <option value="this_month">This Month</option>
                      <option value="flexible">Flexible</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Priority</label>
                    <select 
                      className="w-full mt-1 p-2 border rounded"
                      value={recommendationCriteria.priority}
                      onChange={(e) => setRecommendationCriteria(prev => ({
                        ...prev,
                        priority: e.target.value as any
                      }))}
                    >
                      <option value="cost">Lowest Cost</option>
                      <option value="quality">Highest Quality</option>
                      <option value="speed">Fastest Delivery</option>
                      <option value="reliability">Most Reliable</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
              
              <div className="lg:col-span-3">
                <VendorRecommendationEngine 
                  criteria={recommendationCriteria}
                  vendors={vendors}
                  onSelectVendor={handleSelectVendor}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="mobile" className="space-y-6">
            <div className="max-w-md mx-auto">
              <MobileVendorWorkflow 
                onSave={handleVisitSave}
                onComplete={handleVisitComplete}
              />
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <VendorPerformanceReports 
              vendors={vendors}
              dateRange={{
                start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
                end: new Date()
              }}
            />
          </TabsContent>

          <TabsContent value="api" className="space-y-6">
            <VendorAPIManagement />
          </TabsContent>

          <TabsContent value="list" className="space-y-6">
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
          </TabsContent>
        </Tabs>
      </div>
    </PageTemplate>
  );
};

export default VendorsAdvanced;
