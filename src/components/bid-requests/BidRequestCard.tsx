
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, DollarSign, Edit, Trash2, Building } from 'lucide-react';
import { BidRequestWithVendors } from '@/types/bid-request-types';
import { formatCurrency, formatDate } from '@/lib/utils';

interface BidRequestCardProps {
  bidRequest: BidRequestWithVendors;
  onEdit?: (bidRequest: BidRequestWithVendors) => void;
  onDelete?: (id: string) => void;
  showAssociation?: boolean;
}

const BidRequestCard: React.FC<BidRequestCardProps> = ({
  bidRequest,
  onEdit,
  onDelete,
  showAssociation = false
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'published': return 'bg-blue-100 text-blue-800';
      case 'bidding': return 'bg-purple-100 text-purple-800';
      case 'evaluating': return 'bg-orange-100 text-orange-800';
      case 'awarded': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-emerald-100 text-emerald-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start mb-2">
          <CardTitle className="text-lg line-clamp-2">{bidRequest.title}</CardTitle>
          <div className="flex gap-2">
            <Badge className={getPriorityColor(bidRequest.priority)}>
              {bidRequest.priority}
            </Badge>
            <Badge className={getStatusColor(bidRequest.status)}>
              {bidRequest.status}
            </Badge>
          </div>
        </div>
        <CardDescription className="line-clamp-3">
          {bidRequest.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          {showAssociation && bidRequest.associations && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Building className="h-4 w-4" />
              <span className="font-medium">{bidRequest.associations.name}</span>
            </div>
          )}

          {bidRequest.location && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>{bidRequest.location}</span>
            </div>
          )}

          {(bidRequest.budget_range_min || bidRequest.budget_range_max) && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <DollarSign className="h-4 w-4" />
              <span>
                {bidRequest.budget_range_min && bidRequest.budget_range_max
                  ? `${formatCurrency(bidRequest.budget_range_min)} - ${formatCurrency(bidRequest.budget_range_max)}`
                  : bidRequest.budget_range_min
                  ? `From ${formatCurrency(bidRequest.budget_range_min)}`
                  : bidRequest.budget_range_max
                  ? `Up to ${formatCurrency(bidRequest.budget_range_max)}`
                  : 'Budget TBD'}
              </span>
            </div>
          )}

          {bidRequest.due_date && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>Due: {formatDate(bidRequest.due_date)}</span>
            </div>
          )}

          {bidRequest.vendors && bidRequest.vendors.length > 0 && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">{bidRequest.vendors.length}</span> vendor{bidRequest.vendors.length !== 1 ? 's' : ''} invited
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-4">
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(bidRequest)}
              className="flex-1"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          )}
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(bidRequest.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BidRequestCard;
