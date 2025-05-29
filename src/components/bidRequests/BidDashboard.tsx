import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Edit, Trash2, CheckCircle, XCircle, Clock, AlertTriangle, DollarSign, Calendar, Users } from 'lucide-react';

// Types defined inline
interface BidRequestSummary {
  id: string;
  title: string;
  hoa_id: string;
  status: string;
  priority: string;
  budget_range_min?: number;
  budget_range_max?: number;
  bid_deadline?: string;
  total_bids: number;
  lowest_bid?: number;
  highest_bid?: number;
  average_bid?: number;
  selected_vendor_id?: string;
  awarded_amount?: number;
  created_at: string;
  updated_at: string;
}

interface VendorBid {
  id: string;
  bid_request_id: string;
  vendor_id: string;
  bid_amount: number;
  proposed_timeline?: number;
  is_selected: boolean;
  evaluation_score?: number;
  status: string;
  submitted_at: string;
  vendor?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    rating?: number;
  };
}

interface BidDashboardProps {
  hoaId: string;
  currentUserId: string;
  onCreateNew: () => void;
  onViewDetails: (bidRequestId: string) => void;
  onEditRequest: (bidRequestId: string) => void;
  onDeleteRequest: (bidRequestId: string) => void;
  onSelectWinner: (bidId: string) => void;
}

const BidDashboard: React.FC<BidDashboardProps> = ({
  hoaId,
  currentUserId,
  onCreateNew,
  onViewDetails,
  onEditRequest,
  onDeleteRequest,
  onSelectWinner
}) => {
  const [bidRequests, setBidRequests] = useState<BidRequestSummary[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [vendorBids, setVendorBids] = useState<VendorBid[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    search: ''
  });

  useEffect(() => {
    loadBidRequests();
  }, [hoaId, filters]);

  useEffect(() => {
    if (selectedRequest) {
      loadVendorBids(selectedRequest);
    }
  }, [selectedRequest]);

  const loadBidRequests = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      const mockData: BidRequestSummary[] = [
        {
          id: '1',
          title: 'Pool Area Renovation',
          hoa_id: hoaId,
          status: 'bidding',
          priority: 'high',
          budget_range_min: 15000,
          budget_range_max: 25000,
          bid_deadline: '2024-02-15T17:00:00',
          total_bids: 3,
          lowest_bid: 18500,
          highest_bid: 24000,
          average_bid: 21250,
          created_at: '2024-01-15T10:00:00',
          updated_at: '2024-01-15T10:00:00'
        },
        {
          id: '2',
          title: 'Landscape Maintenance Contract',
          hoa_id: hoaId,
          status: 'evaluating',
          priority: 'medium',
          budget_range_min: 5000,
          budget_range_max: 8000,
          bid_deadline: '2024-02-10T17:00:00',
          total_bids: 5,
          lowest_bid: 5200,
          highest_bid: 7800,
          average_bid: 6400,
          created_at: '2024-01-10T10:00:00',
          updated_at: '2024-01-12T15:30:00'
        }
      ];
      
      let filteredData = mockData;
      
      if (filters.status !== 'all') {
        filteredData = filteredData.filter(req => req.status === filters.status);
      }
      
      if (filters.priority !== 'all') {
        filteredData = filteredData.filter(req => req.priority === filters.priority);
      }
      
      if (filters.search) {
        filteredData = filteredData.filter(req => 
          req.title.toLowerCase().includes(filters.search.toLowerCase())
        );
      }
      
      setBidRequests(filteredData);
    } catch (error) {
      console.error('Error loading bid requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadVendorBids = async (bidRequestId: string) => {
    try {
      // TODO: Replace with actual API call
      const mockBids: VendorBid[] = [
        {
          id: '1',
          bid_request_id: bidRequestId,
          vendor_id: '1',
          bid_amount: 18500,
          proposed_timeline: 30,
          is_selected: false,
          evaluation_score: 8,
          status: 'submitted',
          submitted_at: '2024-01-16T10:00:00',
          vendor: {
            id: '1',
            name: 'ABC Landscaping',
            email: 'john@abclandscaping.com',
            phone: '555-0101',
            rating: 4.5
          }
        },
        {
          id: '2',
          bid_request_id: bidRequestId,
          vendor_id: '2',
          bid_amount: 21000,
          proposed_timeline: 25,
          is_selected: false,
          evaluation_score: 7,
          status: 'submitted',
          submitted_at: '2024-01-17T14:30:00',
          vendor: {
            id: '2',
            name: 'XYZ Construction',
            email: 'mary@xyzconstruction.com',
            phone: '555-0102',
            rating: 4.2
          }
        }
      ];
      
      setVendorBids(mockBids);
    } catch (error) {
      console.error('Error loading vendor bids:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
      case 'bidding':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'evaluating':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'awarded':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bid Request Management</h1>
          <p className="text-gray-600 mt-1">Manage and track all your community bid requests</p>
        </div>
        <button
          onClick={onCreateNew}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Create New Bid Request
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          
          <div>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="bidding">Bidding</option>
              <option value="evaluating">Evaluating</option>
              <option value="awarded">Awarded</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <div>
            <select
              value={filters.priority}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">All Priority</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bid Requests List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-gray-900">Active Bid Requests</h2>
            </div>
            
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading...</p>
              </div>
            ) : bidRequests.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">No bid requests found</p>
              </div>
            ) : (
              <div className="divide-y">
                {bidRequests.map((request) => (
                  <div 
                    key={request.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      selectedRequest === request.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                    onClick={() => setSelectedRequest(request.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {getStatusIcon(request.status)}
                          <h3 className="font-medium text-gray-900">{request.title}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(request.priority)}`}>
                            {request.priority}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            ${request.budget_range_min?.toLocaleString()} - ${request.budget_range_max?.toLocaleString()}
                          </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {request.total_bids} bids
                          </div>
                          {request.bid_deadline && (
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(request.bid_deadline).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        
                        {request.total_bids > 0 && (
                          <div className="mt-2 text-sm">
                            <span className="text-gray-600">Bid range: </span>
                            <span className="font-medium">
                              ${request.lowest_bid?.toLocaleString()} - ${request.highest_bid?.toLocaleString()}
                            </span>
                            <span className="text-gray-600 ml-2">
                              (avg: ${request.average_bid?.toLocaleString()})
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex space-x-1 ml-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewDetails(request.id);
                          }}
                          className="p-2 text-gray-400 hover:text-gray-600"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditRequest(request.id);
                          }}
                          className="p-2 text-gray-400 hover:text-gray-600"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteRequest(request.id);
                          }}
                          className="p-2 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bid Details Panel */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-gray-900">
              {selectedRequest ? 'Vendor Bids' : 'Select a Bid Request'}
            </h2>
          </div>
          
          {selectedRequest ? (
            <div className="p-4">
              {vendorBids.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No bids submitted yet</p>
              ) : (
                <div className="space-y-4">
                  {vendorBids.map((bid) => (
                    <div key={bid.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">{bid.vendor?.name}</h4>
                          <p className="text-sm text-gray-600">{bid.vendor?.email}</p>
                          {bid.vendor?.rating && (
                            <div className="text-sm text-yellow-600 mt-1">
                              Rating: {bid.vendor.rating}/5
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-gray-900">
                            ${bid.bid_amount.toLocaleString()}
                          </div>
                          {bid.proposed_timeline && (
                            <div className="text-sm text-gray-600">
                              {bid.proposed_timeline} days
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm">
                          {bid.evaluation_score && (
                            <span className="text-gray-600">
                              Score: {bid.evaluation_score}/10
                            </span>
                          )}
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            bid.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            bid.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {bid.status}
                          </span>
                        </div>
                        
                        {!bid.is_selected && bid.status === 'submitted' && (
                          <button
                            onClick={() => onSelectWinner(bid.id)}
                            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Select Winner
                          </button>
                        )}
                        
                        {bid.is_selected && (
                          <span className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded font-medium">
                            Selected Winner
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <Users className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p>Select a bid request to view vendor bids</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BidDashboard;
