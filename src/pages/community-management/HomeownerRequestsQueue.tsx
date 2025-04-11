
import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ClipboardList, 
  Plus, 
  Search, 
  Filter, 
  RefreshCw,
  DownloadCloud,
  CalendarClock
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  HomeownerRequest, 
  HomeownerRequestStatus, 
  HomeownerRequestPriority, 
  HomeownerRequestType,
  HOMEOWNER_REQUEST_COLUMNS 
} from '@/types/homeowner-request-types';
import { useSupabaseQuery } from '@/hooks/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { HomeownerRequestForm } from '@/components/homeowners/HomeownerRequestForm';
import { toast } from 'sonner';
import HomeownerRequestsTable from '@/components/homeowners/HomeownerRequestsTable';
import HomeownerRequestsColumnSelector from '@/components/homeowners/HomeownerRequestsColumnSelector';
import TooltipButton from '@/components/ui/tooltip-button';

const HomeownerRequestsQueue = () => {
  const [activeTab, setActiveTab] = useState<HomeownerRequestStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [priority, setPriority] = useState<HomeownerRequestPriority | 'all'>('all');
  const [type, setType] = useState<HomeownerRequestType | 'all'>('all');
  const [open, setOpen] = useState(false);
  const [visibleColumnIds, setVisibleColumnIds] = useState<string[]>(
    HOMEOWNER_REQUEST_COLUMNS.filter(col => col.defaultVisible).map(col => col.id)
  );
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  // Fetch homeowner requests from Supabase
  const { data: homeownerRequests = [], isLoading, error, refetch } = useSupabaseQuery<HomeownerRequest[]>(
    'homeowner_requests',
    {
      select: '*',
      order: { column: 'created_at', ascending: false },
    }
  );

  if (error) {
    console.error('Error fetching homeowner requests:', error);
  }

  // Filter requests based on search and filter criteria
  const filteredRequests = homeownerRequests.filter(request => {
    const matchesSearch = 
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = activeTab === 'all' || request.status === activeTab;
    const matchesPriority = priority === 'all' || request.priority === priority;
    const matchesType = type === 'all' || request.type === type;

    return matchesSearch && matchesStatus && matchesPriority && matchesType;
  });

  const handleFormSuccess = () => {
    setOpen(false);
    refetch();
    toast.success('Request created successfully');
  };

  const handleRefresh = () => {
    refetch();
    setLastRefreshed(new Date());
    toast.success('Requests refreshed');
  };

  const handleExport = () => {
    toast.success('Export functionality will be implemented soon');
  };

  const handleColumnChange = (selectedColumnIds: string[]) => {
    setVisibleColumnIds(selectedColumnIds);
    localStorage.setItem('homeownerRequestColumns', JSON.stringify(selectedColumnIds));
  };

  const handleReorderColumns = (sourceIndex: number, destinationIndex: number) => {
    const newVisibleColumns = [...visibleColumnIds];
    const [removed] = newVisibleColumns.splice(sourceIndex, 1);
    newVisibleColumns.splice(destinationIndex, 0, removed);
    
    setVisibleColumnIds(newVisibleColumns);
    localStorage.setItem('homeownerRequestColumns', JSON.stringify(newVisibleColumns));
  };

  // Load column preferences from localStorage on component mount
  useEffect(() => {
    const savedColumns = localStorage.getItem('homeownerRequestColumns');
    if (savedColumns) {
      setVisibleColumnIds(JSON.parse(savedColumns));
    }
  }, []);

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ClipboardList className="h-8 w-8" />
            <h1 className="text-3xl font-bold tracking-tight">Homeowner Request Queue</h1>
          </div>
          <div className="flex items-center gap-2">
            <TooltipButton 
              variant="outline" 
              onClick={handleRefresh}
              tooltip="Refresh Requests"
            >
              <RefreshCw className="h-4 w-4 mr-2" /> Refresh
            </TooltipButton>
            
            <TooltipButton 
              variant="outline" 
              onClick={handleExport}
              tooltip="Export Requests"
            >
              <DownloadCloud className="h-4 w-4 mr-2" /> Export
            </TooltipButton>
            
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <TooltipButton tooltip="Create New Request">
                  <Plus className="h-4 w-4 mr-2" /> New Request
                </TooltipButton>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Create New Request</DialogTitle>
                </DialogHeader>
                <HomeownerRequestForm onSuccess={handleFormSuccess} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Request Queue</CardTitle>
              <div className="flex items-center">
                <HomeownerRequestsColumnSelector
                  columns={HOMEOWNER_REQUEST_COLUMNS}
                  selectedColumns={visibleColumnIds}
                  onChange={handleColumnChange}
                  onReorder={handleReorderColumns}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={activeTab} onValueChange={(value) => setActiveTab(value as HomeownerRequestStatus | 'all')}>
              <div className="flex justify-between mb-6">
                <TabsList>
                  <TabsTrigger value="all">All Requests</TabsTrigger>
                  <TabsTrigger value="open">Open</TabsTrigger>
                  <TabsTrigger value="in-progress">In Progress</TabsTrigger>
                  <TabsTrigger value="resolved">Resolved</TabsTrigger>
                  <TabsTrigger value="closed">Closed</TabsTrigger>
                </TabsList>
              </div>
              
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search requests..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Select value={priority} onValueChange={(value) => setPriority(value as HomeownerRequestPriority | 'all')}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={type} onValueChange={(value) => setType(value as HomeownerRequestType | 'all')}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="compliance">Compliance</SelectItem>
                      <SelectItem value="billing">Billing</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="amenity">Amenity</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <TooltipButton variant="outline" tooltip="Advanced Filters">
                    <Filter className="h-4 w-4 mr-2" /> More Filters
                  </TooltipButton>
                  
                  <TooltipButton variant="outline" tooltip="Calendar View">
                    <CalendarClock className="h-4 w-4 mr-2" /> Calendar View
                  </TooltipButton>
                </div>
              </div>
              
              <TabsContent value="all" className="mt-0">
                {isLoading ? (
                  <div className="py-8 text-center">Loading requests...</div>
                ) : (
                  <HomeownerRequestsTable 
                    requests={filteredRequests} 
                    columns={HOMEOWNER_REQUEST_COLUMNS}
                    visibleColumnIds={visibleColumnIds}
                  />
                )}
              </TabsContent>
              
              <TabsContent value="open" className="mt-0">
                {isLoading ? (
                  <div className="py-8 text-center">Loading requests...</div>
                ) : (
                  <HomeownerRequestsTable 
                    requests={filteredRequests} 
                    columns={HOMEOWNER_REQUEST_COLUMNS}
                    visibleColumnIds={visibleColumnIds}
                  />
                )}
              </TabsContent>
              
              <TabsContent value="in-progress" className="mt-0">
                {isLoading ? (
                  <div className="py-8 text-center">Loading requests...</div>
                ) : (
                  <HomeownerRequestsTable 
                    requests={filteredRequests} 
                    columns={HOMEOWNER_REQUEST_COLUMNS}
                    visibleColumnIds={visibleColumnIds}
                  />
                )}
              </TabsContent>
              
              <TabsContent value="resolved" className="mt-0">
                {isLoading ? (
                  <div className="py-8 text-center">Loading requests...</div>
                ) : (
                  <HomeownerRequestsTable 
                    requests={filteredRequests} 
                    columns={HOMEOWNER_REQUEST_COLUMNS}
                    visibleColumnIds={visibleColumnIds}
                  />
                )}
              </TabsContent>
              
              <TabsContent value="closed" className="mt-0">
                {isLoading ? (
                  <div className="py-8 text-center">Loading requests...</div>
                ) : (
                  <HomeownerRequestsTable 
                    requests={filteredRequests} 
                    columns={HOMEOWNER_REQUEST_COLUMNS}
                    visibleColumnIds={visibleColumnIds}
                  />
                )}
              </TabsContent>
            </Tabs>
            
            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <p>
                Showing {filteredRequests.length} of {homeownerRequests.length} requests
              </p>
              <p>
                Last updated: {lastRefreshed.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default HomeownerRequestsQueue;
