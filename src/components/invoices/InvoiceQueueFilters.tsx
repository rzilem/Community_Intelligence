
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Inbox } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface InvoiceQueueFiltersProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  counts: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    paid: number;
  };
  isLoading: boolean;
}

export const InvoiceQueueFilters: React.FC<InvoiceQueueFiltersProps> = ({
  activeTab,
  setActiveTab,
  searchTerm,
  setSearchTerm,
  counts,
  isLoading,
}) => {
  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="inline-flex">
        <TabsList>
          <TabsTrigger value="all">
            All
            <Badge variant="secondary" className="ml-2">
              {isLoading ? <Skeleton className="h-4 w-4" /> : counts.total}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending
            <Badge variant="secondary" className="ml-2 bg-yellow-100 text-yellow-800">
              {isLoading ? <Skeleton className="h-4 w-4" /> : counts.pending}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved
            <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800">
              {isLoading ? <Skeleton className="h-4 w-4" /> : counts.approved}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected
            <Badge variant="secondary" className="ml-2 bg-red-100 text-red-800">
              {isLoading ? <Skeleton className="h-4 w-4" /> : counts.rejected}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="paid">
            Paid
            <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
              {isLoading ? <Skeleton className="h-4 w-4" /> : counts.paid}
            </Badge>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="relative w-full max-w-sm">
        <Input
          placeholder="Search invoices..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
        <Inbox className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>
    </div>
  );
};

