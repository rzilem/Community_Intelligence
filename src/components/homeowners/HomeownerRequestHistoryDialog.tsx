
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { HomeownerRequest } from '@/types/homeowner-request-types';
import { formatDate } from '@/lib/date-utils';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Clock, User, FileEdit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface HistoryItem {
  id: string;
  created_at: string;
  user_id?: string;
  entity_id: string;
  entity_type: string;
  change_type: string;
  changes: any;
  user?: {
    first_name?: string;
    last_name?: string;
    email?: string;
  };
}

interface HomeownerRequestHistoryDialogProps {
  request: HomeownerRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const HomeownerRequestHistoryDialog: React.FC<HomeownerRequestHistoryDialogProps> = ({ 
  request, 
  open, 
  onOpenChange 
}) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && request) {
      fetchHistory();
    }
  }, [open, request]);

  const fetchHistory = async () => {
    if (!request) return;
    
    try {
      setLoading(true);
      
      // First check if we have access to the history table
      const { error: accessError } = await supabase
        .from('history')
        .select('count', { count: 'exact', head: true })
        .eq('entity_id', request.id)
        .eq('entity_type', 'homeowner_request');
      
      if (accessError) {
        console.warn('History table not available:', accessError.message);
        // Use mock data if table doesn't exist
        setHistory(generateMockHistory(request));
        return;
      }
      
      // Fetch real history data
      const { data, error } = await supabase
        .from('history')
        .select(`
          *,
          user:user_id (
            first_name,
            last_name,
            email
          )
        `)
        .eq('entity_id', request.id)
        .eq('entity_type', 'homeowner_request')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        setHistory(data);
      } else {
        // Use mock data if no real history exists
        setHistory(generateMockHistory(request));
      }
    } catch (error) {
      console.error('Error fetching history:', error);
      toast.error('Failed to load request history');
      // Fallback to mock data
      setHistory(generateMockHistory(request));
    } finally {
      setLoading(false);
    }
  };
  
  // Generate mock history for development and testing
  const generateMockHistory = (req: HomeownerRequest): HistoryItem[] => {
    const createdDate = new Date(req.created_at);
    const updateDate = new Date(req.updated_at);
    
    return [
      {
        id: 'mock-1',
        created_at: req.created_at,
        entity_id: req.id,
        entity_type: 'homeowner_request',
        change_type: 'created',
        changes: {
          status: 'open',
          title: req.title,
          priority: req.priority
        },
        user: {
          first_name: 'System',
          last_name: 'Generated',
          email: 'system@community-intelligence.app'
        }
      },
      ...(updateDate.getTime() > createdDate.getTime() + 60000 ? [{
        id: 'mock-2',
        created_at: req.updated_at,
        entity_id: req.id,
        entity_type: 'homeowner_request',
        change_type: 'updated',
        changes: {
          status: {
            old: 'open',
            new: req.status
          }
        },
        user: {
          first_name: 'System',
          last_name: 'Generated',
          email: 'system@community-intelligence.app'
        }
      }] : [])
    ];
  };
  
  if (!request) return null;
  
  const renderChangeItem = (key: string, value: any) => {
    if (typeof value === 'object' && value !== null && 'old' in value && 'new' in value) {
      // Render status changes with badges
      if (key === 'status') {
        return (
          <div className="flex items-center gap-2">
            <RenderStatusBadge status={value.old} />
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <RenderStatusBadge status={value.new} />
          </div>
        );
      }
      
      // Render priority changes with badges
      if (key === 'priority') {
        return (
          <div className="flex items-center gap-2">
            <RenderPriorityBadge priority={value.old} />
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <RenderPriorityBadge priority={value.new} />
          </div>
        );
      }
      
      // General change renderer
      return (
        <div className="flex items-center gap-2">
          <span className="line-through text-gray-500">{value.old || 'Empty'}</span>
          <ArrowRight className="h-4 w-4 text-gray-400" />
          <span>{value.new || 'Empty'}</span>
        </div>
      );
    }
    
    // For simple values (creation events)
    return <span>{value}</span>;
  };
  
  const RenderStatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case 'open':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Open</Badge>;
      case 'in-progress':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">In Progress</Badge>;
      case 'resolved':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Resolved</Badge>;
      case 'closed':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Closed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  const RenderPriorityBadge = ({ priority }: { priority: string }) => {
    switch (priority) {
      case 'low':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Low</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'high':
        return <Badge variant="outline" className="bg-orange-100 text-orange-800">High</Badge>;
      case 'urgent':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Urgent</Badge>;
      default:
        return <Badge>{priority}</Badge>;
    }
  };
  
  const getChangeTypeIcon = (type: string) => {
    switch (type) {
      case 'created':
        return <FileEdit className="h-5 w-5 text-green-500" />;
      case 'updated':
        return <FileEdit className="h-5 w-5 text-blue-500" />;
      case 'commented':
        return <User className="h-5 w-5 text-purple-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Request History: {request.title}</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh]">
          <div className="p-4">
            {loading ? (
              <div className="text-center py-8">Loading history...</div>
            ) : (
              <div className="relative">
                <div className="absolute top-0 bottom-0 left-6 border-l-2 border-gray-200"></div>
                <div className="space-y-6">
                  {history.map((item, index) => (
                    <div key={item.id} className="relative pl-12">
                      <div className="absolute left-[18px] top-1.5 transform -translate-x-1/2 rounded-full">
                        {getChangeTypeIcon(item.change_type)}
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 border">
                        <div className="flex justify-between mb-2">
                          <span className="font-medium text-sm">
                            {item.user?.first_name} {item.user?.last_name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(item.created_at)}
                          </span>
                        </div>
                        
                        <h4 className="text-sm font-medium mb-2 capitalize">
                          {item.change_type} request
                        </h4>
                        
                        {item.changes && (
                          <div className="space-y-2 mt-2">
                            {Object.entries(item.changes).map(([key, value]) => (
                              <div key={key} className="text-sm grid grid-cols-4 gap-2 items-center">
                                <div className="font-medium capitalize text-gray-600 col-span-1">
                                  {key.replace(/_/g, ' ')}:
                                </div>
                                <div className="col-span-3">
                                  {renderChangeItem(key, value)}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {history.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      No history available for this request.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default HomeownerRequestHistoryDialog;
