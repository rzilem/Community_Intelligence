import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, MoreHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { bidRequestService } from '@/services/bidRequestService';
import { BidRequestSummary } from '@/types/bid-request-types';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

interface BidRequestsProps {
  associationId: string;
}

const BidRequests: React.FC<BidRequestsProps> = ({ associationId }) => {
  const [bidRequests, setBidRequests] = useState<BidRequestSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchBidRequests = async () => {
      setLoading(true);
      try {
        const filters = {
          status: statusFilter,
          priority: priorityFilter
        };
        const requests = await bidRequestService.getBidRequests(associationId, filters);
        setBidRequests(requests);
      } catch (error) {
        console.error('Error fetching bid requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBidRequests();
  }, [associationId, statusFilter, priorityFilter]);

  const filteredBidRequests = bidRequests.filter(request =>
    request.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">Bid Requests</CardTitle>
            <CardDescription>Manage and view all bid requests for your community.</CardDescription>
          </div>
          <Link to="/community-management/create-bid-request">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Bid Request
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search bid requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded-md px-3 py-2"
              >
                <option value="">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="bidding">Bidding</option>
                <option value="evaluating">Evaluating</option>
                <option value="awarded">Awarded</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="border rounded-md px-3 py-2"
              >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          {loading ? (
            <p>Loading bid requests...</p>
          ) : filteredBidRequests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBidRequests.map(request => (
                <Card key={request.id} className="shadow-md">
                  <CardHeader>
                    <CardTitle>{request.title}</CardTitle>
                    <CardDescription>
                      <Badge variant="secondary">{request.status}</Badge>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Priority: {request.priority}</p>
                    <p>Budget: ${request.budget_range_min} - ${request.budget_range_max}</p>
                    <p>Bid Deadline: {request.bid_deadline}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p>No bid requests found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BidRequests;
