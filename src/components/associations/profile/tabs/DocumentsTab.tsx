
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuery } from '@tanstack/react-query';
import { FileText } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { supabase } from '@/integrations/supabase/client';

export const DocumentsTab = ({ associationId }: { associationId: string }) => {
  const { data: documents, isLoading } = useQuery({
    queryKey: ['documents', associationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('association_id', associationId);
      
      if (error) throw error;
      return data;
    }
  });

  const columns = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'category', header: 'Category' },
    { accessorKey: 'file_type', header: 'Type' },
    { accessorKey: 'uploaded_date', header: 'Date' }
  ];

  return (
    <ScrollArea className="h-full w-full">
      <div className="space-y-6 p-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-6 w-6" />
              <h3 className="text-2xl font-semibold">Documents</h3>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable 
              columns={columns}
              data={documents || []}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
};
