
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PortalPageLayout } from '@/components/portal/PortalPageLayout';
import { FileText, Plus, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useResaleOrders } from '@/hooks/resale/useResaleOrders';
import { format } from 'date-fns';
import { ResaleOrder } from '@/types/resale-order-types';

const ResalePortal = () => {
  const navigate = useNavigate();
  const { orders, isLoading, error } = useResaleOrders();
  const [activeTab, setActiveTab] = useState<string>('all');

  const filteredOrders = React.useMemo(() => {
    if (activeTab === 'all') {
      return orders;
    } else {
      return orders.filter(order => 
        activeTab === 'scheduled' ? order.status === 'Scheduled' : 
        activeTab === 'completed' ? order.status === 'Completed' : 
        activeTab === 'in-review' ? order.status === 'In Review' :
        activeTab === 'past-due' ? order.status === 'Past Due' : 
        true
      );
    }
  }, [orders, activeTab]);

  const handleOrderClick = (orderId: string) => {
    navigate(`/resale-portal/orders/${orderId}`);
  };

  const handleNewOrder = () => {
    navigate('/resale-portal/order');
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Scheduled': return 'bg-amber-100 text-amber-800';
      case 'In Review': return 'bg-blue-100 text-blue-800';
      case 'Past Due': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed': return <CheckCircle2 className="h-4 w-4" />;
      case 'Scheduled': return <Clock className="h-4 w-4" />;
      case 'In Review': return <FileText className="h-4 w-4" />;
      case 'Past Due': return <AlertTriangle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const columns = [
    {
      accessorKey: 'orderNumber',
      header: 'Order Number',
      cell: (info: any) => info.getValue(),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: (info: any) => info.getValue(),
    },
    {
      accessorKey: 'address',
      header: 'Property Address',
      cell: (info: any) => (
        <div className="truncate max-w-[200px]" title={info.getValue()}>
          {info.getValue()}
        </div>
      ),
    },
    {
      accessorKey: 'community',
      header: 'Community',
      cell: (info: any) => info.getValue(),
    },
    {
      accessorKey: 'scheduledDate',
      header: 'Due Date',
      cell: (info: any) => format(new Date(info.getValue()), 'MMM d, yyyy'),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: (info: any) => {
        const status = info.getValue();
        return (
          <div className="flex items-center">
            <span className={`flex items-center gap-1.5 px-2 py-1 text-xs rounded font-medium ${getStatusClass(status)}`}>
              {getStatusIcon(status)}
              {status}
            </span>
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      accessorKey: 'id',
      cell: (info: any) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleOrderClick(info.row.original.id)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <PortalPageLayout
      title="Resale Order Portal"
      description="Request, manage and track your resale documents"
      icon={<FileText className="h-6 w-6" />}
      portalType="homeowner"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">My Orders</h3>
        <Button onClick={handleNewOrder}>
          <Plus className="h-4 w-4 mr-2" />
          New Order
        </Button>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="in-review">In Review</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="past-due">Past Due</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <Card>
            <CardContent className="p-0">
              <DataTable
                columns={columns}
                data={filteredOrders}
                isLoading={isLoading}
                noResultsMessage={
                  error ? 
                    `Error loading orders: ${error}` : 
                    filteredOrders.length === 0 ? 
                      `No ${activeTab !== 'all' ? activeTab : ''} orders found` : 
                      'No orders found'
                }
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PortalPageLayout>
  );
};

export default ResalePortal;
