import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClipboardList, Plus, RefreshCw } from 'lucide-react';
import HomeownerRequestsTable from '@/components/homeowners/HomeownerRequestsTable';
import HomeownerRequestFilters from '@/components/homeowners/HomeownerRequestFilters';
import { HomeownerRequest, HomeownerRequestStatus, HomeownerRequestPriority, HomeownerRequestType, HOMEOWNER_REQUEST_COLUMNS } from '@/types/homeowner-request-types';
import { useSupabaseQuery } from '@/hooks/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { HomeownerRequestForm } from '@/components/homeowners/HomeownerRequestForm';
import { toast } from 'sonner';
import HomeownerRequestsColumnSelector from '@/components/homeowners/HomeownerRequestsColumnSelector';
import { useHomeownerRequestNotifications } from '@/hooks/homeowners/useHomeownerRequestNotifications';

const HomeownerRequestsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState<HomeownerRequestStatus | 'all'>('all');
  const [priority, setPriority] = useState<HomeownerRequestPriority | 'all'>('all');
  const [type, setType] = useState<HomeownerRequestType | 'all'>('all');
  const [open, setOpen] = useState(false);
  const [visibleColumnIds, setVisibleColumnIds] = useState(() => 
    HOMEOWNER_REQUEST_COLUMNS.filter(col => col.defaultVisible).map(col => col.id)
  );

  const { data: homeownerRequests = [], isLoading, error, refetch } = useSupabaseQuery<HomeownerRequest[]>(
    'homeowner_requests',
    {
      select: '*',
      order: { column: 'created_at', ascending: false },
    }
  );

  const { markAllAsRead } = useHomeownerRequestNotifications();
  
  useEffect(() => {
    markAllAsRead();
  }, []);

  if (error) {
    console.error('Error fetching homeowner requests:', error);
  }

  const filteredRequests = homeownerRequests.filter(request => {
    const matchesSearch = 
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = status === 'all' || request.status === status;
    const matchesPriority = priority === 'all' || request.priority === priority;
    const matchesType = type === 'all' || request.type === type;

    return matchesSearch && matchesStatus && matchesPriority && matchesType;
  });

  const handleFormSuccess = () => {
    setOpen(false);
    refetch();
    toast.success('Request created successfully');
  };

  const handleColumnChange = (selectedColumns: string[]) => {
    setVisibleColumnIds(selectedColumns);
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Data refreshed');
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ClipboardList className="h-8 w-8" />
            <h1 className="text-3xl font-bold tracking-tight">Homeowner Requests</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={handleRefresh}
              title="Refresh data"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <HomeownerRequestsColumnSelector 
              columns={HOMEOWNER_REQUEST_COLUMNS}
              selectedColumns={visibleColumnIds}
              onChange={handleColumnChange}
            />
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> New Request
                </Button>
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
            <CardTitle>Request Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <HomeownerRequestFilters 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              status={status}
              setStatus={setStatus}
              priority={priority}
              setPriority={setPriority}
              type={type}
              setType={setType}
            />
            
            {isLoading ? (
              <div className="py-8 text-center">Loading requests...</div>
            ) : (
              <>
                <HomeownerRequestsTable 
                  requests={filteredRequests} 
                  columns={HOMEOWNER_REQUEST_COLUMNS}
                  visibleColumnIds={visibleColumnIds}
                />
                
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing {filteredRequests.length} of {homeownerRequests.length} requests
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default HomeownerRequestsPage;
