
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BidRequestWithVendors } from '@/types/bid-request-types';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { getCategoryImageUrl } from '@/services/bid-requests/bid-request-utils';
import { Calendar, DollarSign, Users, MapPin } from 'lucide-react';

interface BidRequestListProps {
  bidRequests: BidRequestWithVendors[];
}

const BidRequestList: React.FC<BidRequestListProps> = ({ bidRequests }) => {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'published': return 'default';
      case 'bidding': return 'default';
      case 'evaluating': return 'secondary';
      case 'awarded': return 'outline';
      case 'completed': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const getPriorityVariant = (status: string) => {
    switch (status) {
      case 'urgent': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  if (bidRequests.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No bid requests found</h3>
          <p className="text-gray-500">
            Create your first bid request to get started with vendor management.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {bidRequests.map((bidRequest) => (
        <Card key={bidRequest.id} className="hover:shadow-md transition-shadow">
          <div 
            className="h-48 bg-cover bg-center rounded-t-lg"
            style={{ 
              backgroundImage: `url(${bidRequest.imageUrl || getCategoryImageUrl(bidRequest.category || '')})` 
            }}
          />
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg line-clamp-1">{bidRequest.title}</CardTitle>
              <div className="flex gap-1">
                <Badge variant={getStatusVariant(bidRequest.status)}>
                  {bidRequest.status}
                </Badge>
              </div>
            </div>
            <Badge variant={getPriorityVariant(bidRequest.priority)} className="w-fit">
              {bidRequest.priority} priority
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {bidRequest.description || 'No description provided'}
            </p>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>Budget:</span>
                </div>
                <span className="font-medium">
                  {bidRequest.budget ? 
                    formatCurrency(bidRequest.budget) : 
                    bidRequest.budget_range_min && bidRequest.budget_range_max ?
                      `${formatCurrency(bidRequest.budget_range_min)} - ${formatCurrency(bidRequest.budget_range_max)}` :
                      'Not specified'
                  }
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Due:</span>
                </div>
                <span className="font-medium">
                  {bidRequest.dueDate ? 
                    new Date(bidRequest.dueDate).toLocaleDateString() : 
                    bidRequest.bid_deadline ?
                      new Date(bidRequest.bid_deadline).toLocaleDateString() :
                      'No due date'
                  }
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>Vendors:</span>
                </div>
                <span className="font-medium">{bidRequest.vendors?.length || 0}</span>
              </div>
              
              {bidRequest.location && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>Location:</span>
                  </div>
                  <span className="font-medium line-clamp-1">{bidRequest.location}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default BidRequestList;
