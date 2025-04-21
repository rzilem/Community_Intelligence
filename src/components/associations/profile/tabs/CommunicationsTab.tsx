
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable } from '@/components/ui/data-table';
import ApiError from '@/components/ui/api-error';
import { MessageCircle, Mail, CalendarClock, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const CommunicationsTab = ({ associationId }: { associationId: string }) => {
  // Fetch announcements
  const { data: announcements, isLoading: announcementsLoading, error: announcementsError } = useQuery({
    queryKey: ['announcements', associationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select(`
          *,
          author:author_id(first_name, last_name, email)
        `)
        .eq('association_id', associationId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Column definitions
  const announcementColumns = [
    { accessorKey: 'title', header: 'Title' },
    { 
      accessorKey: 'author', 
      header: 'Author',
      cell: (info: any) => {
        const author = info.author;
        return author 
          ? `${author.first_name || ''} ${author.last_name || ''}`.trim() || author.email
          : '—';
      }
    },
    { 
      accessorKey: 'priority', 
      header: 'Priority',
      cell: (info: any) => (
        <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium inline-block
          ${info.priority === 'high' ? 'bg-red-100 text-red-800' : 
            info.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
            'bg-green-100 text-green-800'}`
        }>
          {info.priority}
        </div>
      )
    },
    { 
      accessorKey: 'created_at', 
      header: 'Date',
      cell: (info: any) => info.created_at 
        ? new Date(info.created_at).toLocaleDateString() 
        : '—'
    },
    { 
      accessorKey: 'is_published', 
      header: 'Status',
      cell: (info: any) => (
        <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium inline-block
          ${info.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`
        }>
          {info.is_published ? 'Published' : 'Draft'}
        </div>
      )
    }
  ];

  // Mock email workflow data (for now)
  const emailWorkflows = [
    { 
      id: '1', 
      name: 'Welcome New Resident', 
      trigger: 'New Resident Added',
      enabled: true,
      lastSent: '3 days ago'
    },
    { 
      id: '2', 
      name: 'Monthly Payment Reminder', 
      trigger: 'Scheduled (Monthly)',
      enabled: true,
      lastSent: '2 weeks ago'
    },
    { 
      id: '3', 
      name: 'Late Payment Notice', 
      trigger: 'Payment Overdue',
      enabled: true,
      lastSent: '1 week ago'
    }
  ];

  const workflowColumns = [
    { accessorKey: 'name', header: 'Workflow Name' },
    { accessorKey: 'trigger', header: 'Trigger' },
    { 
      accessorKey: 'enabled', 
      header: 'Status',
      cell: (info: any) => (
        <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium inline-block
          ${info.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`
        }>
          {info.enabled ? 'Active' : 'Disabled'}
        </div>
      )
    },
    { accessorKey: 'lastSent', header: 'Last Sent' },
  ];

  return (
    <ScrollArea className="h-full w-full">
      <div className="space-y-6 p-6">
        <Tabs defaultValue="announcements">
          <TabsList>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="sms">SMS</TabsTrigger>
          </TabsList>
          
          <TabsContent value="announcements" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  <h3 className="text-xl font-semibold">Announcements</h3>
                </div>
                <Button>New Announcement</Button>
              </CardHeader>
              <CardContent>
                {announcementsError ? (
                  <ApiError error={announcementsError as Error} title="Failed to load announcements" />
                ) : (
                  <DataTable 
                    columns={announcementColumns}
                    data={announcements || []}
                    isLoading={announcementsLoading}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="email" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  <h3 className="text-xl font-semibold">Email Workflows</h3>
                </div>
                <Button>New Workflow</Button>
              </CardHeader>
              <CardContent>
                <DataTable 
                  columns={workflowColumns}
                  data={emailWorkflows}
                  isLoading={false}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="sms" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center">
                  <Info className="h-5 w-5 mr-2" />
                  <h3 className="text-xl font-semibold">SMS Messaging</h3>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/20 p-8 rounded-md text-center space-y-4">
                  <p>SMS messaging features are coming soon.</p>
                  <Button variant="outline">Request Early Access</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
};
