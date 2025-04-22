
import React, { useState } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, FileText, BarChart } from 'lucide-react';
import AssociationSelector from '@/components/associations/AssociationSelector';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable } from '@/components/ui/data-table';
import { useSupabaseQuery } from '@/hooks/supabase';
import { Assessment } from '@/types/assessment-types';
import { Button } from '@/components/ui/button';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { useResponsive } from '@/hooks/use-responsive';

const AssessmentReportPage = () => {
  const [selectedAssociationId, setSelectedAssociationId] = useState<string | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), 0, 1),
    to: new Date()
  });
  const { isMobile } = useResponsive();

  // Fetch assessment data
  const { data: assessments = [], isLoading } = useSupabaseQuery<Assessment[]>({
    tableName: 'assessments',
    select: `
      id,
      property_id,
      amount,
      due_date,
      paid,
      payment_date,
      late_fee,
      created_at
    `,
    filter: [
      ...(selectedAssociationId ? [{ column: 'association_id', value: selectedAssociationId }] : []),
      ...(selectedStatus === 'paid' ? [{ column: 'paid', value: true }] : []),
      ...(selectedStatus === 'unpaid' ? [{ column: 'paid', value: false }] : [])
    ],
    orderBy: { column: 'due_date', ascending: false }
  },
  !!selectedAssociationId
  );

  // Construct columns for the data table
  const columns = [
    { 
      accessorKey: 'property_id', 
      header: 'Property' 
    },
    { 
      accessorKey: 'amount', 
      header: 'Amount',
      cell: (info: any) => `$${parseFloat(info.row.original.amount || 0).toFixed(2)}`
    },
    { 
      accessorKey: 'due_date', 
      header: 'Due Date',
      cell: (info: any) => info.row.original.due_date ? format(new Date(info.row.original.due_date), 'MMM dd, yyyy') : '—'
    },
    { 
      accessorKey: 'payment_date', 
      header: 'Payment Date',
      cell: (info: any) => info.row.original.payment_date ? format(new Date(info.row.original.payment_date), 'MMM dd, yyyy') : '—'
    },
    { 
      accessorKey: 'paid', 
      header: 'Status',
      cell: (info: any) => (
        <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium inline-block
          ${info.row.original.paid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`
        }>
          {info.row.original.paid ? 'Paid' : 'Unpaid'}
        </div>
      )
    },
    { 
      accessorKey: 'late_fee', 
      header: 'Late Fee',
      cell: (info: any) => info.row.original.late_fee ? `$${parseFloat(info.row.original.late_fee).toFixed(2)}` : '—'
    }
  ];

  // Calculate statistics
  const totalAmount = assessments.reduce((sum, item) => sum + parseFloat(item.amount.toString()), 0);
  const paidAmount = assessments.filter(a => a.paid).reduce((sum, item) => sum + parseFloat(item.amount.toString()), 0);
  const unpaidAmount = totalAmount - paidAmount;
  const paidCount = assessments.filter(a => a.paid).length;
  const collectionRate = assessments.length > 0 ? (paidCount / assessments.length) * 100 : 0;

  const handleAssociationChange = (associationId: string) => {
    setSelectedAssociationId(associationId);
  };

  return (
    <PageTemplate 
      title="Assessment Reports" 
      icon={<BarChart className="h-8 w-8" />}
      description="View and analyze assessment data across properties"
    >
      <div className="space-y-6">
        {/* Filters */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle>Assessment Report</CardTitle>
              <AssociationSelector 
                className="w-full md:w-[250px]" 
                onAssociationChange={handleAssociationChange}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="w-full md:w-auto">
                <DatePickerWithRange 
                  value={dateRange} 
                  onChange={setDateRange} 
                />
              </div>
              <div className="w-full md:w-auto">
                <Input
                  placeholder="Search properties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:w-[250px]"
                />
              </div>
              <div className="space-x-2">
                <Button 
                  variant={selectedStatus === undefined ? "default" : "outline"}
                  onClick={() => setSelectedStatus(undefined)}
                >
                  All
                </Button>
                <Button 
                  variant={selectedStatus === 'paid' ? "default" : "outline"}
                  onClick={() => setSelectedStatus('paid')}
                >
                  Paid
                </Button>
                <Button 
                  variant={selectedStatus === 'unpaid' ? "default" : "outline"}
                  onClick={() => setSelectedStatus('unpaid')}
                >
                  Unpaid
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Assessments</p>
                  <h3 className="text-2xl font-bold">${totalAmount.toFixed(2)}</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                {assessments.length} total assessments
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Collected</p>
                  <h3 className="text-2xl font-bold">${paidAmount.toFixed(2)}</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                {paidCount} paid assessments ({collectionRate.toFixed(1)}% rate)
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Outstanding</p>
                  <h3 className="text-2xl font-bold">${unpaidAmount.toFixed(2)}</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                {assessments.length - paidCount} unpaid assessments
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assessment Data Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Assessment Details</CardTitle>
              <Button variant="outline" className="flex items-center gap-2">
                <FileText className="h-4 w-4" /> Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable 
              columns={columns}
              data={assessments.filter(assessment => 
                searchTerm ? 
                  assessment.property_id.toLowerCase().includes(searchTerm.toLowerCase()) : 
                  true
              )}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </div>
    </PageTemplate>
  );
};

export default AssessmentReportPage;
