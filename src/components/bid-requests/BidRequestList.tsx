
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BidRequestWithVendors } from '@/types/bid-request-types';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { getCategoryImageUrl } from '@/services/bid-requests/bid-request-utils';

interface BidRequestListProps {
  bidRequests: BidRequestWithVendors[];
}

const BidRequestList: React.FC<BidRequestListProps> = ({ bidRequests }) => {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'open': return 'default';
      case 'closed': return 'destructive';
      case 'awarded': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {bidRequests.map((bidRequest) => (
        <Card key={bidRequest.id} className="hover:shadow-md transition-shadow">
          <div 
            className="h-48 bg-cover bg-center"
            style={{ 
              backgroundImage: `url(${bidRequest.imageUrl || getCategoryImageUrl(bidRequest.category || '')})` 
            }}
          />
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">{bidRequest.title}</CardTitle>
              <Badge variant={getStatusVariant(bidRequest.status)}>
                {bidRequest.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {bidRequest.description}
              </p>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">
                    Budget: {bidRequest.budget ? formatCurrency(bidRequest.budget) : 'Not specified'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Due: {bidRequest.dueDate ? new Date(bidRequest.dueDate).toLocaleDateString() : 'No due date'}
                  </p>
                </div>
                <div className="text-xs text-muted-foreground">
                  {bidRequest.vendors?.length || 0} Vendors
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default BidRequestList;
