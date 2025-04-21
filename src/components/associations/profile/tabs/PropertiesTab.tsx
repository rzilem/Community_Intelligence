
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuery } from '@tanstack/react-query';
import { Building2 } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { supabase } from '@/integrations/supabase/client';

export const PropertiesTab = ({ associationId }: { associationId: string }) => {
  const { data: properties, isLoading } = useQuery({
    queryKey: ['properties', associationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('association_id', associationId);
      
      if (error) throw error;
      return data;
    }
  });

  const columns = [
    { accessorKey: 'address', header: 'Address' },
    { accessorKey: 'unit_number', header: 'Unit' },
    { accessorKey: 'property_type', header: 'Type' },
    { accessorKey: 'status', header: 'Status' }
  ];

  return (
    <ScrollArea className="h-full w-full">
      <div className="space-y-6 p-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-2">
              <Building2 className="h-6 w-6" />
              <h3 className="text-2xl font-semibold">Properties</h3>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable 
              columns={columns}
              data={properties || []}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
};
