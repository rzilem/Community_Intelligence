
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Calendar, FileText, Plus } from 'lucide-react';
import { BidRequestWithVendors } from '@/types/bid-request-types';
import { getBidRequests, getAllBidRequests } from '@/services/bid-requests/bid-request-api';
import { useAuth } from '@/contexts/auth';
import BidRequestCard from './BidRequestCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import AssociationSelector from '@/components/associations/AssociationSelector';

const BidRequestsList = () => {
  const [bidRequests, setBidRequests] = useState<BidRequestWithVendors[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all-status');
  const [priorityFilter, setPriorityFilter] = useState('all-priority');
  const [selectedAssociationId, setSelectedAssociationId] = useState<string>('');
  const { currentAssociation, setCurrentAssociation } = useAuth();

  useEffect(() => {
    const fetchBidRequests = async () => {
      console.log('=== FETCHING BID REQUESTS ===');
      console.log('Selected association ID:', selectedAssociationId);
      
      setLoading(true);
      try {
        let requests: BidRequestWithVendors[];
        
        if (selectedAssociationId === 'all') {
          console.log('Fetching bid requests for all associations');
          requests = await getAllBidRequests();
        } else if (selectedAssociationId) {
          console.log('Fetching bid requests for association:', selectedAssociationId);
          requests = await getBidRequests(selectedAssociationId);
        } else if (currentAssociation?.id) {
          console.log('Fetching bid requests for current association:', currentAssociation.id);
          requests = await getBidRequests(currentAssociation.id);
        } else {
          console.log('No association selected, skipping fetch');
          setLoading(false);
          return;
        }
        
        console.log('Fetched bid requests:', requests);
        setBidRequests(requests);
      } catch (error) {
        console.error('Error fetching bid requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBidRequests();
  }, [selectedAssociationId, currentAssociation?.id]);

  // Initialize selected association ID when component mounts
  useEffect(() => {
    if (currentAssociation?.id && !selectedAssociationId) {
      setSelectedAssociationId(currentAssociation.id);
    }
  }, [currentAssociation?.id, selectedAssociationId]);

  const filteredBidRequests = bidRequests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all-status' || request.status === statusFilter;
    const matchesPriority = priorityFilter === 'all-priority' || request.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleAssociationChange = (associationId: string) => {
    console.log('Association changed to:', associationId);
    setSelectedAssociationId(associationId);
    
    // Only update currentAssociation if a specific association is selected (not "all")
    if (associationId !== 'all' && associationId !== '' && setCurrentAssociation) {
      setCurrentAssociation({ id: associationId } as any);
    }
  };

  // Show loading state if no association is selected and not viewing all
  if (!selectedAssociationId && !currentAssociation?.id) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Association Selected
          </h3>
          <p className="text-gray-500 mb-4">
            Please select an association to view bid requests.
          </p>
        </CardContent>
      </Card>
    );
  }

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

  const isViewingAll = selectedAssociationId === 'all';

  return (
    <div className="space-y-6">
      {/* Association Selector */}
      <div className="bg-white rounded-lg border p-4">
        <AssociationSelector
          onAssociationChange={handleAssociationChange}
          initialAssociationId={selectedAssociationId || currentAssociation?.id}
          label="Viewing Bid Requests for:"
          showAllOption={true}
        />
      </div>

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
            <SelectItem value="all-status">All Status</SelectItem>
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
            <SelectItem value="all-priority">All Priority</SelectItem>
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
            <BidRequestCard 
              key={bidRequest.id} 
              bidRequest={bidRequest} 
              showAssociation={isViewingAll}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || (statusFilter !== 'all-status') || (priorityFilter !== 'all-priority') ? 'No matching bid requests' : 'No bid requests yet'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || (statusFilter !== 'all-status') || (priorityFilter !== 'all-priority')
                ? 'Try adjusting your search or filters to find what you\'re looking for.'
                : isViewingAll
                ? 'No bid requests found across all your associations.'
                : 'Get started by creating your first bid request for a maintenance or improvement project.'
              }
            </p>
            {!searchTerm && statusFilter === 'all-status' && priorityFilter === 'all-priority' && !isViewingAll && (
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
