
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Calendar, FileText, Plus } from 'lucide-react';
import { BidRequestWithVendors } from '@/types/bid-request-types';
import { getBidRequests } from '@/services/bid-requests/bid-request-api';
import { useAuth } from '@/contexts/auth';
import BidRequestCard from './BidRequestCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';

const BidRequestsList = () => {
  const [bidRequests, setBidRequests] = useState<BidRequestWithVendors[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const { profile } = useAuth();

  useEffect(() => {
    const fetchBidRequests = async () => {
      if (!profile?.association_id) return;
      
      setLoading(true);
      try {
        const requests = await getBidRequests(profile.association_id);
        setBidRequests(requests);
      } catch (error) {
        console.error('Error fetching bid requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBidRequests();
  }, [profile?.association_id]);

  const filteredBidRequests = bidRequests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || request.status === statusFilter;
    const matchesPriority = !priorityFilter || request.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search bid requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="bidding">Bidding</SelectItem>
            <SelectItem value="evaluating">Evaluating</SelectItem>
            <SelectItem value="awarded">Awarded</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="All Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Priority</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bid Requests Grid */}
      {filteredBidRequests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBidRequests.map((bidRequest) => (
            <BidRequestCard key={bidRequest.id} bidRequest={bidRequest} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || statusFilter || priorityFilter ? 'No matching bid requests' : 'No bid requests yet'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter || priorityFilter 
                ? 'Try adjusting your search or filters to find what you\'re looking for.'
                : 'Get started by creating your first bid request for a maintenance or improvement project.'
              }
            </p>
            {!searchTerm && !statusFilter && !priorityFilter && (
              <Link to="/community-management/create-bid-request">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Bid Request
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BidRequestsList;
