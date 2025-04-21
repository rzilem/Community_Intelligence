
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuery } from '@tanstack/react-query';
import { MessageSquare } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { supabase } from '@/integrations/supabase/client';

export const CommunicationsTab = ({ associationId }: { associationId: string }) => {
  const { data: communications, isLoading } = useQuery({
    queryKey: ['communications', associationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('association_id', associationId);
      
      if (error) throw error;
      return data;
    }
  });

  const columns = [
    { accessorKey: 'title', header: 'Title' },
    { accessorKey: 'priority', header: 'Priority' },
    { accessorKey: 'created_at', header: 'Date' },
    { accessorKey: 'status', header: 'Status' }
  ];

  return (
    <ScrollArea className="h-full w-full">
      <div className="space-y-6 p-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-6 w-6" />
              <h3 className="text-2xl font-semibold">Communications</h3>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable 
              columns={columns}
              data={communications || []}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
};
