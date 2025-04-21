
import React from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock } from 'lucide-react';
import { useSupabaseQuery } from '@/hooks/supabase';
import { formatDistanceToNow } from 'date-fns';

interface WorkOrder {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_date: string;
  created_at: string;
  assigned_to?: string;
  description?: string;
}

const WorkOrdersTabContent = () => {
  const { data: workOrders = [], isLoading } = useSupabaseQuery<WorkOrder[]>(
    'work_orders',
    {
      select: '*',
      order: { column: 'created_at', ascending: false }
    }
  );

  const getPriorityBadge = (priority: string) => {
    const colors = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-green-100 text-green-800 border-green-200'
    };
    return <Badge variant="outline" className={colors[priority as keyof typeof colors]}>{priority}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      open: 'bg-blue-100 text-blue-800 border-blue-200',
      'in-progress': 'bg-purple-100 text-purple-800 border-purple-200',
      completed: 'bg-green-100 text-green-800 border-green-200'
    };
    return <Badge variant="outline" className={colors[status as keyof typeof colors]}>{status}</Badge>;
  };

  if (isLoading) {
    return <div>Loading work orders...</div>;
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workOrders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>{order.title}</TableCell>
              <TableCell>{getPriorityBadge(order.priority)}</TableCell>
              <TableCell>{getStatusBadge(order.status)}</TableCell>
              <TableCell>
                {order.due_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(order.due_date).toLocaleDateString()}</span>
                  </div>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}</span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default WorkOrdersTabContent;
