
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, DollarSign, Users, MapPin, MoreHorizontal } from 'lucide-react';
import { BidRequestWithVendors } from '@/types/bid-request-types';
import { formatCurrency } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface BidRequestCardProps {
  bidRequest: BidRequestWithVendors;
}

const BidRequestCard: React.FC<BidRequestCardProps> = ({ bidRequest }) => {
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

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg line-clamp-1">{bidRequest.title}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={getStatusVariant(bidRequest.status)}>
                {bidRequest.status}
              </Badge>
              <Badge variant={getPriorityVariant(bidRequest.priority)}>
                {bidRequest.priority}
              </Badge>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Details</DropdownMenuItem>
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {bidRequest.description || 'No description provided'}
        </p>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Budget:</span>
          </div>
          <div className="text-right">
            {bidRequest.budget_range_min && bidRequest.budget_range_max ? (
              <span>{formatCurrency(bidRequest.budget_range_min)} - {formatCurrency(bidRequest.budget_range_max)}</span>
            ) : bidRequest.budget ? (
              <span>{formatCurrency(bidRequest.budget)}</span>
            ) : (
              <span className="text-muted-foreground">Not specified</span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Due:</span>
          </div>
          <div className="text-right">
            {formatDate(bidRequest.bid_deadline || bidRequest.due_date)}
          </div>
          
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Vendors:</span>
          </div>
          <div className="text-right">
            {bidRequest.vendors?.length || 0}
          </div>
          
          {bidRequest.location && (
            <>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Location:</span>
              </div>
              <div className="text-right line-clamp-1">
                {bidRequest.location}
              </div>
            </>
          )}
        </div>
        
        <div className="pt-2 border-t">
          <Button className="w-full" size="sm">
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BidRequestCard;
