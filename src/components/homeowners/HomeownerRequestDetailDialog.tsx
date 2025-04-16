
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HomeownerRequest } from '@/types/homeowner-request-types';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/date-utils';

interface HomeownerRequestDetailDialogProps {
  request: HomeownerRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const HomeownerRequestDetailDialog: React.FC<HomeownerRequestDetailDialogProps> = ({ 
  request, 
  open, 
  onOpenChange 
}) => {
  if (!request) return null;
  
  const renderStatusBadge = (status: string) => {
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

  const renderPriorityBadge = (priority: string) => {
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
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Request Details: {request.title}</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="details" className="flex-1">
          <TabsList>
            <TabsTrigger value="details">Request Information</TabsTrigger>
            <TabsTrigger value="original">Original Email</TabsTrigger>
            <TabsTrigger value="updates">Status Updates</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="flex-1 overflow-hidden">
            <ScrollArea className="h-[60vh]">
              <div className="space-y-4 p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg">Request Details</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-muted-foreground">Title:</div>
                      <div className="font-medium">{request.title}</div>
                      
                      <div className="text-muted-foreground">Type:</div>
                      <div className="capitalize">{request.type}</div>
                      
                      <div className="text-muted-foreground">Status:</div>
                      <div>{renderStatusBadge(request.status)}</div>
                      
                      <div className="text-muted-foreground">Priority:</div>
                      <div>{renderPriorityBadge(request.priority)}</div>
                      
                      <div className="text-muted-foreground">Created:</div>
                      <div>{formatDate(request.created_at)}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg">Property Information</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-muted-foreground">Property ID:</div>
                      <div>{request.property_id}</div>
                      
                      <div className="text-muted-foreground">Association ID:</div>
                      <div>{request.association_id}</div>
                      
                      <div className="text-muted-foreground">Resident ID:</div>
                      <div>{request.resident_id || 'N/A'}</div>
                      
                      <div className="text-muted-foreground">Assigned To:</div>
                      <div>{request.assigned_to || 'Unassigned'}</div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Description</h3>
                  <div className="border rounded-md p-4 whitespace-pre-wrap">
                    {request.description}
                  </div>
                </div>
                
                {request.resolved_at && (
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg">Resolution</h3>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="text-muted-foreground">Resolved At:</div>
                      <div>{formatDate(request.resolved_at)}</div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="original" className="flex-1 overflow-hidden">
            <ScrollArea className="h-[60vh]">
              <div className="p-4">
                <div className="border rounded-md p-4">
                  <h3 className="font-medium text-lg mb-4">Original Request Email</h3>
                  {request.html_content ? (
                    <iframe 
                      srcDoc={request.html_content} 
                      title="Original Email" 
                      className="w-full h-[50vh]" 
                      sandbox="allow-same-origin"
                    />
                  ) : (
                    <div className="p-4 text-muted-foreground">No HTML content available for this request.</div>
                  )}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="updates" className="flex-1 overflow-hidden">
            <ScrollArea className="h-[60vh]">
              <div className="p-4">
                <div className="border rounded-md p-4">
                  <h3 className="font-medium text-lg mb-4">Status Updates</h3>
                  {/* This would be populated with status updates in a real implementation */}
                  <div className="text-muted-foreground">No status updates available.</div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button 
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default HomeownerRequestDetailDialog;
