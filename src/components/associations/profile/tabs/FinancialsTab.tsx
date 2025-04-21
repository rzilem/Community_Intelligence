
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable } from '@/components/ui/data-table';
import ApiError from '@/components/ui/api-error';
import { CreditCard, DollarSign, Receipt, BarChart3 } from 'lucide-react';

export const FinancialsTab = ({ associationId }: { associationId: string }) => {
  // Fetch invoices
  const { data: invoices, isLoading: invoicesLoading, error: invoicesError } = useQuery({
    queryKey: ['invoices', associationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('association_id', associationId)
        .order('invoice_date', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch assessments
  const { data: assessments, isLoading: assessmentsLoading, error: assessmentsError } = useQuery({
    queryKey: ['assessments', associationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assessments')
        .select(`
          *,
          property:property_id(address)
        `)
        .order('due_date', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data || [];
    }
  });

  // Column definitions
  const invoiceColumns = [
    { accessorKey: 'invoice_number', header: 'Invoice #' },
    { accessorKey: 'vendor', header: 'Vendor' },
    { 
      accessorKey: 'amount', 
      header: 'Amount',
      cell: (info: any) => `$${parseFloat(info.amount || 0).toFixed(2)}`
    },
    { 
      accessorKey: 'invoice_date', 
      header: 'Date',
      cell: (info: any) => info.invoice_date ? new Date(info.invoice_date).toLocaleDateString() : '—'
    },
    { 
      accessorKey: 'status', 
      header: 'Status',
      cell: (info: any) => (
        <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium inline-block
          ${info.status === 'paid' ? 'bg-green-100 text-green-800' : 
            info.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
            'bg-gray-100 text-gray-800'}`
        }>
          {info.status}
        </div>
      )
    }
  ];

  const assessmentColumns = [
    { 
      accessorKey: 'property.address', 
      header: 'Property',
      cell: (info: any) => info.property?.address || '—'
    },
    { 
      accessorKey: 'amount', 
      header: 'Amount',
      cell: (info: any) => `$${parseFloat(info.amount || 0).toFixed(2)}`
    },
    { 
      accessorKey: 'due_date', 
      header: 'Due Date',
      cell: (info: any) => info.due_date ? new Date(info.due_date).toLocaleDateString() : '—'
    },
    { 
      accessorKey: 'paid', 
      header: 'Status',
      cell: (info: any) => (
        <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium inline-block
          ${info.paid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`
        }>
          {info.paid ? 'Paid' : 'Unpaid'}
        </div>
      )
    }
  ];

  return (
    <ScrollArea className="h-full w-full">
      <div className="space-y-6 p-6">
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="assessments">Assessments</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h4 className="text-sm font-medium">Total Assessments</h4>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$24,567.00</div>
                  <p className="text-xs text-muted-foreground">+10.2% from last year</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h4 className="text-sm font-medium">Outstanding Balance</h4>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$5,231.89</div>
                  <p className="text-xs text-muted-foreground">4 properties with balances</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h4 className="text-sm font-medium">Upcoming Expenses</h4>
                  <Receipt className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$12,435.00</div>
                  <p className="text-xs text-muted-foreground">7 pending invoices</p>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <div className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  <h3 className="font-semibold">Financial Summary</h3>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Full reporting tools are currently being implemented. Check back soon for a complete view of your association's finances.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="invoices" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <h3 className="text-xl font-semibold">Recent Invoices</h3>
              </CardHeader>
              <CardContent>
                {invoicesError ? (
                  <ApiError error={invoicesError as Error} title="Failed to load invoices" />
                ) : (
                  <DataTable 
                    columns={invoiceColumns}
                    data={invoices || []}
                    isLoading={invoicesLoading}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="assessments" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <h3 className="text-xl font-semibold">Recent Assessments</h3>
              </CardHeader>
              <CardContent>
                {assessmentsError ? (
                  <ApiError error={assessmentsError as Error} title="Failed to load assessments" />
                ) : (
                  <DataTable 
                    columns={assessmentColumns}
                    data={assessments || []}
                    isLoading={assessmentsLoading}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
};
